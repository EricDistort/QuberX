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
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import ScreenWrapper from '../../utils/ScreenWrapper';
import { useUser } from '../../utils/UserContext';
import { supabase } from '../../utils/supabaseClient';

export default function WithdrawalScreen() {
  const { user } = useUser();
  const [wallet, setWallet] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWithdrawals = async () => {
    if (!user?.id) return;
    setLoadingWithdrawals(true);

    // Fetch latest 10 withdrawals
    const { data, error } = await supabase
      .from('withdrawals')
      .select('id, receiving_wallet, amount, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }) // Order by latest first
      .limit(15); // Limit to latest 10 transactions

    if (!error) setWithdrawals(data || []);
    setLoadingWithdrawals(false);
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWithdrawals();
    setRefreshing(false);
  }, [user?.id]);

  const submitWithdrawal = async () => {
    const withdrawalAmount = parseFloat(amount);
    if (!wallet.trim() || !withdrawalAmount) {
      Alert.alert('Error', 'Please enter wallet and valid amount');
      return;
    }

    // Check against withdrawal_amount instead of balance
    if (withdrawalAmount > (user?.withdrawal_amount || 0)) {
      Alert.alert('Error', 'Insufficient withdrawable amount');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('withdrawals').insert([
        {
          user_id: user.id,
          receiving_wallet: wallet.trim(),
          amount: withdrawalAmount,
        },
      ]);
      if (error) throw error;

      Alert.alert(
        'Withdrawal Request Submitted',
        'Your withdrawal request is pending admin approval.',
      );
      setWallet('');
      setAmount('');
      fetchWithdrawals();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'green';
      case 'pending':
        return 'orange';
      case 'rejected':
        return 'red';
      default:
        return '#555';
    }
  };

  return (
    <ScreenWrapper>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Receiving Wallet Input */}
          <TextInput
            style={styles.input}
            placeholder="Receiving Wallet Address"
            value={wallet}
            onChangeText={setWallet}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="grey"
          />

          {/* Amount Input */}
          <TextInput
            style={styles.input}
            placeholder="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholderTextColor="grey"
          />

          {/* Withdraw Button */}
          <TouchableOpacity
            onPress={submitWithdrawal}
            disabled={loading}
            style={{ width: '100%' }}
          >
            <LinearGradient
              colors={loading ? ['#b0bcd6', '#b0bcd6'] : ['#8CA6DB', '#B993D6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.button, loading && { opacity: 0.6 }]}
            >
              <Text style={styles.btntxt}>
                {loading ? 'Submitting...' : 'Withdraw'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Current Withdrawable Amount */}
          <Text style={styles.withdrawableText}>
            Current Withdrawable Amount{' '}
            <Text style={styles.boldAmount}>
              ₹{user?.withdrawal_amount || 0}
            </Text>
          </Text>
        </View>

        {/* Withdrawal History */}
        <View style={styles.historyContainer}>
          {loadingWithdrawals ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <ScrollView
              style={styles.historyList}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              {withdrawals.length === 0 ? (
                <Text
                  style={{ textAlign: 'center', marginTop: 10, color: '#555' }}
                >
                  No withdrawals found
                </Text>
              ) : (
                withdrawals.map(wd => (
                  <View key={wd.id} style={styles.withdrawCard}>
                    <View>
                      <Text style={styles.withdrawDate}>
                        {new Date(wd.created_at).toLocaleDateString()}
                      </Text>
                      <Text style={styles.withdrawAmount}>${wd.amount}</Text>
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
                ))
              )}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, alignItems: 'center', padding: moderateScale(8) },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    padding: scale(14),
    backgroundColor: 'rgba(255, 255, 255, 1)',
    width: scale(300),
    borderRadius: moderateScale(14),
    marginTop: verticalScale(40),
    shadowColor: 'rgba(66, 0, 55, 0.32)', // Shadow color (black)
    shadowOffset: { width: 0, height: 4 }, // Shadow offset (horizontal, vertical)
    shadowOpacity: 1, // Shadow transparency (0 is fully transparent, 1 is fully opaque)
    shadowRadius: 10, // Shadow blur radius
    // Android shadow properties
    elevation: 15, // This is the shadow depth for Android
  },
  input: {
    width: '100%',
    paddingVertical: 10,
    marginBottom: 12,
    color: 'rgba(36,0,31,0.74)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(53, 0, 88, 0.18)',
    fontSize: 17,
  },
  button: { padding: 10, borderRadius: 8, alignItems: 'center' },
  btntxt: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  withdrawableText: {
    marginTop: 8,
    fontSize: 13,
    color: '#555',
    textAlign: 'center',
  },
  // History
  historyContainer: { width: '95%', marginTop: 20 },
  historyList: { height: '61%' },
  withdrawCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.38)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: verticalScale(60),
  },
  withdrawDate: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  withdrawAmount: { fontSize: 13, color: '#666' },
  withdrawStatus: { fontSize: 15, fontWeight: 'bold', alignSelf: 'center' },
  boldAmount: {
    fontWeight: 'bold', // Make the amount bold
    fontSize: 16, // Optional, to keep consistent size with other text
  },
});
