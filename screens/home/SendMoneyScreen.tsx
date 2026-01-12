import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Animated,
  Pressable,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import LinearGradient from 'react-native-linear-gradient';
import { supabase } from '../../utils/supabaseClient';
import { useUser } from '../../utils/UserContext';
import ScreenWrapper from '../../utils/ScreenWrapper';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';

const screenWidth = Dimensions.get('window').width;

// --- POP BUTTON COMPONENT ---
const PopButton = ({ onPress, children, style, disabled }: any) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
      style={style}
    >
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default function TradesScreen() {
  const { user, setUser } = useUser();
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [endingTrade, setEndingTrade] = useState<number | null>(null);
  const [chartData, setChartData] = useState<number[]>([
    100, 102, 101, 103, 105,
  ]);

  const fetchUserData = async () => {
    const { data, error } = await supabase
      .from('users')
      .select(
        'withdrawal_amount, profileImage, username, account_number, level_income, subscription_bonus',
      )
      .eq('id', user.id)
      .single();
    if (!error && data) setUser({ ...user, ...data });
  };

  const fetchTrades = async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('deposits')
      .select('id, amount, created_at, trade_status')
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .eq('trade_status', 'running')
      .order('created_at', { ascending: false });
    if (error) Alert.alert('Error', error.message);
    else {
      const initialized = (data || []).map(t => ({
        ...t,
        liveAmount: t.amount,
        trend: 'up',
      }));
      setTrades(initialized);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserData();
    fetchTrades();
  }, [user?.id]);

  // 1️⃣ Chart Animation: Only runs if there are active trades
  const hasActiveTrades = trades.length > 0;

  useEffect(() => {
    if (!hasActiveTrades) return; // Stop animation if no trades

    const interval = setInterval(() => {
      setChartData(prev => {
        const next = [...prev.slice(-29)];
        const last = prev[prev.length - 1] || 100;
        const change = (Math.random() * 2 - 1).toFixed(2);
        next.push(Math.max(50, last + Number(change)));
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [hasActiveTrades]); // Dependency ensures toggle based on trade existence

  // 2️⃣ Trade Value Simulation
  useEffect(() => {
    if (!hasActiveTrades) return;

    const interval = setInterval(() => {
      setTrades(prev =>
        prev.map(t => {
          const change = (Math.random() * 20 - 10).toFixed(2);
          const newAmount = Math.max(0, t.liveAmount + Number(change));
          return {
            ...t,
            liveAmount: newAmount,
            trend: Number(change) >= 0 ? 'up' : 'down',
          };
        }),
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [hasActiveTrades]);

  const endTrade = (tradeId: number) => {
    Alert.alert(
      'Restricted Action',
      'Trades are live can not be closed at this moment',
    );
  };

  return (
    <ScreenWrapper>
      <SafeAreaView style={styles.safeArea}>
        {/* Removed refreshControl prop */}
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* 1️⃣ Chart Section */}
            <View style={styles.middleContainer}>
              <LinearGradient
                colors={['rgba(123, 0, 148, 0)', 'rgba(0,0,0,0)']}
                style={styles.chartBackground}
              >
                <LineChart
                  data={{
                    labels: [],
                    datasets: [{ data: chartData }],
                  }}
                  width={screenWidth}
                  height={220}
                  withDots={false}
                  withInnerLines={false}
                  withOuterLines={false}
                  withVerticalLines={false}
                  withHorizontalLabels={true}
                  yAxisInterval={1}
                  chartConfig={{
                    backgroundGradientFrom: '#000',
                    backgroundGradientFromOpacity: 0,
                    backgroundGradientTo: '#000',
                    backgroundGradientToOpacity: 0,
                    fillShadowGradientFrom: '#ff00d4',
                    fillShadowGradientTo: '#7b0094',
                    fillShadowGradientOpacity: 0.6,
                    color: (opacity = 1) => `rgba(255, 0, 212, ${opacity})`, // Neon Pink Line
                    labelColor: (opacity = 1) =>
                      `rgba(255, 255, 255, ${opacity})`,
                    strokeWidth: 2,
                    propsForBackgroundLines: {
                      stroke: 'transparent',
                    },
                  }}
                  bezier
                  style={{
                    paddingRight: 0,
                    paddingLeft: 0,
                  }}
                />
              </LinearGradient>

              {/* 🟩 Horizontal Info Containers */}
              <View style={styles.infoRow}>
                {/* Level Income */}
                <View style={styles.infoCard}>
                  <Text style={styles.infoTitle}>Level Income</Text>
                  <Text style={styles.infoValue}>
                    ${user?.level_income || 0}
                  </Text>
                </View>

                {/* Total Profit */}
                <View style={styles.infoCard}>
                  <Text style={styles.infoTitle}>Total Profit</Text>
                  <Text style={styles.infoValue}>
                    ${user?.withdrawal_amount || 0}
                  </Text>
                </View>
              </View>
            </View>

            {/* 2️⃣ Running Trades Section */}
            <View style={styles.thirdContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.transactionsTitle}>Running Trades</Text>
                {/* Indicator only shows if trades are active */}
                {hasActiveTrades && <View style={styles.liveIndicator} />}
              </View>

              {loading ? (
                <ActivityIndicator size="large" color="#ff00d4" />
              ) : trades.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.noTrades}>No Active Trades</Text>
                </View>
              ) : (
                <ScrollView
                  style={{ width: '100%', height: vs(300) }}
                  // Added padding to contentContainerStyle to prevent tab bar overlap
                  contentContainerStyle={{ paddingBottom: vs(200) }}
                  showsVerticalScrollIndicator={false}
                >
                  {trades.map(trade => (
                    <LinearGradient
                      key={trade.id}
                      colors={[
                        'rgba(20, 20, 30, 0.8)',
                        'rgba(123, 0, 148, 0.2)',
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.tradeCard}
                    >
                      <View>
                        <Text style={styles.amount}>USDT {trade.amount}</Text>
                        <View style={styles.trendContainer}>
                          <Text
                            style={[
                              styles.liveAmount,
                              {
                                color:
                                  trade.trend === 'up' ? '#00ff88' : '#ff3366',
                              },
                            ]}
                          >
                            {trade.trend === 'up' ? '▲' : '▼'} $
                            {trade.liveAmount.toFixed(2)}
                          </Text>
                        </View>
                      </View>

                      {/* Close Button with Pop Effect */}
                      <PopButton
                        onPress={() => endTrade(trade.id)}
                        disabled={endingTrade === trade.id}
                      >
                        <LinearGradient
                          colors={['#7b0094', '#ff00d4']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[
                            styles.endButton,
                            endingTrade === trade.id && { opacity: 0.6 },
                          ]}
                        >
                          <Text style={styles.endText}>
                            {endingTrade === trade.id
                              ? 'Closing...'
                              : 'Close Trade'}
                          </Text>
                        </LinearGradient>
                      </PopButton>
                    </LinearGradient>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenWrapper>
  );
}

/* --------------------------- STYLES --------------------------- */
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: vs(5),
  },

  /* Chart + Info Section */
  middleContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: vs(30),
  },
  chartBackground: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: vs(10),
  },

  /* Horizontal Info Row */
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '92%',
    marginTop: vs(-20), // Pull up to overlap chart slightly
    zIndex: 10,
  },
  infoCard: {
    flex: 1,
    borderRadius: ms(25),
    paddingVertical: vs(8),
    marginHorizontal: s(6),
    alignItems: 'center',
    backgroundColor: 'rgba(163, 0, 155, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 170, 0.43)', // Pink border
  },
  infoTitle: {
    color: '#rgba(255,255,255,0.7)',
    fontSize: ms(12),
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: vs(4),
  },
  infoValue: {
    color: '#fff',
    fontSize: ms(22),
    fontWeight: '800',
  },

  /* Bottom Trades Section */
  thirdContainer: {
    width: '92%',
    flex: 1,
    marginTop: vs(25),
    // Removed general paddingBottom here, added to the inner ScrollView instead
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(15),
    justifyContent: 'center',
  },
  transactionsTitle: {
    fontSize: ms(20),
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  liveIndicator: {
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
    backgroundColor: '#00ff88',
    marginLeft: s(8),
    shadowColor: '#00ff88',
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
  },

  /* Trade Card */
  tradeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: ms(25),
    padding: s(16),
    marginBottom: vs(12),
    borderWidth: 1,
    borderColor: 'rgba(123, 0, 148, 0.5)', // Purple border
  },
  amount: {
    fontSize: ms(18),
    fontWeight: '700',
    color: '#fff',
    marginBottom: vs(4),
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveAmount: {
    fontSize: ms(14),
    fontWeight: '600',
  },

  /* Buttons */
  endButton: {
    borderRadius: ms(25), // Pill shape
    paddingVertical: vs(8),
    paddingHorizontal: s(20),
    shadowColor: '#ff00d4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  endText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: ms(13),
    textTransform: 'uppercase',
  },

  /* Empty States */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: vs(30),
  },
  noTrades: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: ms(16),
    fontWeight: '500',
  },
});