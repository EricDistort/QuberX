import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  RefreshControl,
  Animated,
  Pressable,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';
import ScreenWrapper from '../../utils/ScreenWrapper';
import { useUser } from '../../utils/UserContext';
import { supabase } from '../../utils/supabaseClient';

// --- POP BUTTON COMPONENT ---
const PopButton = ({ onPress, children, style, disabled, contentStyle }: any) => {
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
      <Animated.View 
        style={[
          { transform: [{ scale: scaleValue }], width: '100%', alignItems: 'center', justifyContent: 'center' },
          contentStyle 
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default function WithdrawalScreen() {
  const { user, setUser } = useUser();
  const [wallet, setWallet] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);
  
  const [refreshing, setRefreshing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const THEME_GRADIENT = ['#7b0094ff', '#ff00d4ff'];

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
    if (!refreshing) setLoadingWithdrawals(true);
    const { data, error } = await supabase
      .from('withdrawals')
      .select('id, receiving_wallet, amount, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error) setWithdrawals(data || []);
    setLoadingWithdrawals(false);
  };

  useEffect(() => {
    fetchWithdrawals();
    fetchUserBalance();
  }, [user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchUserBalance(), fetchWithdrawals()]);
    setRefreshing(false);
  }, [user?.id]);

  const handleMaxAmount = () => {
    setAmount(user?.withdrawal_amount?.toString() || '0');
  };

  const submitWithdrawal = async () => {
    Keyboard.dismiss();
    const withdrawalAmount = parseFloat(amount);

    if (!wallet.trim() || !withdrawalAmount || isNaN(withdrawalAmount)) {
      Alert.alert('Invalid Input', 'Please enter a valid wallet address and amount.');
      return;
    }

    if (withdrawalAmount <= 0) {
      Alert.alert('Invalid Amount', 'Amount must be greater than zero.');
      return;
    }

    const currentBalance = user?.withdrawal_amount || 0;
    if (withdrawalAmount > currentBalance) {
      Alert.alert('Insufficient Balance', `Available: $${currentBalance.toFixed(2)}`);
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

      setShowSuccess(true); 

      setWallet('');
      setAmount('');
      onRefresh(); 
      
    } catch (err: any) {
        if (err.message.includes('Insufficient withdrawal balance')) {
            Alert.alert('Failed', 'Insufficient funds. Balance updated.');
            fetchUserBalance();
        } else {
            Alert.alert('Error', err.message);
        }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#00e676';
      case 'pending': return '#ffb300';
      case 'rejected': return '#ff4d4d';
      default: return '#aaa';
    }
  };

  const renderHistoryItem = ({ item }: { item: any }) => (
    <View style={styles.historyCard}>
      <View style={styles.historyRow}>
        <View>
          <Text style={styles.historyAmount}>${item.amount}</Text>
          <Text style={styles.historyDate}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <View style={[styles.statusBadge, { borderColor: getStatusColor(item.status) }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.walletTruncated} numberOfLines={1} ellipsizeMode="middle">
            {item.receiving_wallet}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.pageTitle}>Withdraw</Text>

      {/* Balance Card */}
      <LinearGradient
        colors={THEME_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.balanceCard}
      >
        <View style={styles.cardContent}>
          <View>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceValue}>
              {user?.withdrawal_amount?.toFixed(2) || '0.00'}
            </Text>
          </View>
          <View style={styles.iconContainer}>
             <Text style={styles.currencyIcon}>$</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Input Forms */}
      <View style={styles.formContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Wallet Address (TRC20/ERC20)"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={wallet}
            onChangeText={setWallet}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputWrapper}>
          <View style={styles.amountInputContainer}>
            <TextInput
              style={[styles.input, { flex: 1, borderWidth: 0 }]}
              placeholder="Enter Amount"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            {/* MAX Button with Pop Effect */}
            <PopButton 
              onPress={handleMaxAmount} 
              style={{ marginRight: s(15) }}
              contentStyle={{ width: 'auto' }} // Allow width to fit text
            >
              <Text style={styles.maxText}>MAX</Text>
            </PopButton>
          </View>
        </View>

        {/* Submit Button with Pop Effect */}
        <PopButton
          onPress={submitWithdrawal}
          disabled={loading}
          style={styles.submitBtnContainer}
        >
          <LinearGradient
            colors={THEME_GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitBtn}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnText}>CONFIRM WITHDRAWAL</Text>
            )}
          </LinearGradient>
        </PopButton>
      </View>

      <View style={styles.historyHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <View style={styles.line} />
      </View>
    </View>
  );

  return (
    <ScreenWrapper>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        
        {showSuccess && (
          <View style={styles.successOverlay}>
            <LottieView
              source={require('../homeMedia/Success.json')}
              autoPlay
              loop={false}
              onAnimationFinish={() => setShowSuccess(false)}
              style={styles.successLottie}
              resizeMode="contain"
            />
          </View>
        )}

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          <FlatList
            data={withdrawals}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderHistoryItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            
            ListHeaderComponent={renderHeader()} 
            
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#ff00d4"
                colors={['#ff00d4', '#7b0094']}
                progressBackgroundColor="#1a1a1a"
              />
            }
            
            ListEmptyComponent={
              !loadingWithdrawals ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No transactions found</Text>
                </View>
              ) : (
                <ActivityIndicator color="#ff00d4" style={{ marginTop: 20 }} />
              )
            }
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 1)',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successLottie: {
    width: s(300),
    height: s(300),
  },
  headerContainer: {
    paddingHorizontal: s(20),
    marginBottom: vs(10),
    paddingTop: vs(10),
  },
  pageTitle: {
    fontSize: ms(24),
    fontWeight: '900',
    color: '#fff',
    marginBottom: vs(15),
    letterSpacing: 0.5,
    marginTop: vs(15),
  },
  balanceCard: {
    borderRadius: ms(35),
    padding: s(20),
    marginBottom: vs(20),
    shadowColor: '#ff00d4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: ms(12),
    fontWeight: '600',
    marginBottom: vs(4),
    textTransform: 'uppercase',
  },
  balanceValue: {
    color: '#fff',
    fontSize: ms(32),
    fontWeight: '800',
  },
  iconContainer: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencyIcon: {
    color: '#fff',
    fontSize: ms(20),
    fontWeight: 'bold',
  },
  formContainer: {
    gap: vs(12),
    marginBottom: vs(25),
  },
  inputWrapper: {
    width: '100%',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: ms(20),
    height: vs(50),
    paddingHorizontal: s(15),
    color: '#fff',
    fontSize: ms(15),
    
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: ms(20),
   
    height: vs(50),
    paddingRight: 0, // Removed padding right as it's handled by margin in button
  },
  maxText: {
    color: '#ff00d4',
    fontWeight: '800',
    fontSize: ms(12),
    backgroundColor: 'rgba(255, 0, 212, 0.1)',
    paddingHorizontal: s(10),
    paddingVertical: vs(5),
    borderRadius: ms(14),
    borderWidth: 0.5,
    borderColor: '#ff00d4',
  },
  submitBtnContainer: {
    marginTop: vs(5),
    shadowColor: '#ff00d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    width: '100%',
  },
  submitBtn: {
    height: vs(50),
    borderRadius: ms(20),
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  btnText: {
    color: '#fff',
    fontSize: ms(14),
    fontWeight: '900',
    letterSpacing: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(10),
  },
  sectionTitle: {
    fontSize: ms(16),
    fontWeight: '700',
    color: '#fff',
    marginRight: s(10),
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  listContent: {
    paddingBottom: vs(20),
  },
  historyCard: {
    marginBottom: vs(12),
    marginHorizontal: s(20),
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: ms(20),
    padding: s(12),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyAmount: {
    color: '#fff',
    fontSize: ms(16),
    fontWeight: '700',
    marginBottom: vs(2),
  },
  historyDate: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: ms(11),
  },
  statusBadge: {
    paddingHorizontal: s(8),
    paddingVertical: vs(2),
    borderRadius: ms(10),
    borderWidth: 1,
    marginBottom: vs(4),
  },
  statusText: {
    fontSize: ms(10),
    fontWeight: '800',
  },
  walletTruncated: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: ms(11),
    maxWidth: s(100),
    textAlign: 'right',
  },
  emptyState: {
    marginTop: vs(20),
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: ms(14),
  },
});