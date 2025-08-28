import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Image,
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
import Clipboard from '@react-native-clipboard/clipboard';

export default function DepositScreen() {
  const { user } = useUser();
  const [walletAddress, setWalletAddress] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [txHash, setTxHash] = useState('');
  const [referrer, setReferrer] = useState('');
  const [loading, setLoading] = useState(false);

  const [deposits, setDeposits] = useState<any[]>([]);
  const [loadingDeposits, setLoadingDeposits] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDepositInfo = async () => {
    const { data, error } = await supabase.rpc('get_random_deposit_info');
    if (!error && data && data.length > 0) {
      setWalletAddress(data[0].wallet_address);
      setQrCodeUrl(data[0].qr_code_url);
    } else {
      console.error('Error fetching deposit info:', error);
    }
  };

  const copyToClipboard = () => {
    if (Platform.OS === 'web') {
      navigator.clipboard.writeText(walletAddress);
    } else {
      Clipboard.setString(walletAddress);
    }
    Alert.alert('Copied', 'Wallet address copied to clipboard!');
  };

  const fetchDeposits = async () => {
    if (!user?.id) return;
    setLoadingDeposits(true);
    const { data, error } = await supabase
      .from('deposits')
      .select('id, amount, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error) setDeposits(data || []);
    setLoadingDeposits(false);
  };

  useEffect(() => {
    fetchDepositInfo();
    fetchDeposits();
  }, [user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDepositInfo();
    await fetchDeposits();
    setRefreshing(false);
  }, [user?.id]);

  const submitDeposit = async () => {
    if (!txHash.trim()) {
      Alert.alert('Error', 'Please enter the transaction hash');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('deposits').insert([
        {
          user_id: user.id,
          tx_hash: txHash.trim(),
          wallet_address: walletAddress,
          referrer_account_number: referrer.trim() || null,
        },
      ]);
      if (error) throw error;

      Alert.alert(
        'Deposit Request Submitted',
        'Your deposit request is pending admin approval.',
      );
      setTxHash('');
      setReferrer('');
      fetchDeposits();
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
          {qrCodeUrl ? (
            <View style={styles.qrContainer}>
              <Image
                source={{ uri: qrCodeUrl }}
                style={styles.qrImage}
                resizeMode="contain"
              />
            </View>
          ) : null}

          <View style={styles.walletRow}>
            <View style={styles.walletTextContainer}>
              <Text
                style={styles.walletText}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {walletAddress || 'Loading...'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={copyToClipboard}
              style={styles.copyButton}
              disabled={!walletAddress}
            >
              <LinearGradient
                colors={['#8CA6DB', '#B993D6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Text style={styles.btntxt}>Copy</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Sender Wallet"
            value={txHash}
            onChangeText={setTxHash}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="grey"
          />

          <TextInput
            style={styles.input}
            placeholder="Referrer Account (Optional)"
            value={referrer}
            onChangeText={setReferrer}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="grey"
          />

          <TouchableOpacity
            onPress={submitDeposit}
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
                {loading ? 'Submitting...' : 'Deposit'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.historyContainer}>
          {loadingDeposits ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <ScrollView
              style={styles.historyList}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              {deposits.length === 0 ? (
                <Text
                  style={{
                    textAlign: 'center',
                    marginTop: vs(10),
                    color: '#555',
                  }}
                >
                  No deposits found
                </Text>
              ) : (
                deposits.map(dep => (
                  <View key={dep.id} style={styles.depositCard}>
                    <View>
                      <Text style={styles.depositAmount}>
                        ₹{dep.amount || 0}
                      </Text>
                      <Text style={styles.depositDate}>
                        {new Date(dep.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.depositStatus,
                        { color: getStatusColor(dep.status) },
                      ]}
                    >
                      {dep.status.toUpperCase()}
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
  safeArea: { flex: 1, alignItems: 'center', padding: ms(8) },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    padding: s(14),
    backgroundColor: 'rgba(255, 255, 255, 1)',
    width: s(320),
    borderRadius: ms(14),
    marginTop: vs(40),
    shadowColor: 'rgba(66, 0, 55, 0.32)',
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 1,
    shadowRadius: ms(10),
    elevation: 15,
  },
  qrContainer: {
    height: vs(180),
    width: s(180),
    marginBottom: vs(20),
  },
  qrImage: { height: '100%', width: '100%', borderRadius: ms(10) },
  walletRow: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  walletTextContainer: { flex: 1, paddingHorizontal: s(4) },
  walletText: { color: 'rgba(36,0,31,0.74)', fontSize: ms(17) },
  copyButton: { width: s(80), height: vs(40) },
  input: {
    width: '100%',
    paddingVertical: ms(10),
    marginBottom: vs(12),
    color: 'rgba(36,0,31,0.74)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(53, 0, 88, 0.18)',
    fontSize: ms(17),
  },
  button: { padding: ms(10), borderRadius: ms(8), alignItems: 'center' },
  btntxt: { color: '#fff', fontWeight: 'bold', fontSize: ms(17) },
  historyContainer: { width: '95%', marginTop: vs(20) },
  historyList: { height: '30%' },
  depositCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.38)',
    borderRadius: ms(10),
    padding: s(12),
    marginBottom: vs(8),
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: vs(60),
  },
  depositDate: { fontSize: ms(13), color: '#666' },
  depositAmount: { fontSize: ms(16), fontWeight: 'bold', color: '#222' },
  depositStatus: { fontSize: ms(15), fontWeight: 'bold', alignSelf: 'center' },
});
