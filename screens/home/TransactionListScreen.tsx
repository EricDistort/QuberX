import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useUser } from '../../utils/UserContext';
import ScreenWrapper from '../../utils/ScreenWrapper';
import { supabase } from '../../utils/supabaseClient';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';

export default function TransactionListScreen() {
  const { user } = useUser();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAllTransactions = async () => {
    if (!user?.account_number) return;
    setLoading(true);
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

  const renderItem = ({ item }: { item: any }) => {
    const isSent = item.sender_acc === user.account_number;
    const otherUser = isSent ? item.receiver : item.sender;

    return (
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.username}>
            {otherUser?.username || 'Unknown User'}
          </Text>
          <Text style={[styles.amount, { color: isSent ? 'red' : '#00c6ff' }]}>
            {isSent ? '-' : '+'}${Math.abs(item.amount)}
          </Text>
        </View>
        <Text style={styles.subText}>
          Date: {new Date(item.created_at).toLocaleString()}
        </Text>
        <Text style={styles.subText}>Account: {otherUser?.account_number}</Text>
        <Text style={styles.subText}>Transaction ID: {item.id}</Text>
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.header}>All Transactions</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#8CA6DB" />
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: vs(80) }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: vs(16),
    paddingRight: s(16),
    paddingLeft: s(16),
    marginTop: vs(40),
  },
  header: {
    fontSize: ms(22),
    fontWeight: 'bold',
    marginBottom: vs(12),
    color: '#00c6ff',
  },
  card: {
    backgroundColor: 'rgba(0, 0, 0, 1)',
    padding: s(14),
    borderRadius: ms(10),
    marginBottom: vs(12),
    elevation: 2,
    borderColor: '#00c6ff',
    borderWidth: ms(0.5),
  },
  username: { fontSize: ms(18), fontWeight: 'bold', color: '#ffffffff' },
  amount: { fontSize: ms(18), fontWeight: 'bold' },
  subText: { fontSize: ms(14), color: '#555', marginTop: vs(3) },
});
