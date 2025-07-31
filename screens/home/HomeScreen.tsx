import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ImageBackground,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useUser } from '../../utils/UserContext';
import ScreenWrapper from '../../utils/ScreenWrapper';
import { launchImageLibrary } from 'react-native-image-picker';
import { supabase } from '../../utils/supabaseClient';

export default function HomeScreen({ navigation }: any) {
  const { user, setUser } = useUser();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserData = async () => {
    // Fetch updated balance
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
            <Image
              source={{
                uri: user?.profileImage || 'https://via.placeholder.com/80',
              }}
              style={styles.profileImage}
            />
            <View style={styles.userInfo}>
              <Text style={styles.name}>{user?.username || 'Guest User'}</Text>
              <Text style={styles.accountNumber}>
                Account No: {user?.account_number || '0000000000'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditProfileImage}
            >
              <Image
                source={require('../homeMedia/editbutton.webp')}
                style={styles.editImage}
              />
            </TouchableOpacity>
          </View>

          {/* Balance Section */}
          <View style={styles.secondContainerWrapper}>
            <ImageBackground
              source={require('../homeMedia/balancecard.webp')}
              style={styles.secondContainer}
              resizeMode="contain"
            >
              <View style={styles.balanceOverlay}>
                <Text style={styles.balanceSubHeader}>Current Balance</Text>
                <Text style={styles.balanceAmount}>
                  ${user?.balance || '0.00'}
                </Text>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('HomeDetails')}
                  >
                    <Text style={styles.buttonText}>Send</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('HomeRecieve')}
                  >
                    <Text style={styles.buttonText}>Receive</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ImageBackground>
          </View>

          {/* Transactions Section */}
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
                  return (
                    <View key={tx.id} style={styles.transactionCard}>
                      <View>
                        <Text style={styles.transactionName}>
                          {otherUser?.username || 'Unknown User'}
                        </Text>
                        <Text style={styles.transactionAccount}>
                          Account: {otherUser?.account_number}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.transactionAmount,
                          { color: isSent ? 'red' : 'green' },
                        ]}
                      >
                        {isSent ? '-' : '+'}${Math.abs(tx.amount)}
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
    paddingVertical: 5,
  },
  firstContainer: {
    width: '95%',
    height: '23%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(248, 235, 255, 1)',
  },
  userInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  accountNumber: { fontSize: 14, color: '#555', marginTop: 2 },
  editButton: { padding: 8 },
  secondContainerWrapper: {
    width: '92%',
    height: '30%',

    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: -60,
  },
  secondContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  balanceOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  balanceSubHeader: { fontSize: 16, color: 'rgba(212, 249, 255, 0.84)' },
  balanceAmount: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  actionButton: {
    backgroundColor: '#fff',
    width: 120,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'rgba(82, 82, 82, 1)',
    fontWeight: 'bold',
    fontSize: 16,
  },
  thirdContainer: {
    width: '95%',
    height: '45%',
    borderRadius: 12,
    padding: 10,
    overflow: 'hidden',
    marginBottom: 30,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  transactionsTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  seeAll: { fontSize: 14, color: '#7e7e7eff' },
  transactionsList: { flex: 1 },
  transactionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionName: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  transactionAccount: { fontSize: 13, color: '#666' },
  transactionAmount: { fontSize: 16, fontWeight: 'bold', alignSelf: 'center' },
  editImage: { width: 24, height: 24, resizeMode: 'contain' },
});
