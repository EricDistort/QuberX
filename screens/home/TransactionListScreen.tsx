import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Animated,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { useUser } from '../../utils/UserContext';
import ScreenWrapper from '../../utils/ScreenWrapper';
import { supabase } from '../../utils/supabaseClient';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';

// --- POP CARD COMPONENT ---
const PopCard = ({ onPress, children, style }: any) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.96, // Subtle shrink for list items
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
      style={style}
    >
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default function TransactionListScreen() {
  const { user } = useUser();
  const navigation = useNavigation<any>();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // The requested gradient colors
  const THEME_GRADIENT = ['#7b0094ff', '#ff00d4ff'];

  const fetchAllTransactions = async () => {
    if (!user?.account_number) return;
    // Only show full loading spinner on initial load, not on refresh
    if (!refreshing) setLoading(true);
    
    const { data, error } = await supabase
      .from('transactions')
      .select(
        `
        id,
        sender_acc,
        receiver_acc,
        amount,
        created_at,
        sender:sender_acc(username, account_number),
        receiver:receiver_acc(username, account_number)
      `,
      )
      .or(
        `sender_acc.eq.${user.account_number},receiver_acc.eq.${user.account_number}`,
      )
      .order('created_at', { ascending: false });

    if (!error) setTransactions(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllTransactions();
  }, [user?.account_number]);

  // Pull to Refresh Handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllTransactions();
    setRefreshing(false);
  }, [user?.account_number]);

  const renderItem = ({ item }: { item: any }) => {
    const isSent = item.sender_acc === user.account_number;
    const otherUser = isSent ? item.receiver : item.sender;

    return (
      <PopCard
        onPress={() =>
          navigation.navigate('TransactionDetailsScreen', { transaction: item })
        }
        style={{ marginBottom: vs(12) }} // Spacing handled here for list items
      >
        <View style={styles.cardContainer}>
          {/* Card Background */}
          <View style={styles.cardBg}>
            <View style={styles.cardContent}>
              {/* Icon with Gradient */}
              <LinearGradient
                colors={THEME_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconContainer}
              >
                <Text style={styles.iconText}>{isSent ? '↗' : '↙'}</Text>
              </LinearGradient>

              {/* Text Info */}
              <View style={styles.textColumn}>
                <Text style={styles.username} numberOfLines={1}>
                  {otherUser?.username || 'Unknown User'}
                </Text>
                <Text style={styles.dateText}>
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>

              {/* Amount & Time (AM/PM) */}
              <View style={styles.amountColumn}>
                <Text
                  style={[
                    styles.amount,
                    { color: isSent ? '#ff4d4d' : '#00e676' }, // Soft Red / Bright Green
                  ]}
                >
                  {isSent ? '-' : '+'}${Math.abs(item.amount)}
                </Text>
                <Text style={styles.timeText}>
                  {new Date(item.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </PopCard>
    );
  };

  return (
    <ScreenWrapper>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.container}>
          
          {/* Modern Header Section */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Transactions</Text>
            <Text style={styles.headerSubtitle}>Recent activity</Text>
            
            {/* Gradient Underline */}
            <LinearGradient
              colors={THEME_GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.headerLine}
            />
          </View>

          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ff00d4" />
            </View>
          ) : (
            <FlatList
              data={transactions}
              keyExtractor={item => item.id.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              // Refresh Control Component
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#ff00d4" // Neon Pink Spinner (iOS)
                  colors={['#ff00d4', '#7b0094']} // Neon Gradient Spinner (Android)
                  progressBackgroundColor="#1a1a1a" // Dark background for spinner (Android)
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>📂</Text>
                  <Text style={styles.emptyText}>No transactions yet</Text>
                </View>
              }
            />
          )}
        </View>
      </SafeAreaView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: s(10),
  },
  
  /* Header Styles */
  headerContainer: {
    marginTop: vs(20),
    marginBottom: vs(20),
  },
  headerTitle: {
    fontSize: ms(32),
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: ms(14),
    color: 'rgba(255,255,255,0.5)',
    marginTop: vs(2),
    marginBottom: vs(10),
  },
  headerLine: {
    height: vs(4),
    width: s(60),
    borderRadius: ms(2),
  },

  /* List Styles */
  listContent: {
    paddingBottom: vs(300),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Card Styles */
  cardContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  cardBg: {
    backgroundColor: '#1a1a1a98', // Dark modern grey
    borderRadius: ms(30),
    
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: s(15),
  },

  /* Icon Styles */
  iconContainer: {
    width: ms(48),
    height: ms(48),
    borderRadius: ms(16), // Squircle shape
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(15),
  },
  iconText: {
    color: '#fff',
    fontSize: ms(22),
    fontWeight: 'bold',
  },

  /* Text Layout */
  textColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  username: {
    fontSize: ms(16),
    fontWeight: '700',
    color: '#fff',
    marginBottom: vs(4),
  },
  dateText: {
    fontSize: ms(12),
    color: 'rgba(255,255,255,0.4)',
  },

  /* Amount Layout */
  amountColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amount: {
    fontSize: ms(16),
    fontWeight: '700',
    marginBottom: vs(4),
  },
  timeText: {
    fontSize: ms(11),
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '500',
    marginTop: vs(2),
  },

  /* Empty State */
  emptyContainer: {
    alignItems: 'center',
    marginTop: vs(80),
    opacity: 0.5,
  },
  emptyIcon: {
    fontSize: ms(40),
    marginBottom: vs(10),
  },
  emptyText: {
    color: '#fff',
    fontSize: ms(16),
    fontWeight: '500',
  },
});