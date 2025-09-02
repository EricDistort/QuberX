import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../../../utils/supabaseClient';
import { useUser } from '../../../utils/UserContext';
import ScreenWrapper from '../../../utils/ScreenWrapper';

export default function OrdersScreen() {
  const { user } = useUser();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('purchases')
      .select(
        `
        id,
        mobile,
        location,
        status,
        created_at,
        product:products(name, price, image_url)
      `,
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error) setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.id]);

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Image source={{ uri: item.product?.image_url }} style={styles.image} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.name}>{item.product?.name}</Text>
        <Text style={styles.price}>₹{item.product?.price}</Text>
        <Text style={styles.details}>Mobile: {item.mobile}</Text>
        <Text style={styles.details}>Location: {item.location}</Text>
        <Text style={styles.status}>
          Status: {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
        <Text style={styles.date}>
          Ordered on: {new Date(item.created_at).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>My Orders</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : orders.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            You have no orders yet.
          </Text>
        ) : (
          <FlatList
            data={orders}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: 'transparent' },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  image: { width: 100, height: 100, borderRadius: 8 },
  name: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  price: { fontSize: 15, color: '#444', marginBottom: 4 },
  details: { fontSize: 14, color: '#555' },
  status: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  date: { fontSize: 12, color: '#777', marginTop: 4 },
});
