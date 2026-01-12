import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Pressable,
} from 'react-native';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';
import { useUser } from '../../utils/UserContext';
import ScreenWrapper from '../../utils/ScreenWrapper';
import { supabase } from '../../utils/supabaseClient';
import LinearGradient from 'react-native-linear-gradient';

// --- POP BUTTON COMPONENT ---
const PopScaleButton = ({ children, onPress, style }: any) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.9,
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
      <Animated.View
        style={{
          transform: [{ scale: scaleValue }],
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default function HomeScreen({ navigation }: any) {
  const { user, setUser } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [traders, setTraders] = useState<any[]>([]);
  const [loadingTraders, setLoadingTraders] = useState(false);

  // 1️⃣ State for Dynamic Button (Default fallback)
  const [partnerData, setPartnerData] = useState({
    name: 'SantrX',
    url: 'https://santrx.com/login',
  });

  const fetchUserData = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('users')
        .select(
          'balance, profileImage, username, account_number, direct_business',
        )
        .eq('id', user.id)
        .single();
      if (!error && data) setUser((prev: any) => ({ ...prev, ...data }));
    } catch (error) {
      console.log('User fetch error:', error);
    }
  };

  const fetchTraders = async () => {
    setLoadingTraders(true);
    try {
      const { data, error } = await supabase
        .from('fake_traders')
        .select('id, name, image_url, designation');

      if (error) throw error;

      if (data) {
        // 2️⃣ Find ID 10 and set it to partnerData
        const partnerNode = data.find((item: any) => item.id === 10);
        if (partnerNode) {
          setPartnerData({
            name: partnerNode.name,
            url: partnerNode.image_url, // Using image_url as the website link per request
          });
        }

        // Filter out ID 10 so it doesn't appear in the list below
        const listData = data.filter((item: any) => item.id !== 10);

        const initialized = listData.map((t: any) => ({
          ...t,
          amount: Math.floor(Math.random() * 1000) + 100,
          trend: 'up',
        }));
        setTraders(initialized);
      }
    } catch (error: any) {
      console.log('Error fetching traders:', error.message);
    } finally {
      setLoadingTraders(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    fetchUserData();
    fetchTraders();

    const interval = setInterval(() => {
      setTraders(prev =>
        prev.map(t => {
          const change = (Math.random() * 20 - 10).toFixed(2);
          const newAmount = Math.max(0, t.amount + Number(change));
          return {
            ...t,
            amount: newAmount,
            trend: Number(change) >= 0 ? 'up' : 'down',
          };
        }),
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchUserData(), fetchTraders()]);
    setRefreshing(false);
  }, [user?.id]);

  const handleProfilePress = () => {
    navigation.navigate('ProfileScreen');
  };

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ff00d4"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Profile Section */}
          <View style={styles.firstContainer}>
            <PopScaleButton onPress={handleProfilePress}>
              <View style={styles.avatarContainer}>
                <Image
                  source={
                    user?.profileImage
                      ? { uri: user.profileImage }
                      : require('../homeMedia/Avatar.png')
                  }
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              </View>
            </PopScaleButton>

            <View style={styles.userInfo}>
              <Text style={styles.name}>{user?.username || 'Guest User'}</Text>
              <Text style={styles.accountNumber}>
                Account No {user?.account_number || '0000000000'}
              </Text>
            </View>

            <PopScaleButton
              style={styles.editButton}
              onPress={() => navigation.navigate('Help')}
            >
              <Image
                source={require('../homeMedia/support.webp')}
                style={styles.editImage}
              />
            </PopScaleButton>
          </View>

          {/* Balance Section */}
          <View style={styles.secondContainerWrapper}>
            <LinearGradient
              colors={['#7b0094ff', '#ff00d4ff']}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientCard}
            >
              <View style={styles.balanceOverlay}>
                <Text style={styles.balanceSubHeader}>Trading Balance</Text>
                <Text style={styles.balanceAmount}>
                  ${user?.balance || '0'}
                </Text>

                <View style={styles.fourButtonRow}>
                  {[
                    {
                      name: 'Deposit',
                      icon: require('../homeMedia/deposit.webp'),
                      onPress: () => navigation.navigate('DepositMoney'),
                    },
                    {
                      name: 'Rewards',
                      icon: require('../homeMedia/send.webp'),
                      onPress: () => navigation.navigate('StoreMain'),
                    },
                    {
                      name: 'News',
                      icon: require('../homeMedia/recieve.webp'),
                      onPress: () => navigation.navigate('RecieveMoney'),
                    },
                    {
                      name: 'Withdraw',
                      icon: require('../homeMedia/withdraw.webp'),
                      onPress: () => navigation.navigate('WithdrawalMoney'),
                    },
                  ].map((btn, index) => (
                    <PopScaleButton
                      key={index}
                      style={styles.imageButton}
                      onPress={btn.onPress}
                    >
                      <Image source={btn.icon} style={styles.buttonIcon} />
                      <Text style={styles.buttonLabel}>{btn.name}</Text>
                    </PopScaleButton>
                  ))}
                </View>
              </View>
            </LinearGradient>
          </View>

          <View style={{ flexDirection: 'row', gap: s(8) }}>
            <PopScaleButton
              onPress={() => navigation.navigate('RecieveMoneyScreen')}
            >
              <Text style={styles.withdrawableText}>
                Direct Business{' '}
                <Text style={styles.boldAmount}>
                  ${user?.direct_business || 0}
                </Text>
              </Text>
            </PopScaleButton>

            <PopScaleButton
              onPress={() =>
                navigation.navigate('BrowserScreen', {
                  url: partnerData.url,
                  title: partnerData.name,
                })
              }
            >
              <Text style={styles.withdrawableText}>
                {' '}
                <Text style={styles.boldAmount}>{partnerData.name}</Text>
              </Text>
            </PopScaleButton>
          </View>

          {/* Live Traders Section */}
          <View style={styles.thirdContainer}>
            <Text style={styles.transactionsTitle}>Live Traders</Text>
            {loadingTraders ? (
              <ActivityIndicator size="small" color="#ff00d4" />
            ) : (
              <View style={{ height: vs(250), width: '100%' }}>
                <ScrollView
                  contentContainerStyle={{
                    alignItems: 'center',
                    paddingBottom: vs(200),
                  }}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                >
                  {traders.map(trader => (
                    <PopScaleButton
                      key={trader.id}
                      style={styles.traderCard}
                      onPress={() => navigation.navigate('SendMoney')}
                    >
                      <View style={styles.traderCardInner}>
                        <View
                          style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                          <Image
                            source={{ uri: trader.image_url }}
                            style={styles.traderImage}
                          />
                          <View style={{ alignItems: 'flex-start' }}>
                            <Text style={styles.traderName}>{trader.name}</Text>
                            <Text style={styles.traderDesignation}>
                              {trader.designation}
                            </Text>
                          </View>
                        </View>
                        <Text
                          style={[
                            styles.traderAmount,
                            {
                              color:
                                trader.trend === 'up'
                                  ? '#48ff00ff'
                                  : '#ff0000ff',
                            },
                          ]}
                        >
                          {trader.trend === 'up' ? '▲' : '▼'}$
                          {trader.amount.toFixed(2)}
                        </Text>
                      </View>
                    </PopScaleButton>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingVertical: vs(5) },
  firstContainer: {
    width: '95%',
    height: '11%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(10),
    marginTop: vs(25),
    //backgroundColor: 'white',
  },
  userInfo: { flex: 1 },
  name: { fontSize: ms(18), fontWeight: 'bold', color: '#f3fcffff' },
  accountNumber: { fontSize: ms(14), color: '#ffffff7a', marginTop: vs(2) },
  editButton: { padding: ms(8) },
  editImage: { width: s(30), height: s(30), resizeMode: 'cover' },

  // Avatar Styles
  avatarContainer: {
    width: s(70),
    height: s(70),
    borderRadius: ms(50),
    marginRight: s(12),
    borderWidth: s(5),
    borderColor: '#ffffff28',
    justifyContent: 'center',
    alignItems: 'center',
    //backgroundColor: '#333',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },

  secondContainerWrapper: {
    width: '92%',
    height: '30%',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: vs(10),
    borderRadius: ms(50),
    backgroundColor: '#000',
    shadowColor: '#7b0094',
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 1,
    shadowRadius: ms(10),
    elevation: 10,
    borderColor: '#ff00d4',
    borderWidth: ms(1),
  },
  gradientCard: {
    width: '100%',
    height: '100%',
    borderRadius: ms(20),
    alignSelf: 'center',
  },
  balanceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: s(20),
  },
  balanceSubHeader: { fontSize: ms(16), color: 'rgba(255, 255, 255, 0.9)' },
  balanceAmount: {
    fontSize: ms(50),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: vs(20),
  },
  fourButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: vs(-20),
  },
  imageButton: { justifyContent: 'center', alignItems: 'center', flex: 1 },
  buttonIcon: { width: s(50), height: s(45) },
  buttonLabel: { fontSize: ms(12), color: '#fff', textAlign: 'center' },
  withdrawableText: {
    marginTop: vs(8),
    marginBottom: vs(5),
    fontSize: ms(13),
    color: '#d6d6d6ff',
    textAlign: 'center',
    backgroundColor: '#ff00d41f',
    paddingHorizontal: s(10),
    paddingVertical: vs(2),
    borderRadius: ms(20),
    borderWidth: 0.5,
    borderColor: '#ff00d4',
  },
  boldAmount: { fontWeight: 'bold', fontSize: ms(16), color: '#ff33ddff' },
  thirdContainer: {
    width: '98%',
    borderRadius: ms(12),
    padding: s(10),
    marginBottom: vs(30),
  },
  transactionsTitle: {
    fontSize: ms(18),
    fontWeight: 'bold',
    color: '#ff00d4',
    marginBottom: vs(10),
  },
  traderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: ms(25),
    marginBottom: vs(10),
    width: '100%',
  },
  traderCardInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: s(10),
    width: '100%',
  },
  traderImage: {
    width: s(45),
    height: s(45),
    borderRadius: ms(30),
    marginRight: s(10),
  },
  traderName: { fontSize: ms(15), fontWeight: 'bold', color: '#fff' },
  traderDesignation: { fontSize: ms(13), color: '#aaa' },
  traderAmount: { fontSize: ms(15), fontWeight: 'bold', marginTop: vs(4) },
});
