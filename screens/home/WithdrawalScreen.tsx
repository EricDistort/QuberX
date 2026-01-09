import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';
import ScreenWrapper from '../../utils/ScreenWrapper';
import { useUser } from '../../utils/UserContext';
import { supabase } from '../../utils/supabaseClient';

export default function WithdrawalScreen() {
  const { user, setUser } = useUser(); // Added setUser to update local balance
  const [wallet, setWallet] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch updated user balance (Crucial for accurate validation)
  const fetchUserBalance = async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from('users')
      .select('withdrawal_amount')
      .eq('id', user.id)
      .single();
    if (data && !error) {
      setUser({ ...user, withdrawal_amount: data.withdrawal_amount });
    }
  };

  const fetchWithdrawals = async () => {
    if (!user?.id) return;
    setLoadingWithdrawals(true);
    const { data, error } = await supabase
      .from('withdrawals')
      .select('id, receiving_wallet, amount, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(15);

    if (!error) setWithdrawals(data || []);
    setLoadingWithdrawals(false);
  };

  useEffect(() => {
    fetchWithdrawals();
    fetchUserBalance(); // Fetch fresh balance on load
  }, [user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchWithdrawals(), fetchUserBalance()]);
    setRefreshing(false);
  }, [user?.id]);

  const submitWithdrawal = async () => {
    const withdrawalAmount = parseFloat(amount);

    // 1. Basic Validation
    if (!wallet.trim() || !withdrawalAmount || isNaN(withdrawalAmount)) {
      Alert.alert('Error', 'Please enter a valid wallet address and amount.');
      return;
    }

    if (withdrawalAmount <= 0) {
      Alert.alert('Error', 'Amount must be greater than zero.');
      return;
    }

    // 2. Insufficient Balance Check
    const currentBalance = user?.withdrawal_amount || 0;
    if (withdrawalAmount > currentBalance) {
      Alert.alert(
        'Insufficient Balance',
        `You only have $${currentBalance.toFixed(2)} available for withdrawal.`,
      );
      return;
    }

    setLoading(true);
    try {
      // 3. Submit Request
      const { error } = await supabase.from('withdrawals').insert([
        {
          user_id: user.id,
          receiving_wallet: wallet.trim(),
          amount: withdrawalAmount,
        },
      ]);
      if (error) throw error;

      Alert.alert(
        'Success',
        'Your withdrawal request has been submitted successfully.',
      );

      setWallet('');
      setAmount('');
      fetchWithdrawals();
      // Optionally fetch balance again if your backend deducts pending amounts immediately
      // fetchUserBalance();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#00ff9d';
      case 'pending':
        return '#00ffff';
      case 'rejected':
        return '#ff004c';
      default:
        return '#aaa';
    }
  };

  return (
    <ScreenWrapper>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={{ width: '100%' }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{
            alignItems: 'center',
            paddingBottom: vs(30),
          }}
        >
          <LinearGradient
            colors={['#00c6ff', '#ff00ff']}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.gradientBorder}
          >
            <View style={styles.container}>
              <TextInput
                style={styles.input}
                placeholder="Receiving Wallet Address"
                value={wallet}
                onChangeText={setWallet}
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#777"
              />

              <TextInput
                style={styles.input}
                placeholder="Amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholderTextColor="#777"
              />

              <TouchableOpacity
                onPress={submitWithdrawal}
                disabled={loading}
                style={{ width: '100%' }}
              >
                <LinearGradient
                  colors={['#00ffff', '#007fff']}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.button, loading && { opacity: 0.6 }]}
                >
                  <Text style={styles.btntxt}>
                    {loading ? 'Submitting...' : 'Withdraw'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.withdrawableText}>
                Current Withdrawable Amount{' '}
                <Text style={styles.boldAmount}>
                  ${user?.withdrawal_amount || 0}
                </Text>
              </Text>
            </View>
          </LinearGradient>

          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Withdrawal History</Text>
            {loadingWithdrawals ? (
              <ActivityIndicator size="small" color="#00ffff" />
            ) : (
              <ScrollView
                style={styles.historyList}
                showsVerticalScrollIndicator={false}
              >
                {withdrawals.length === 0 ? (
                  <Text style={styles.noWithdrawals}>No withdrawals found</Text>
                ) : (
                  withdrawals.map(wd => (
                    <LinearGradient
                      key={wd.id}
                      colors={['#00c6ff', '#ff00ff']}
                      start={{ x: 1, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={styles.cardGradient}
                    >
                      <View style={styles.withdrawCard}>
                        <View>
                          <Text style={styles.withdrawAmount}>
                            ${wd.amount}
                          </Text>
                          <Text style={styles.withdrawDate}>
                            {new Date(wd.created_at).toLocaleDateString()}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.withdrawStatus,
                            { color: getStatusColor(wd.status) },
                          ]}
                        >
                          {wd.status.toUpperCase()}
                        </Text>
                      </View>
                    </LinearGradient>
                  ))
                )}
              </ScrollView>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenWrapper>
  );
}

/* ---------------------- STYLES ---------------------- */
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  gradientBorder: {
    width: '92%',
    borderRadius: ms(20),
    padding: ms(2),
    marginTop: vs(50),
  },
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: ms(20),
    padding: s(14),
    alignItems: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(0,255,255,0.05)',
    borderRadius: ms(8),
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.2)',
    paddingVertical: ms(10),
    paddingHorizontal: s(10),
    marginBottom: vs(12),
    color: '#fff',
    fontSize: ms(15),
  },
  button: {
    paddingVertical: ms(12),
    borderRadius: ms(10),
    alignItems: 'center',
  },
  btntxt: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: ms(17),
  },
  withdrawableText: {
    marginTop: vs(8),
    fontSize: ms(13),
    color: '#ffffffa9',
    textAlign: 'center',
  },
  boldAmount: {
    fontWeight: 'bold',
    fontSize: ms(16),
    color: '#00ffff',
  },
  historyContainer: {
    width: '92%',
    marginTop: vs(25),
  },
  historyTitle: {
    fontSize: ms(18),
    fontWeight: 'bold',
    color: '#00ffff',
    marginBottom: vs(10),
  },
  historyList: { height: vs(350) },
  cardGradient: {
    borderRadius: ms(10),
    padding: ms(2),
    marginBottom: vs(8),
  },
  withdrawCard: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: ms(10),
    padding: s(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  withdrawDate: { fontSize: ms(13), color: '#aaa' },
  withdrawAmount: { fontSize: ms(16), fontWeight: 'bold', color: '#fff' },
  withdrawStatus: { fontSize: ms(14), fontWeight: 'bold', alignSelf: 'center' },
  noWithdrawals: {
    textAlign: 'center',
    color: '#666',
    marginTop: vs(10),
    fontSize: ms(14),
  },
});
