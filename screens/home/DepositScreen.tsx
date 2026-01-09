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
  FlatList,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
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
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Theme Constants
  const THEME_GRADIENT = ['#7b0094ff', '#ff00d4ff'];
  const COOLDOWN_GRADIENT = ['#4a4a4aff', '#2b2b2bff'];

  const fetchDepositInfo = async () => {
    const { data, error } = await supabase.rpc('get_random_deposit_info');
    if (!error && data && data.length > 0) {
      setWalletAddress(data[0].wallet_address);
      setQrCodeUrl(data[0].qr_code_url);
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

    if (!error) {
      setDeposits(data || []);
      checkCooldown(data || []);
    }
    setLoadingDeposits(false);
  };

  const checkCooldown = (depositList: any[]) => {
    if (depositList.length > 0) {
      const lastDepositTime = new Date(depositList[0].created_at).getTime();
      const currentTime = new Date().getTime();
      const twentyFourHoursInMs = 1 * 60 * 60 * 1000;
      const timeDiff = currentTime - lastDepositTime;

      if (timeDiff < twentyFourHoursInMs) {
        const remaining = Math.floor((twentyFourHoursInMs - timeDiff) / 1000);
        setCooldownSeconds(remaining);
      } else {
        setCooldownSeconds(0);
      }
    }
  };

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const intervalId = setInterval(() => {
      setCooldownSeconds(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [cooldownSeconds]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    fetchDepositInfo();
    fetchDeposits();
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
      Alert.alert('Success', 'Deposit request submitted.');
      setTxHash('');
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
        return '#00e676';
      case 'pending':
        return '#ffb300';
      case 'rejected':
        return '#ff4d4d';
      default:
        return '#aaa';
    }
  };

  // Render History Item
  const renderHistoryItem = ({ item }: { item: any }) => (
    <View style={styles.historyCard}>
      <View style={styles.historyLeft}>
        <Text style={styles.historyAmount}>${item.amount || 0}</Text>
        <Text style={styles.historyDate}>
          {new Date(item.created_at).toLocaleDateString()} •{' '}
          {new Date(item.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: `${getStatusColor(item.status)}20`,
            borderColor: `${getStatusColor(item.status)}50`,
          },
        ]}
      >
        <Text
          style={[styles.statusText, { color: getStatusColor(item.status) }]}
        >
          {item.status.toUpperCase()}
        </Text>
      </View>
    </View>
  );

  return (
    <ScreenWrapper>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          {/* 1️⃣ Fixed Top Section */}
          <View style={styles.topSection}>
            <Text style={styles.screenTitle}>Deposit Funds</Text>

            <View style={styles.formContainer}>
              {/* Row: QR & Warning */}
              <View style={styles.qrRow}>
                {qrCodeUrl ? (
                  <View style={styles.qrWrapper}>
                    <Image
                      source={{ uri: qrCodeUrl }}
                      style={styles.qrImage}
                      resizeMode="contain"
                    />
                  </View>
                ) : null}

                <View style={styles.warningBox}>
                  <Text style={styles.warningText}>⚠️ IMPORTANT</Text>
                  <Text style={styles.warningDesc}>
                    Send exact amount of USDT & Siito within 1 hour.
                  </Text>
                </View>
              </View>

              {/* Wallet Address Input */}
              <View style={styles.inputWrapper}>
                <View style={styles.walletBox}>
                  <Text
                    style={styles.walletText}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                  >
                    {walletAddress || 'Loading...'}
                  </Text>
                  <TouchableOpacity onPress={copyToClipboard}>
                    <Text style={styles.copyText}>COPY</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* TX Hash Input */}
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Paste Transaction Hash (TXID)"
                  value={txHash}
                  onChangeText={setTxHash}
                  autoCapitalize="none"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={submitDeposit}
                disabled={loading || cooldownSeconds > 0}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    cooldownSeconds > 0 ? COOLDOWN_GRADIENT : THEME_GRADIENT
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitBtn}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.submitBtnText}>
                      {cooldownSeconds > 0
                        ? `Wait ${formatTime(cooldownSeconds)}`
                        : 'Confirm Deposit'}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* 2️⃣ Scrollable History Section (Fills remaining space) */}
          <View style={styles.historyContainer}>
            <Text style={styles.historyHeader}>Recent History</Text>

            {loadingDeposits ? (
              <ActivityIndicator color="#ff00d4" style={{ marginTop: 20 }} />
            ) : (
              <FlatList
                data={deposits}
                keyExtractor={item => item.id.toString()}
                renderItem={renderHistoryItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No deposit history found</Text>
                }
              />
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: s(10),
    paddingTop: vs(10),
  },

  /* --- Fixed Top Section --- */
  topSection: {
    marginBottom: vs(20),
  },
  screenTitle: {
    fontSize: ms(24),
    fontWeight: '800',
    color: '#fff',
    marginBottom: vs(15),
    letterSpacing: 0.5,
    marginTop: vs(15),
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: ms(20),
    padding: s(15),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  /* QR & Warning Row */
  qrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(15),
  },
  qrWrapper: {
    width: s(100),
    height: s(100),
    backgroundColor: '#fff',
    borderRadius: ms(10),
    padding: s(5),
    marginRight: s(15),
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  warningBox: {
    flex: 1,
    justifyContent: 'center',
  },
  warningText: {
    color: '#ffb300',
    fontWeight: '700',
    fontSize: ms(12),
    marginBottom: vs(2),
  },
  warningDesc: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: ms(11),
    lineHeight: ms(15),
  },

  /* Inputs */
  inputWrapper: {
    marginBottom: vs(12),
  },
  walletBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: ms(12),
    paddingHorizontal: s(15),
    height: vs(45),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  walletText: {
    color: '#fff',
    flex: 1,
    fontSize: ms(13),
    marginRight: s(10),
  },
  copyText: {
    color: '#ff00d4',
    fontWeight: '700',
    fontSize: ms(12),
  },
  input: {
    backgroundColor: '#000',
    borderRadius: ms(12),
    height: vs(45),
    paddingHorizontal: s(15),
    color: '#fff',
    fontSize: ms(14),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  /* Button */
  submitBtn: {
    height: vs(48),
    borderRadius: ms(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: vs(5),
  },
  submitBtnText: {
    color: '#fff',
    fontSize: ms(15),
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  /* --- Scrollable Bottom Section --- */
  historyContainer: {
    flex: 1, // Takes remaining space
  },
  historyHeader: {
    fontSize: ms(18),
    fontWeight: '700',
    color: '#fff',
    marginBottom: vs(10),
  },
  listContent: {
    paddingBottom: vs(200),
  },

  /* History Card */
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)', // Lighter glass
    borderRadius: ms(12),
    padding: s(12),
    marginBottom: vs(8),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  historyLeft: {
    flexDirection: 'column',
  },
  historyAmount: {
    color: '#fff',
    fontSize: ms(16),
    fontWeight: 'bold',
    marginBottom: vs(2),
  },
  historyDate: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: ms(11),
  },
  statusBadge: {
    paddingVertical: vs(4),
    paddingHorizontal: s(8),
    borderRadius: ms(6),
    borderWidth: 1,
  },
  statusText: {
    fontSize: ms(10),
    fontWeight: '800',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    marginTop: vs(20),
    fontSize: ms(14),
  },
});
