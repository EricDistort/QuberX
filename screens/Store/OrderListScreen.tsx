import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { supabase } from '../../utils/supabaseClient';
import { useUser } from '../../utils/UserContext';
import ScreenWrapper from '../../utils/ScreenWrapper';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';

// Import Lottie animations
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
    <LinearGradient
      colors={['#00c6ff', '#ff00ff']}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradientBorder}
    >
      <View style={styles.card}>
        {/* Top Half */}
        <View style={styles.topHalf}>
          <LottieView
            source={getLottieByStatus(item.status)}
            autoPlay
            loop
            style={styles.lottie}
          />
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Bottom Half */}
        <View style={styles.bottomHalf}>
          <View style={styles.row}>
            <Text style={styles.productName}>{item.product?.name}</Text>
            <Text style={styles.price}>${item.product?.price}</Text>
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
    </LinearGradient>
  );

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>My Orders</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#00ffff" />
        ) : orders.length === 0 ? (
          <Text style={styles.noOrders}>You have no orders yet.</Text>
        ) : (
          <FlatList
            data={orders}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={{ paddingBottom: vs(30) }}
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
    padding: s(10),
    paddingBottom: vs(55),
    paddingLeft: s(25),
   
  },
  title: {
    fontSize: ms(22),
    fontWeight: 'bold',
    color: '#00ffff',
    textAlign: 'center',
    marginBottom: vs(16),
    marginTop: vs(10),
  },
  gradientBorder: {
    borderRadius: ms(14),
    //padding: ms(2),
    marginBottom: vs(14),
    width: '95%',
  },
  card: {
    backgroundColor: 'rgba(0, 0, 0, 0.81)',
    borderRadius: ms(14),
    overflow: 'hidden',
  },
  topHalf: {
    alignItems: 'center',
    paddingVertical: vs(8),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  lottie: {
    width: s(300),
    height: s(300),
  },
  statusBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,0,255,0.2)',
    borderColor: '#ff00ff',
    borderWidth: 1,
    justifyContent: 'center',
    borderRadius: ms(16),
    paddingHorizontal: s(12),
    paddingVertical: vs(4),
    marginBottom: vs(4),
  },
  statusText: {
    fontSize: ms(15),
    fontWeight: 'bold',
    color: '#fff',
  },
  bottomHalf: {
    padding: s(12),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vs(6),
    marginHorizontal: s(6),
  },
  productName: {
    fontSize: ms(15),
    fontWeight: '600',
    color: '#00ffff',
  },
  price: {
    fontSize: ms(15),
    fontWeight: 'bold',
    color: '#ff00ff',
  },
  label: {
    fontWeight: '600',
    color: '#bbb',
  },
  value: {
    color: '#fff',
  },
  centeredText: {
    textAlign: 'center',
    fontSize: ms(14),
    color: '#00ffff',
    marginTop: vs(15),
    fontWeight: '600',
  },
  orderedOn: {
    fontSize: ms(12),
    color: '#aaa',
    textAlign: 'center',
    marginTop: vs(2),
  },
  noOrders: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: ms(15),
    marginTop: vs(30),
  },
});
