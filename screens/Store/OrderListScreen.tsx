import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { supabase } from '../../utils/supabaseClient';
import { useUser } from '../../utils/UserContext';
import ScreenWrapper from '../../utils/ScreenWrapper';

// Import your Lottie JSON files (place them in assets/lottie/)
import pendingAnim from './StoreMedia/Confirmed.json';
import packedAnim from './StoreMedia/Confirmed.json';
import outForDeliveryAnim from './StoreMedia/OutForDelivery.json';
import deliveredAnim from './StoreMedia/Delivered.json';

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
        user:users(username),
        mobile,
        location,
        status,
        created_at,
        product:products(name, price)
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

  const getLottieByStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return pendingAnim;
      case 'packed':
        return packedAnim;
      case 'out for delivery':
        return outForDeliveryAnim;
      case 'delivered':
        return deliveredAnim;
      default:
        return pendingAnim;
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      {/* Top half: Lottie + status */}
      <View style={styles.topHalf}>
        <LottieView
          source={getLottieByStatus(item.status)}
          autoPlay
          loop
          style={{ width: 400, height: 300 }}
        />
        <View
          style={{
            alignItems: 'center',
            backgroundColor: '#450074ff',
            justifyContent: 'center',
            borderRadius: 20,
            marginBottom: 5,
            marginTop: -10,
          }}
        >
          <Text style={styles.statusText}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      {/* Bottom half: user, mobile, location, ordered on */}
      <View style={styles.bottomHalf}>
        <View style={styles.row}>
          <Text style={styles.productName}>{item.product?.name}</Text>
          <Text style={styles.price}>₹{item.product?.price}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Username</Text>
          <Text style={styles.value}>{item.user?.username || 'Unknown'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Mobile Number</Text>
          <Text style={styles.value}>{item.mobile}</Text>
        </View>
        <Text style={styles.centeredText}>{item.location}</Text>
        <Text style={styles.orderedOn}>
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
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: 'transparent',
    paddingBottom: 55,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  topHalf: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffffff',
    margin: 3,
    marginHorizontal: 10,
  },
  bottomHalf: { padding: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    marginHorizontal: 10,
  },
  label: { fontWeight: '600', color: '#333' },
  value: { color: '#555' },
  centeredText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#005300ff',
    marginVertical: 4,
    alignSelf: 'center',
    fontWeight: 'bold',
    marginTop: 10,
  },
  orderedOn: {
    fontSize: 12,
    color: '#777',

    alignItems: 'center',
    textAlign: 'center',
  },
  rowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  productName: { fontSize: 15, fontWeight: '600', color: '#333' },
  price: { fontSize: 15, fontWeight: '600', color: '#333' },
});
