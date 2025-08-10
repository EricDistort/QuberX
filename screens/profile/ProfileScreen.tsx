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
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
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

  // Fetch wallet address & QR code from database
  const fetchDepositInfo = async () => {
    const { data, error } = await supabase
      .from('deposit_info')
      .select('wallet_address, qr_code_url')
      .limit(1)
      .single();

    if (!error && data) {
      setWalletAddress(data.wallet_address);
      setQrCodeUrl(data.qr_code_url);
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
          referrer_account_number: referrer.trim() || null,
        },
      ]);
      if (error) {
        if (error.code === '23505') {
          Alert.alert(
            'Duplicate Transaction',
            'This transaction hash has already been used.',
          );
        } else {
          throw error;
        }
      } else {
        Alert.alert(
          'Deposit Request Submitted',
          'Your deposit request is pending admin approval.',
        );
        setTxHash('');
        setReferrer('');
        fetchDeposits();
      }
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
          {/* QR Code Image */}
          {qrCodeUrl ? (
            <View style={styles.qrContainer}>
              <Image
                source={{ uri: qrCodeUrl }}
                style={styles.qrImage}
                resizeMode="contain"
              />
            </View>
          ) : null}

          {/* Wallet Address Row */}
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

          {/* Transaction Hash Input */}
          <TextInput
            style={styles.input}
            placeholder="Transaction Hash"
            value={txHash}
            onChangeText={setTxHash}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="grey"
          />

          {/* Referrer Account Number Input */}
          <TextInput
            style={styles.input}
            placeholder="Referrer Account Number (Optional)"
            value={referrer}
            onChangeText={setReferrer}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="grey"
          />

          {/* Deposit Button */}
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

        {/* Deposit History */}
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
                  style={{ textAlign: 'center', marginTop: 10, color: '#555' }}
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
  safeArea: { flex: 1, alignItems: 'center', padding: moderateScale(8) },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    padding: scale(14),
    backgroundColor: 'rgba(255, 255, 255, 1)',
    width: scale(320),
    borderRadius: moderateScale(14),
    marginTop: verticalScale(40),
    shadowColor: 'rgba(66, 0, 55, 0.32)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 15,
  },
  qrContainer: {
    height: verticalScale(180),
    width: scale(180),
    marginBottom: 20,
  },
  qrImage: { height: '100%', width: '100%', borderRadius: 10 },
  walletRow: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  walletTextContainer: { flex: 1, paddingHorizontal: 4 },
  walletText: { color: 'rgba(36,0,31,0.74)', fontSize: 17 },
  copyButton: { width: scale(80), height: verticalScale(40) },
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
  historyContainer: { width: '95%', marginTop: 20 },
  historyList: { height: '30%' },
  depositCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.38)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: verticalScale(60),
  },
  depositDate: { fontSize: 13, color: '#666' },
  depositAmount: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  depositStatus: { fontSize: 15, fontWeight: 'bold', alignSelf: 'center' },
});
