import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Dimensions,
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

const { width } = Dimensions.get('window');
const cardWidth = width / 2 - 20;

export default function StoreScreen({ navigation }: any) {
  const { user } = useUser();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (!error) setProducts(data || []);
  };

  const handleBuyPress = async (product: any) => {
    if (user.withdrawal_amount < product.price) {
      Alert.alert('Error', 'Insufficient withdrawal balance!');
      return;
    }
    setSelectedProduct(product);
  };

  const confirmPurchase = async () => {
    if (!mobileNumber.trim() || !location.trim()) {
      Alert.alert('Error', 'Please fill in all details');
      return;
    }

    const { error } = await supabase.from('purchases').insert([
      {
        user_id: user.id,
        product_id: selectedProduct.id,
        mobile: mobileNumber,
        location,
        status: 'pending',
      },
    ]);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setSelectedProduct(null);
      setMobileNumber('');
      setLocation('');
      Alert.alert('Success', 'Purchased Successfully!');
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
        <Image source={{ uri: item.image_url }} style={styles.image} />
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 6,
            width: '100%',
          }}
        >
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>${item.price}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleBuyPress(item)}
          style={{ marginTop: 8 }}
        >
          <LinearGradient
            colors={['#00ffff', '#007fff']}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={styles.buyBtn}
          >
            <Text style={styles.buyText}>Claim</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Achievements</Text>
          <TouchableOpacity onPress={() => navigation.navigate('OrderList')}>
            <Text style={styles.orderList}>Order List</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            marginBottom: vs(16),
          }}
          showsVerticalScrollIndicator={false}
        />

        {/* Purchase Modal */}
        <Modal visible={!!selectedProduct} transparent animationType="slide">
          <ScreenWrapper>
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setSelectedProduct(null)}
            >
              <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
                {selectedProduct && (
                  <>
                    <Image
                      source={{ uri: selectedProduct.image_url }}
                      style={styles.modalImage}
                    />
                    <Text style={styles.modalTitle}>
                      {selectedProduct.name}
                    </Text>
                    <Text style={styles.modalPrice}>
                      ${selectedProduct.price}
                    </Text>

                    <TextInput
                      style={styles.input}
                      placeholder="Mobile Number"
                      placeholderTextColor="#777"
                      value={mobileNumber}
                      onChangeText={setMobileNumber}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Location"
                      placeholderTextColor="#777"
                      value={location}
                      onChangeText={setLocation}
                    />

                    <TouchableOpacity
                      onPress={confirmPurchase}
                      style={{ width: '100%', marginTop: vs(10) }}
                    >
                      <LinearGradient
                        colors={['#00ffff', '#007fff']}
                        start={{ x: 0, y: 1 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buyNowBtn}
                      >
                        <Text style={styles.buyNowText}>Claim Now</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </>
                )}
              </TouchableOpacity>
            </TouchableOpacity>
          </ScreenWrapper>
        </Modal>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: vs(12),
    paddingHorizontal: s(14),
    marginBottom: vs(80),
  },
  header: {
    marginTop: vs(40),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: ms(24),
    fontWeight: 'bold',
    color: '#00ffff',
    marginBottom: vs(12),
  },
  orderList: {
    fontSize: ms(15),
    color: '#00ffff',
    marginBottom: vs(8),
  },
  gradientBorder: {
    borderRadius: ms(14),
    //padding: ms(2),
    width: cardWidth,
  },
  card: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: ms(14),
    padding: s(10),
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: vs(120),
    borderRadius: ms(8),
    borderWidth: 1,
    borderColor: '#00ffff',
    resizeMode: 'cover',
  },
  name: {
    fontSize: ms(14),
    fontWeight: 'bold',
    color: '#fff',
    alignSelf: 'flex-start',
  },
  price: {
    fontSize: ms(14),
    color: '#00ffff',
    alignSelf: 'flex-end',
    fontWeight: 'bold',
  },
  buyBtn: {
    borderRadius: ms(8),
    width: s(120),
    height: vs(35),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: ms(14),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderRadius: ms(16),
    padding: s(16),
    alignItems: 'center',
  },
  modalImage: {
    width: s(160),
    height: s(120),
    borderRadius: ms(10),
    marginBottom: vs(10),
  },
  modalTitle: {
    fontSize: ms(18),
    fontWeight: 'bold',
    color: '#fff',
  },
  modalPrice: {
    fontSize: ms(16),
    color: '#00ffff',
    marginBottom: vs(10),
  },
  input: {
    width: '100%',
    borderRadius: ms(8),
    marginTop: vs(8),
    backgroundColor: 'rgba(0,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.2)',
    color: '#fff',
    padding: ms(10),
    fontSize: ms(15),
  },
  buyNowBtn: {
    paddingVertical: ms(12),
    borderRadius: ms(10),
    alignItems: 'center',
  },
  buyNowText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: ms(17),
  },
});
