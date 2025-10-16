import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';
import { useUser } from '../../utils/UserContext';
import ScreenWrapper from '../../utils/ScreenWrapper';
import { launchImageLibrary } from 'react-native-image-picker';
import { supabase } from '../../utils/supabaseClient';
import LinearGradient from 'react-native-linear-gradient';

export default function HomeScreen({ navigation }: any) {
  const { user, setUser } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [traders, setTraders] = useState<any[]>([]);
  const [loadingTraders, setLoadingTraders] = useState(false);

  const fetchUserData = async () => {
    const { data, error } = await supabase
      .from('users')
      .select(
        'balance, profileImage, username, account_number, direct_business',
      )
      .eq('id', user.id)
      .single();
    if (!error && data) setUser({ ...user, ...data });
  };

  const fetchTraders = async () => {
    setLoadingTraders(true);
    const { data, error } = await supabase
      .from('fake_traders')
      .select('id, name, image_url, designation');
    if (!error && data) {
      const initialized = data.map(t => ({
        ...t,
        amount: Math.floor(Math.random() * 1000) + 100,
        trend: 'up',
      }));
      setTraders(initialized);
    }
    setLoadingTraders(false);
  };

  useEffect(() => {
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
  }, [user?.account_number]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserData();
    await fetchTraders();
    setRefreshing(false);
  }, [user?.account_number]);

  const handleEditProfileImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.7,
    });
    if (result.didCancel || !result.assets) return;

    const file = result.assets[0];
    const fileExt = file.fileName?.split('.').pop() || 'jpg';
    const filePath = `avatars/${user.id}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(
          filePath,
          {
            uri: file.uri,
            type: file.type,
            name: file.fileName,
          },
          { upsert: true },
        );
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      const { error: updateError } = await supabase
        .from('users')
        .update({ profileImage: publicUrl })
        .eq('id', user.id);
      if (updateError) throw updateError;

      setUser({ ...user, profileImage: publicUrl });
      Alert.alert('Success', 'Profile picture updated!');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Profile Section */}
          <View style={styles.firstContainer}>
            <TouchableOpacity onPress={handleEditProfileImage}>
              <View
                style={{
                  width: s(60),
                  height: s(60),
                  borderRadius: ms(30),
                  marginRight: s(12),
                  borderWidth: s(2),
                  borderColor: '#00c6ff',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: user?.profileImage ? 'transparent' : 'grey',
                }}
              >
                {user?.profileImage ? (
                  <Image
                    source={{ uri: user.profileImage }}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: ms(30),
                    }}
                  />
                ) : (
                  <Text
                    style={{
                      color: 'white',
                      fontSize: ms(12),
                      textAlign: 'center',
                    }}
                  >
                    Add Image
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.userInfo}>
              <Text style={styles.name}>{user?.username || 'Guest User'}</Text>
              <Text style={styles.accountNumber}>
                Account No {user?.account_number || '0000000000'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('Help')}
            >
              <Image
                source={require('../homeMedia/support.webp')}
                style={styles.editImage}
              />
            </TouchableOpacity>
          </View>

          {/* Balance Section */}
          <View style={styles.secondContainerWrapper}>
            <LinearGradient
              colors={['#00c6ff', '#ff00ff']}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: ms(20),
                alignSelf: 'center',
              }}
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
                      onPress: () => navigation.navigate('SendMoney'),
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
                    <TouchableOpacity
                      key={index}
                      style={styles.imageButton}
                      onPress={btn.onPress}
                    >
                      <Image source={btn.icon} style={styles.buttonIcon} />
                      <Text style={styles.buttonLabel}>{btn.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </LinearGradient>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('RecieveMoneyScreen')}>
            <Text style={styles.withdrawableText}>
              Direct Business{' '}
              <Text style={styles.boldAmount}>${user?.direct_business || 0}</Text>
            </Text>
          </TouchableOpacity>

          {/* Live Traders Section */}
          <View style={styles.thirdContainer}>
            <Text style={styles.transactionsTitle}>Live Traders</Text>

            {loadingTraders ? (
              <ActivityIndicator size="small" color="#00c6ff" />
            ) : (
              <View style={{ height: vs(250), width: '100%' }}>
                <ScrollView
                  contentContainerStyle={{
                    alignItems: 'center',
                    paddingBottom: vs(30),
                  }}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                >
                  {traders.map(trader => (
                    <View key={trader.id} style={styles.traderCard}>
                      <View
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                      >
                        <Image
                          source={{ uri: trader.image_url }}
                          style={styles.traderImage}
                        />
                        <View
                          style={{
                            alignItems: 'flex-start',
                            backgroundColor: 'transparent',
                          }}
                        >
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
                            color: trader.trend === 'up' ? '#48ff00ff' : '#ff0000ff',
                          },
                        ]}
                      >
                        {trader.trend === 'up' ? '▲' : '▼'}$
                        {trader.amount.toFixed(2)}
                      </Text>
                    </View>
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
    height: '23%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(15),
  },
  userInfo: { flex: 1 },
  name: { fontSize: ms(18), fontWeight: 'bold', color: '#f3fcffff' },
  accountNumber: { fontSize: ms(14), color: '#afeeff8c', marginTop: vs(2) },
  editButton: { padding: ms(8) },
  editImage: { width: s(30), height: s(30), resizeMode: 'contain' },
  secondContainerWrapper: {
    width: '92%',
    height: '30%',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: vs(-32),
    borderRadius: ms(20),
    backgroundColor: '#000',
    shadowColor: 'rgba(40, 0, 85, 1)',
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 1,
    shadowRadius: ms(10),
    elevation: 10,
    borderColor: '#00c6ff',
    borderWidth: ms(1),
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
  balanceSubHeader: { fontSize: ms(16), color: 'rgba(212, 249, 255, 0.84)' },
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
    color: '#a5a5a5ff',
    textAlign: 'center',
  },
  boldAmount: { fontWeight: 'bold', fontSize: ms(16), color: '#fff' },
  thirdContainer: {
    width: '98%',
    borderRadius: ms(12),
    padding: s(10),
    marginBottom: vs(30),
  },
  transactionsTitle: {
    fontSize: ms(18),
    fontWeight: 'bold',
    color: '#00c6ff',
    marginBottom: vs(10),
  },
  traderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: ms(10),
    padding: s(10),
    marginBottom: vs(10),
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
