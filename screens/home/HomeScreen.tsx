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
import LottieView from 'lottie-react-native';

export default function HomeScreen({ navigation }: any) {
  const { user, setUser } = useUser();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserData = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('balance, profileImage, username, account_number')
      .eq('id', user.id)
      .single();
    if (!error && data) {
      setUser({ ...user, ...data });
    }
  };

  const fetchTransactions = async () => {
    if (!user?.account_number) return;
    setLoadingTransactions(true);
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
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error) setTransactions(data || []);
    setLoadingTransactions(false);
  };

  useEffect(() => {
    fetchUserData();
    fetchTransactions();
  }, [user?.account_number]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserData();
    await fetchTransactions();
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
                  borderColor: 'rgba(248, 235, 255, 1)',
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
          {/* Replace the current Balance Section in your HomeScreen with this */}
          <View style={styles.secondContainerWrapper}>
            <LottieView
              source={require('../homeMedia/balanceanimation.json')}
              style={[styles.secondContainer, { opacity: 0.7 }]}
              autoPlay
              loop
            />
            <View style={styles.balanceOverlay}>
              <Text style={styles.balanceSubHeader}>Current Balance</Text>
              <Text style={styles.balanceAmount}>₹{user?.balance || '0'}</Text>

              {/* Four horizontal image buttons */}
              <View style={styles.fourButtonRow}>
                {[
                  {
                    name: 'Send',
                    icon: require('../homeMedia/send.webp'),
                    onPress: () => navigation.navigate('HomeDetails'),
                  },
                  {
                    name: 'Receive',
                    icon: require('../homeMedia/recieve.webp'),
                    onPress: () => navigation.navigate('HomeRecieve'),
                  },
                  {
                    name: 'Deposit',
                    icon: require('../homeMedia/deposit.webp'),
                    onPress: () => navigation.navigate('DepositScreen'),
                  },
                  {
                    name: 'History',
                    icon: require('../homeMedia/withdraw.webp'),
                    onPress: () => navigation.navigate('TransactionList'),
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
          </View>

          <Text style={styles.withdrawableText}>
            Total Referrals{' '}
            <Text style={styles.boldAmount}>₹{user?.referrals || 0}</Text>
          </Text>

          {/* Transactions */}
          <View style={styles.thirdContainer}>
            <View style={styles.transactionsHeader}>
              <Text style={styles.transactionsTitle}>Transactions</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('TransactionList')}
              >
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>

            {loadingTransactions ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <ScrollView
                style={styles.transactionsList}
                showsVerticalScrollIndicator={false}
              >
                {transactions.map(tx => {
                  const isSent = tx.sender_acc === user.account_number;
                  const otherUser = isSent ? tx.receiver : tx.sender;
                  const transactionDate = new Date(tx.created_at);
                  const formattedDate = `${transactionDate.getDate()}/${
                    transactionDate.getMonth() + 1
                  }/${transactionDate.getFullYear()}`;

                  return (
                    <View key={tx.id} style={styles.transactionCard}>
                      <View>
                        <Text style={styles.transactionName}>
                          {otherUser?.username || 'Unknown User'}
                        </Text>
                        <Text style={styles.transactionAccount}>
                          Date {formattedDate}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.transactionAmount,
                          { color: isSent ? 'red' : 'green' },
                        ]}
                      >
                        {isSent ? '-' : '+'}₹{Math.abs(tx.amount)}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: vs(5),
  },
  firstContainer: {
    width: '95%',
    height: '23%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(15),
  },
  userInfo: { flex: 1 },
  name: { fontSize: ms(18), fontWeight: 'bold', color: '#222222ff' },
  accountNumber: { fontSize: ms(14), color: '#555', marginTop: vs(2) },
  editButton: { padding: ms(8) },
  secondContainerWrapper: {
    width: '92%',
    height: '30%',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: vs(-32),
    borderRadius: ms(20),
  },
  secondContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: s(500),
    height: s(500),
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  actionButton: {
    backgroundColor: '#fff',
    width: s(120),
    height: vs(40),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: ms(50),
    marginHorizontal: s(5),
  },
  buttonText: {
    color: 'rgba(82, 82, 82, 1)',
    fontWeight: 'bold',
    fontSize: ms(16),
  },
  thirdContainer: {
    width: '95%',
    height: '44%',
    borderRadius: ms(12),
    padding: s(10),
    overflow: 'hidden',
    marginBottom: vs(30),
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vs(10),
  },
  transactionsTitle: { fontSize: ms(18), fontWeight: 'bold', color: '#333' },
  seeAll: { fontSize: ms(14), color: '#7e7e7eff' },
  transactionsList: { height: vs(80) },
  transactionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.38)',
    borderRadius: ms(10),
    padding: s(12),
    marginBottom: vs(8),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionName: { fontSize: ms(16), fontWeight: 'bold', color: '#222' },
  transactionAccount: { fontSize: ms(13), color: '#666' },
  transactionAmount: {
    fontSize: ms(16),
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  editImage: { width: s(30), height: s(30), resizeMode: 'contain' },
  withdrawableText: {
    marginTop: vs(8),
    marginBottom: vs(5),
    fontSize: ms(13),
    color: '#555',
    textAlign: 'center',
  },
  boldAmount: {
    fontWeight: 'bold',
    fontSize: ms(16),
  },

  fourButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: vs(-20),
  },
  imageButton: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  buttonIcon: {
    width: s(50),
    height: s(45),
  },
  buttonLabel: {
    fontSize: ms(12),
    color: '#fff',
    textAlign: 'center',
  },
});
