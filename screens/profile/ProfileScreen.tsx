import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Clipboard,
  Platform,
  Image,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import ScreenWrapper from '../../utils/ScreenWrapper';
import { useUser } from '../../utils/UserContext';
import { supabase } from '../../utils/supabaseClient';

export default function DepositScreen() {
  const { user } = useUser();

  // Wallet address as plain text - replace the string below with your wallet address anytime
  const walletAddress = '0x42378bf4863744bd10f0655dc198a775e4a15f9a';

  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);

  const copyToClipboard = () => {
    if (Platform.OS === 'web') {
      navigator.clipboard.writeText(walletAddress);
    } else {
      Clipboard.setString(walletAddress);
    }
    Alert.alert('Copied', 'Wallet address copied to clipboard!');
  };

  const submitDeposit = async () => {
    if (!txHash.trim()) {
      Alert.alert('Error', 'Please enter the transaction hash');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.from('deposits').insert([
        {
          user_id: user.id,
          tx_hash: txHash.trim(),
        },
      ]);
      if (error) {
        if (error.code === '23505') {
          Alert.alert(
            'Duplicate Transaction',
            'This transaction hash has already been used.',
          );
        } else {
          throw error;
        }
      } else {
        Alert.alert(
          'Deposit Request Submitted',
          'Your deposit request is pending admin approval.',
        );
        setTxHash('');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Deposit</Text>

          {/* QR Code Image */}
          <View style={styles.qrContainer}>
            <Image
              source={require('../details/detailsMedia/qr.png')} // your QR image here
              style={styles.qrImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.walletRow}>
            <View style={styles.walletTextContainer}>
              <Text
                style={styles.walletText}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {walletAddress}
              </Text>
            </View>
            <TouchableOpacity
              onPress={copyToClipboard}
              style={styles.copyButton}
            >
              <LinearGradient
                colors={['#8CA6DB', '#B993D6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Text style={styles.btntxt}>Copy</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Transaction Hash Input */}
          <TextInput
            style={styles.input}
            placeholder="Transaction Hash"
            value={txHash}
            onChangeText={setTxHash}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="grey"
          />

          {/* Deposit Button */}
          <TouchableOpacity
            onPress={submitDeposit}
            disabled={loading}
            style={{ width: '100%' }}
          >
            <LinearGradient
              colors={loading ? ['#b0bcd6', '#b0bcd6'] : ['#8CA6DB', '#B993D6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.button, loading && { opacity: 0.6 }]}
            >
              {loading ? (
                <Text style={styles.btntxt}>Submitting...</Text>
              ) : (
                <Text style={styles.btntxt}>Deposit</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(8),
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    padding: scale(14),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: scale(300),
    borderRadius: moderateScale(14),
  },
  title: {
    fontSize: moderateScale(26),
    marginBottom: verticalScale(22),
    color: 'rgba(39,0,29,0.74)',
    fontWeight: 'bold',
  },
  qrContainer: {
    height: verticalScale(180),
    width: scale(180),
    marginBottom: verticalScale(20),
  },
  qrImage: {
    height: '100%',
    width: '100%',
    borderRadius: moderateScale(10),
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: verticalScale(20),
  },
  walletTextContainer: {
    flex: 1,
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(4),

    borderRadius: moderateScale(4),
  },
  walletText: {
    color: 'rgba(36,0,31,0.74)',
    fontSize: moderateScale(17),
  },
  copyButton: {
    width: scale(80),
  },
  input: {
    width: '100%',
    paddingVertical: moderateScale(10),
    marginBottom: verticalScale(12),
    backgroundColor: 'transparent',
    color: 'rgba(36,0,31,0.74)',
    borderRadius: moderateScale(4),
    fontSize: moderateScale(17),
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.74)',
  },
  button: {
    padding: moderateScale(14),
    borderRadius: moderateScale(8),
    alignItems: 'center',
  },
  btntxt: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: moderateScale(17),
  },
});
