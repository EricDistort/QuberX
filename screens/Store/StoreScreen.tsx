import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Modal,
  TextInput,
  Alert,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Animated,
  Pressable,
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
const cardWidth = width / 2 - s(24); // Adjusted for better spacing

// --- POP BUTTON COMPONENT ---
const PopButton = ({ onPress, children, style, disabled }: any) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
      style={style}
    >
      <Animated.View
        style={{ transform: [{ scale: scaleValue }], width: '100%' }}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default function StoreScreen({ navigation }: any) {
  const { user } = useUser();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  // Theme Gradient
  const THEME_GRADIENT = ['#7b0094ff', '#ff00d4ff'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (!error) setProducts(data || []);
  };

  const handleBuyPress = async (product: any) => {
    if (user.withdrawal_amount < product.price) {
      Alert.alert(
        'Insufficient Balance',
        'You need more balance to claim this item.',
      );
      return;
    }
    setSelectedProduct(product);
  };

  const confirmPurchase = async () => {
    if (!mobileNumber.trim() || !location.trim()) {
      Alert.alert(
        'Missing Details',
        'Please fill in your mobile number and location.',
      );
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('purchases').insert([
      {
        user_id: user.id,
        product_id: selectedProduct.id,
        mobile: mobileNumber,
        location,
        status: 'pending',
      },
    ]);

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setSelectedProduct(null);
      setMobileNumber('');
      setLocation('');
      Alert.alert('Success', 'Claim request submitted successfully!');
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.cardContainer}>
      {/* Gradient Border Wrapper */}
      <LinearGradient
        colors={THEME_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      >
        <View style={styles.cardInner}>
          {/* Product Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.image_url }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>

          {/* Product Info */}
          <View style={styles.cardContent}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.price}>${item.price}</Text>
          </View>

          {/* Claim Button with Pop Effect */}
          <PopButton
            onPress={() => handleBuyPress(item)}
            style={styles.buyBtnContainer}
          >
            <LinearGradient
              colors={THEME_GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buyBtn}
            >
              <Text style={styles.buyText}>Claim</Text>
            </LinearGradient>
          </PopButton>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <ScreenWrapper>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Store</Text>
              <Text style={styles.subtitle}>Redeem your rewards</Text>
            </View>
            <PopButton
              onPress={() => navigation.navigate('OrderList')}
              style={styles.historyBtn}
            >
              <Text style={styles.orderList}>My Orders</Text>
            </PopButton>
          </View>

          {/* Product Grid */}
          <FlatList
            data={products}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          {/* Purchase Modal */}
          <Modal visible={!!selectedProduct} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              {/* Tap background to close */}
              <Pressable
                style={styles.modalBackdrop}
                onPress={() => setSelectedProduct(null)}
              />

              <View style={styles.modalContent}>
                <LinearGradient
                  colors={['#1a1a1a', '#0d0d0d']}
                  style={styles.modalCard}
                >
                  {selectedProduct && (
                    <>
                      {/* Modal Header */}
                      <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Confirm Claim</Text>
                        <PopButton onPress={() => setSelectedProduct(null)}>
                          <Text style={styles.closeIcon}>✕</Text>
                        </PopButton>
                      </View>

                      {/* Product Summary */}
                      <View style={styles.productSummary}>
                        <Image
                          source={{ uri: selectedProduct.image_url }}
                          style={styles.modalImage}
                        />
                        <View style={styles.summaryText}>
                          <Text style={styles.summaryName}>
                            {selectedProduct.name}
                          </Text>
                          <Text style={styles.summaryPrice}>
                            ${selectedProduct.price}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.divider} />

                      {/* Inputs */}
                      <Text style={styles.inputLabel}>Mobile Number</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter contact number"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        value={mobileNumber}
                        onChangeText={setMobileNumber}
                        keyboardType="phone-pad"
                      />

                      <Text style={styles.inputLabel}>Delivery Address</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter full address"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        value={location}
                        onChangeText={setLocation}
                      />

                      {/* Confirm Button with Pop Effect */}
                      <PopButton
                        onPress={confirmPurchase}
                        disabled={loading}
                        style={styles.confirmBtnContainer}
                      >
                        <LinearGradient
                          colors={THEME_GRADIENT}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.buyNowBtn}
                        >
                          {loading ? (
                            <ActivityIndicator color="#fff" size="small" />
                          ) : (
                            <Text style={styles.buyNowText}>
                              Confirm & Claim
                            </Text>
                          )}
                        </LinearGradient>
                      </PopButton>
                    </>
                  )}
                </LinearGradient>
              </View>
            </View>
          </Modal>
        </View>
      </SafeAreaView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: s(16),
  },

  /* Header */
  header: {
    marginTop: vs(20),
    marginBottom: vs(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: ms(28),
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: ms(12),
  },
  historyBtn: {
    paddingVertical: vs(6),
    paddingHorizontal: s(12),
    backgroundColor: 'rgba(255, 0, 212, 0.1)',
    borderRadius: ms(20),
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 212, 0.3)',
  },
  orderList: {
    fontSize: ms(12),
    color: '#ff00d4',
    fontWeight: '700',
  },

  /* Grid Layout */
  listContent: {
    paddingBottom: vs(200),
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },

  /* Card Styling */
  cardContainer: {
    marginBottom: vs(16),
    width: cardWidth,
    shadowColor: '#ff00d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  gradientBorder: {
    borderRadius: ms(16),
    //padding: 1, // Thin border
  },
  cardInner: {
    backgroundColor: '#121212',
    borderRadius: ms(15), // Slightly smaller than border
    padding: s(8),
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: vs(110),
    borderRadius: ms(10),
    overflow: 'hidden',
    marginBottom: vs(8),
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(8),
    paddingHorizontal: s(2),
  },
  name: {
    fontSize: ms(13),
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    marginRight: s(4),
  },
  price: {
    fontSize: ms(13),
    color: '#ff00d4',
    fontWeight: '800',
  },
  buyBtnContainer: {
    width: '100%',
  },
  buyBtn: {
    borderRadius: ms(8),
    width: '100%',
    paddingVertical: vs(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: ms(12),
    textTransform: 'uppercase',
  },

  /* Modal Styling */
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: '90%',
    zIndex: 1,
  },
  modalCard: {
    borderRadius: ms(20),
    padding: s(20),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(15),
  },
  modalTitle: {
    fontSize: ms(18),
    fontWeight: '800',
    color: '#fff',
  },
  closeIcon: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: ms(20),
    fontWeight: 'bold',
  },

  /* Product Summary in Modal */
  productSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(15),
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: s(10),
    borderRadius: ms(12),
  },
  modalImage: {
    width: s(60),
    height: s(60),
    borderRadius: ms(8),
    marginRight: s(12),
    backgroundColor: '#000',
  },
  summaryText: {
    flex: 1,
  },
  summaryName: {
    color: '#fff',
    fontSize: ms(16),
    fontWeight: '700',
    marginBottom: vs(2),
  },
  summaryPrice: {
    color: '#ff00d4',
    fontSize: ms(16),
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: vs(15),
  },

  /* Inputs */
  inputLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: ms(12),
    marginBottom: vs(6),
    marginLeft: s(4),
  },
  input: {
    width: '100%',
    borderRadius: ms(12),
    marginBottom: vs(15),
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    color: '#fff',
    paddingHorizontal: s(15),
    paddingVertical: vs(10),
    fontSize: ms(14),
  },

  /* Confirm Button */
  confirmBtnContainer: {
    marginTop: vs(10),
    width: '100%',
  },
  buyNowBtn: {
    paddingVertical: vs(14),
    borderRadius: ms(12),
    alignItems: 'center',
  },
  buyNowText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: ms(16),
    letterSpacing: 0.5,
  },
});
