import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { supabase } from '../../utils/supabaseClient';
import { useUser } from '../../utils/UserContext';
import ScreenWrapper from '../../utils/ScreenWrapper';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';

export default function DirectReferralsScreen() {
  const { user } = useUser();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReferrals = async () => {
    if (!user?.account_number) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('id, username, direct_business')
      .eq('referrer_account_number', user.account_number);

    if (!error && data) setReferrals(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReferrals();
  }, [user?.account_number]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReferrals();
    setRefreshing(false);
  }, [user?.account_number]);

  return (
    <ScreenWrapper>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.header}>My Direct Referrals</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#00ffff" />
        ) : referrals.length === 0 ? (
          <Text style={styles.noReferrals}>No direct referrals found</Text>
        ) : (
          <ScrollView
            style={styles.scroll}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            {referrals.map((ref, index) => (
              <LinearGradient
                key={ref.id}
                colors={['#00c6ff', '#ff00ff']}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.gradientBorder}
              >
                <View style={styles.referralCard}>
                  {/* Left Side */}
                  <View>
                    <Text style={styles.traderName}>
                      Direct Trader {index + 1}
                    </Text>
                    <Text style={styles.subscribedText}>Subscribed Trader</Text>
                  </View>

                  {/* Right Side */}
                  <Text style={styles.businessAmount}>
                    ${ref.direct_business || 0}
                  </Text>
                </View>
              </LinearGradient>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </ScreenWrapper>
  );
}

/* ---------------------- STYLES ---------------------- */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
    padding: s(10),
  },
  header: {
    fontSize: ms(22),
    fontWeight: 'bold',
    color: '#00ffff',
    marginTop: vs(15),
    marginBottom: vs(20),
  },
  scroll: {
    width: '95%',
  },
  gradientBorder: {
    borderRadius: ms(14),
    padding: ms(1),
    marginBottom: vs(10),
  },
  referralCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: ms(12),
    padding: s(14),
  },
  traderName: {
    fontSize: ms(16),
    fontWeight: 'bold',
    color: '#00ffff',
  },
  subscribedText: {
    fontSize: ms(13),
    color: '#ccc',
    marginTop: vs(3),
  },
  businessAmount: {
    fontSize: ms(17),
    fontWeight: 'bold',
    color: '#00ffff',
  },
  noReferrals: {
    color: '#aaa',
    fontSize: ms(15),
    marginTop: vs(20),
    textAlign: 'center',
  },
});
