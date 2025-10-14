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
} from 'react-native';
import { supabase } from '../../utils/supabaseClient';
import { useUser } from '../../utils/UserContext';
import ScreenWrapper from '../../utils/ScreenWrapper';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';

export default function TradesScreen() {
  const { user, setUser } = useUser();
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [endingTrade, setEndingTrade] = useState<number | null>(null);

  const fetchUserData = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('withdrawal_amount, profileImage, username, account_number')
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
      // Initialize with random trade fluctuation data
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

  // Update live amounts randomly every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTrades(prev =>
        prev.map(t => {
          const change = (Math.random() * 20 - 10).toFixed(2); // ±10 range
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
            {/* 1️⃣ Top Section – Total Profit */}
            <View style={styles.secondContainerWrapper}>
              <View style={styles.balanceOverlay}>
                <Text style={styles.balanceSubHeader}>Total Profit</Text>
                <Text style={styles.balanceAmount}>
                  ${user?.withdrawal_amount || '0'}
                </Text>
              </View>
            </View>

            {/* 2️⃣ Middle Grey Container */}
            <View style={styles.middleContainer}>
              <Text style={styles.greyPlaceholder}>— Reserved Section —</Text>
            </View>

            {/* 3️⃣ Running Trades Section */}
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
                        <Text style={styles.amount}>${trade.amount}</Text>
                        <Text
                          style={[
                            styles.liveAmount,
                            {
                              color: trade.trend === 'up' ? 'green' : 'red',
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

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: vs(5),
  },

  /* Top Section */
  secondContainerWrapper: {
    width: '97%',
    height: '15%',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: vs(10),
    borderRadius: ms(20),
    backgroundColor: '#000',
    shadowColor: 'rgba(40, 0, 85, 1)',
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 1,
    shadowRadius: ms(10),
    elevation: 10,
    borderColor: '#00c6ff',
    borderWidth: ms(1),
  },
  balanceOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: s(20),
  },
  balanceSubHeader: { fontSize: ms(16), color: '#e2faff' },
  balanceAmount: {
    fontSize: ms(46),
    fontWeight: 'bold',
    color: '#fff',
    //marginTop: vs(6),
  },

  /* Middle Grey Container */
  middleContainer: {
    width: '97%',
    height: '30%',
    backgroundColor: 'rgba(200,200,200,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: ms(20),
    marginTop: vs(20),
  },
  greyPlaceholder: {
    color: '#ccc',
    fontSize: ms(14),
  },

  /* Bottom Trades Section */
  thirdContainer: {
    width: '97%',
    height: '42%',
    borderRadius: ms(12),
    padding: s(10),
    marginTop: vs(20),
  },
  transactionsTitle: {
    fontSize: ms(18),
    fontWeight: 'bold',
    color: '#00c6ff',
    marginBottom: vs(10),
  },
  tradeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: ms(10),
    padding: s(12),
    marginBottom: vs(10),
  },
  amount: {
    fontSize: ms(17),
    fontWeight: 'bold',
    color: '#fff',
  },
  liveAmount: {
    fontSize: ms(14),
    fontWeight: '600',
    //marginTop: vs(4),
  },
  endButton: {
    backgroundColor: '#6c4994ff',
    borderRadius: ms(8),
    paddingVertical: ms(8),
    paddingHorizontal: s(16),
  },
  endText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: ms(15),
  },
  noTrades: {
    color: '#aaa',
    fontSize: ms(15),
    textAlign: 'center',
    marginTop: vs(20),
  },
});
