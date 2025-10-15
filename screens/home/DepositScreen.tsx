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
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.mainContainer}>
            {/* QR Section */}
            {qrCodeUrl ? (
              <View style={styles.qrContainer}>
                <Image
                  source={{ uri: qrCodeUrl }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              </View>
            ) : null}

            {/* Wallet Row */}
            <View style={styles.walletRow}>
              <Text style={styles.walletLabel}>Wallet Address</Text>
              <View style={styles.walletBox}>
                <Text
                  style={styles.walletText}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {walletAddress || 'Loading...'}
                </Text>
                <TouchableOpacity
                  onPress={copyToClipboard}
                  style={styles.copyButton}
                  disabled={!walletAddress}
                >
                  <Text style={styles.copyText}>Copy</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Inputs */}
            <TextInput
              style={styles.input}
              placeholder="Sender Wallet / Tx Hash"
              value={txHash}
              onChangeText={setTxHash}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#777"
            />

            {/* Submit Button */}
            <TouchableOpacity
              onPress={submitDeposit}
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
                  {loading ? 'Submitting...' : 'Deposit'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* History Section */}
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Deposit History</Text>
            {loadingDeposits ? (
              <ActivityIndicator size="small" color="#00ffff" />
            ) : (
              <ScrollView
                style={styles.historyList}
                showsVerticalScrollIndicator={false}
              >
                {deposits.length === 0 ? (
                  <Text style={styles.noDeposits}>No deposits found</Text>
                ) : (
                  deposits.map(dep => (
                    <View key={dep.id} style={styles.depositCard}>
                      <View>
                        <Text style={styles.depositAmount}>
                          ${dep.amount || 0}
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
        </ScrollView>
      </SafeAreaView>
    </ScreenWrapper>
  );
}

/* ---------------------- STYLES ---------------------- */
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: vs(30),
  },

  mainContainer: {
    width: '92%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: ms(20),
    padding: s(5),
    marginTop: vs(20),
  },

  qrContainer: {
    height: vs(181),
    width: s(200),
    alignSelf: 'center',
    marginBottom: vs(16),
    borderWidth: 3,
    borderColor: 'rgba(0, 255, 255, 1)',
    borderRadius: ms(10),
    overflow: 'hidden',
  },
  qrImage: { height: '100%', width: '100%' },

  walletRow: { width: '100%', marginBottom: vs(15) },
  walletLabel: {
    color: '#00ffff',
    fontSize: ms(14),
    fontWeight: '600',
    marginBottom: vs(6),
  },
  walletBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 255, 0.06)',
    borderRadius: ms(8),

    paddingHorizontal: s(10),
    height: vs(40),
  },
  walletText: { color: '#fff', fontSize: ms(14), flex: 1 },
  copyButton: {
    backgroundColor: 'rgba(0,255,255,0.15)',
    borderRadius: ms(6),
    paddingVertical: vs(4),
    paddingHorizontal: s(10),
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.3)',
  },
  copyText: { color: '#00ffff', fontWeight: 'bold', fontSize: ms(13) },

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
  historyList: { height: vs(200) },
  depositCard: {
    backgroundColor: 'rgba(0,255,255,0.05)',
    borderRadius: ms(10),
    padding: s(12),
    marginBottom: vs(8),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  depositDate: { fontSize: ms(13), color: '#aaa' },
  depositAmount: { fontSize: ms(16), fontWeight: 'bold', color: '#fff' },
  depositStatus: { fontSize: ms(14), fontWeight: 'bold', alignSelf: 'center' },
  noDeposits: {
    textAlign: 'center',
    color: '#666',
    marginTop: vs(10),
    fontSize: ms(14),
  },
});
