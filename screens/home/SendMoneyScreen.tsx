import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { supabase } from '../../utils/supabaseClient';
import { useUser } from '../../utils/UserContext';
import ScreenWrapper from '../../utils/ScreenWrapper';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';

const screenWidth = Dimensions.get('window').width;

export default function TradesScreen() {
  const { user, setUser } = useUser();
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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

  // 🔁 Simulate live chart data
  useEffect(() => {
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
  }, []);

  // 🔁 Simulate live trade value updates
  useEffect(() => {
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
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserData();
    await fetchTrades();
    setRefreshing(false);
  }, [user?.id]);

  const endTrade = async (tradeId: number) => {
    Alert.alert('Confirm', 'Are you sure you want to end this trade?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End',
        onPress: async () => {
          setEndingTrade(tradeId);
          const { error } = await supabase.rpc('end_trade', {
            trade_id: tradeId,
          });
          if (error) Alert.alert('Error', error.message);
          else {
            Alert.alert('Success', 'Trade ended successfully!');
            fetchTrades();
          }
          setEndingTrade(null);
        },
      },
    ]);
  };

  return (
    <ScreenWrapper>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            
            {/* 1️⃣ Chart Section (Moved Up) */}
            <View style={styles.middleContainer}>
              <LineChart
                data={{
                  labels: [],
                  datasets: [{ data: chartData }],
                }}
                width={screenWidth}
                height={220} // Slightly taller chart
                withDots={false}
                withInnerLines={false}
                withOuterLines={false}
                withVerticalLines={false}
                withHorizontalLabels={true}
                chartConfig={{
                  backgroundGradientFrom: 'transparent',
                  backgroundGradientTo: 'transparent',
                  color: () => '#00ffff',
                  strokeWidth: 3,
                  propsForBackgroundLines: {
                    stroke: 'transparent',
                  },
                }}
                bezier
              />

              {/* 🟩 Horizontal Info Containers (Level Income + Total Profit) */}
              <View style={styles.infoRow}>
                {/* Level Income */}
                <View style={styles.infoCard}>
                  <Text style={styles.infoTitle}>Level Income</Text>
                  <Text style={styles.infoValue}>
                    ${user?.level_income || 0}
                  </Text>
                </View>
                
                {/* Total Profit (Replaced Subscription Bonus) */}
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
              <Text style={styles.transactionsTitle}>Running Trades</Text>

              {loading ? (
                <ActivityIndicator size="large" color="#00c6ff" />
              ) : trades.length === 0 ? (
                <Text style={styles.noTrades}>No running trades found</Text>
              ) : (
                <ScrollView
                  style={{ width: '100%' }}
                  showsVerticalScrollIndicator={false}
                >
                  {trades.map(trade => (
                    <View key={trade.id} style={styles.tradeCard}>
                      <View>
                        <Text style={styles.amount}>USDT {trade.amount}</Text>
                        <Text
                          style={[
                            styles.liveAmount,
                            {
                              color:
                                trade.trend === 'up' ? '#48ff00ff' : '#ff0000ff',
                            },
                          ]}
                        >
                          {trade.trend === 'up' ? '▲' : '▼'}$
                          {trade.liveAmount.toFixed(2)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.endButton,
                          endingTrade === trade.id && { opacity: 0.6 },
                        ]}
                        onPress={() => endTrade(trade.id)}
                        disabled={endingTrade === trade.id}
                      >
                        <Text style={styles.endText}>
                          {endingTrade === trade.id ? 'Ending...' : 'End Trade'}
                        </Text>
                      </TouchableOpacity>
                    </View>
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
  container: { flex: 1, alignItems: 'center', paddingVertical: vs(5) },

  /* Chart + Info Section */
  middleContainer: {
    width: '97%',
    height: '45%', // Adjusted height since top header is gone
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: ms(20),
    marginTop: vs(20), // Added top margin
    //marginBottom: vs(5),
    backgroundColor: 'rgba(0, 10, 20, 0)',
  },

  /* Horizontal Info Row */
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '94%',
    marginTop: vs(10),
  },
  infoCard: {
    flex: 1,
    backgroundColor: 'rgba(0, 255, 255, 0.08)', // Slightly brighter bg for visibility
    borderRadius: ms(10),
    paddingVertical: vs(5),
    marginHorizontal: s(6),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  infoTitle: {
    color: '#00ffff',
    fontSize: ms(14),
    fontWeight: '600',
    opacity: 0.8,
  },
  infoValue: {
    color: '#fff',
    fontSize: ms(20),
    fontWeight: 'bold',
    marginTop: vs(2),
  },

  /* Bottom Trades Section */
  thirdContainer: {
    width: '97%',
    height: '50%', // Fill remaining space
    borderRadius: ms(12),
    padding: s(10),
  },
  transactionsTitle: {
    fontSize: ms(18),
    fontWeight: 'bold',
    color: '#00ffff',
    marginBottom: vs(10),
    marginLeft: s(5),
  },
  tradeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: ms(10),
    padding: s(12),
    marginBottom: vs(10),
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.15)',
  },
  amount: { fontSize: ms(17), fontWeight: 'bold', color: '#fff' },
  liveAmount: { fontSize: ms(14), fontWeight: '600' },
  endButton: {
    backgroundColor: 'rgba(255, 17, 0, 0.15)',
    borderRadius: ms(8),
    paddingVertical: ms(8),
    paddingHorizontal: s(16),
    borderWidth: 1,
    borderColor: '#ff3300ff',
  },
  endText: { color: '#fff', fontWeight: 'bold', fontSize: ms(15) },
  noTrades: {
    color: '#aaa',
    fontSize: ms(15),
    textAlign: 'center',
    marginTop: vs(20),
  },
});