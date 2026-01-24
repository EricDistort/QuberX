import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  StatusBar,
  Animated,
  Pressable,
  Image, // 1️⃣ Import Image
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { supabase } from '../../utils/supabaseClient';
import ScreenWrapper from '../../utils/ScreenWrapper';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';

// Reusing ScaleCard for touch animation
const ScaleCard = ({ children, onPress, style }: any) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.96,
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

export default function IndirectReferralsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  
  // 1️⃣ Get params passed from the previous screen
  const { accountNumber, name } = route.params || {};

  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const THEME_GRADIENT = ['#7b0094ff', '#ff00d4ff'];

  const fetchReferrals = async () => {
    if (!accountNumber) return;
    setLoading(true);
    
    // 2️⃣ Fetch users referred by THIS account number
    // Added 'profileImage' to the selection
    const { data, error } = await supabase
      .from('users')
      .select('id, username, direct_business, account_number, profileImage')
      .eq('referrer_account_number', accountNumber);

    if (!error && data) setReferrals(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReferrals();
  }, [accountNumber]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReferrals();
    setRefreshing(false);
  }, [accountNumber]);

  return (
    <ScreenWrapper>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Team View</Text>
            {/* Dynamic Subtitle showing whose team this is */}
            <Text style={styles.headerSubtitle}>Directs of {name || 'User'}</Text>
            <LinearGradient
              colors={THEME_GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.headerLine}
            />
          </View>

          {loading && !refreshing ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#ff00d4" />
            </View>
          ) : referrals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.noReferrals}>No active referrals found under {name}</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#ff00d4"
                  colors={['#ff00d4', '#7b0094']}
                  progressBackgroundColor="#1a1a1a"
                />
              }
            >
              {referrals.map((ref, index) => (
                <ScaleCard 
                  key={ref.id} 
                  style={styles.cardContainer}
                  onPress={() => navigation.push('IndirectReferralsScreen', {
                    accountNumber: ref.account_number,
                    name: ref.username
                  })}
                >
                  <View style={styles.card}>
                    
                    {/* Left: User Info */}
                    <View style={styles.userInfo}>
                      
                      {/* 3️⃣ Avatar Logic */}
                      <View style={[
                        styles.avatarPlaceholder, 
                        ref.profileImage && { borderWidth: 0, backgroundColor: 'transparent' }
                      ]}>
                        {ref.profileImage ? (
                          <Image 
                            source={{ uri: ref.profileImage }} 
                            style={styles.avatarImage} 
                            resizeMode="cover"
                          />
                        ) : (
                          <Text style={styles.avatarText}>
                            {ref.username ? ref.username.charAt(0).toUpperCase() : 'U'}
                          </Text>
                        )}
                      </View>

                      <View>
                        <Text style={styles.username}>
                          {ref.username || `Trader ${index + 1}`}
                        </Text>
                        <View style={styles.statusBadge}>
                          <Text style={styles.statusText}>VIEW DOWNLINE</Text>
                        </View>
                      </View>
                    </View>

                    {/* Right: Business Volume */}
                    <View style={styles.businessInfo}>
                      <Text style={styles.businessLabel}>Volume</Text>
                      <Text style={styles.businessAmount}>
                        ${ref.direct_business || 0}
                      </Text>
                    </View>

                  </View>
                </ScaleCard>
              ))}
            </ScrollView>
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
    paddingHorizontal: s(16),
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Header */
  headerContainer: {
    marginTop: vs(20),
    marginBottom: vs(20),
  },
  headerTitle: {
    fontSize: ms(28),
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: vs(15),
  },
  headerSubtitle: {
    fontSize: ms(14),
    color: 'rgba(255,255,255,0.5)',
    marginBottom: vs(10),
  },
  headerLine: {
    width: s(50),
    height: vs(4),
    borderRadius: ms(2),
  },

  /* List */
  scroll: { width: '100%' },
  scrollContent: { paddingBottom: vs(40) },

  /* Card */
  cardContainer: {
    marginBottom: vs(15),
    shadowColor: '#ff00d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: ms(16),
    padding: s(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },

  /* Left Side */
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: s(50),
    height: s(50),
    borderRadius: s(25),
    backgroundColor: 'rgba(123, 0, 148, 0.3)', // Slightly darker for indirect
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(12),
    borderWidth: 1,
    borderColor: 'rgba(123, 0, 148, 0.5)',
    //overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: '#d000ff',
    fontSize: ms(16),
    fontWeight: '800',
  },
  username: {
    color: '#fff',
    fontSize: ms(16),
    fontWeight: '700',
    marginBottom: vs(4),
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 170, 0, 0.1)', 
    paddingHorizontal: s(6),
    paddingVertical: vs(2),
    borderRadius: ms(4),
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#ffaa00',
    fontSize: ms(9),
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  /* Right Side */
  businessInfo: {
    alignItems: 'flex-end',
  },
  businessLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: ms(10),
    textTransform: 'uppercase',
    marginBottom: vs(2),
  },
  businessAmount: {
    color: '#fff',
    fontSize: ms(18),
    fontWeight: '800',
  },

  /* Empty State */
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noReferrals: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: ms(16),
  },
});