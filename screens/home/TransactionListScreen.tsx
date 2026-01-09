import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
  const navigation = useNavigation<any>();
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
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate('TransactionDetailsScreen', { transaction: item })}
      >
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.username}>
              {otherUser?.username || 'Unknown User'}
            </Text>
            <Text style={[styles.amount, { color: isSent ? '#ff0055' : '#00ff9d' }]}>
              {isSent ? '-' : '+'}${Math.abs(item.amount)}
            </Text>
          </View>
          <Text style={styles.dateText}>
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.header}>Transactions</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#00c6ff" />
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
    paddingHorizontal: s(16),
    marginTop: vs(40),
  },
  header: {
    fontSize: ms(24),
    fontWeight: 'bold',
    marginBottom: vs(15),
    color: '#00c6ff',
    marginLeft: s(4),
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: s(16),
    borderRadius: ms(12),
    marginBottom: vs(12),
    borderLeftWidth: ms(4),
    borderLeftColor: '#00c6ff', // Simple accent line
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(6),
  },
  username: {
    fontSize: ms(18),
    fontWeight: 'bold',
    color: '#fff',
  },
  amount: {
    fontSize: ms(18),
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: ms(13),
    color: '#888',
  },
});