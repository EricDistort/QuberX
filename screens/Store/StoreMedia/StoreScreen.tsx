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
import { supabase } from '../../../utils/supabaseClient';
import { useUser } from '../../../utils/UserContext';
import ScreenWrapper from '../../../utils/ScreenWrapper';

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
        <Text style={styles.price}>₹{item.price}</Text>
      </View>
      <TouchableOpacity
        onPress={() => handleBuyPress(item)}
        style={{ marginTop: 8 }}
      >
        <LinearGradient
          colors={['#8CA6DB', '#B993D6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buyBtn}
        >
          <Text
            style={{ color: '#fff', fontWeight: 'bold', alignSelf: 'center' }}
          >
            Buy
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View
          style={{
            marginTop: 40,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 25,
              fontWeight: 'bold',
              marginBottom: 12,
              color: '#612369ff',
            }}
          >
            Online Store
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('OrderList')}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: 'light',
                marginBottom: 12,
                color: '#612369ff',
              }}
            >
              Order List
            </Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        />

        {/* Purchase Modal */}
        <Modal visible={!!selectedProduct} transparent animationType="slide">
          <ScreenWrapper>
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setSelectedProduct(null)} // dismiss when overlay pressed
            >
              <TouchableOpacity
                activeOpacity={1}
                style={styles.modalCard} // card itself should not dismiss
              >
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
                      ₹{selectedProduct.price}
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Mobile Number"
                      placeholderTextColor="#888"
                      value={mobileNumber}
                      onChangeText={setMobileNumber}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Location"
                      placeholderTextColor="#888"
                      value={location}
                      onChangeText={setLocation}
                    />
                    <TouchableOpacity
                      onPress={confirmPurchase}
                      style={{ width: '100%', marginTop: 10 }}
                    >
                      <LinearGradient
                        colors={['#8CA6DB', '#B993D6']}
                        style={styles.buyNowBtn}
                      >
                        <Text
                          style={{
                            color: '#fff',
                            fontWeight: 'bold',
                            fontSize: 16,
                          }}
                        >
                          Buy Now
                        </Text>
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
    paddingTop: 12,
    paddingLeft: 14,
    paddingRight: 14,
    marginBottom: 60,
  },
  card: {
    width: cardWidth,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    alignItems: 'center',
  },
  image: { width: '100%', height: 120, borderRadius: 8 },
  name: { fontSize: 14, fontWeight: 'bold', alignSelf: 'flex-start' },
  price: { fontSize: 14, color: '#444', alignSelf: 'flex-end' },
  buyBtn: {
    borderRadius: 8,
    width: 140,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(69, 58, 75, 0)',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },

  modalCard: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalImage: {
    width: 1920 / 8,
    height: 1080 / 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  modalPrice: { fontSize: 16, color: '#555', marginBottom: 10 },
  input: {
    width: '100%',
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: 'rgba(36, 0, 31, 0.07)',
  },
  buyNowBtn: { padding: 12, borderRadius: 10, alignItems: 'center' },
});
