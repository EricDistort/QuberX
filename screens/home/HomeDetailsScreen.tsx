import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useUser } from '../../utils/UserContext';
import { sendMoney } from '../../utils/transactions';
import ScreenWrapper from '../../utils/ScreenWrapper';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

export default function SendMoneyScreen() {
  const { user, setUser } = useUser();
  const [receiverAcc, setReceiverAcc] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!receiverAcc.trim() || !amount.trim() || Number(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid account number and amount');
      return;
    }

    setLoading(true);
    try {
      const sender = user.account_number;
      const receiver = receiverAcc.trim();
      const amt = Number(amount);

      const { data, error } = await sendMoney(sender, receiver, amt);
      if (error) throw error;

      Alert.alert('Success', 'Money sent successfully!');
      setUser({ ...user, balance: (user.balance || 0) - amt });
      setReceiverAcc('');
      setAmount('');
    } catch (err: any) {
      Alert.alert('Transaction Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: 'padding', android: undefined })}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <View style={styles.container}>
            <Text style={styles.title}>Send Money</Text>

            <TextInput
              placeholder="Account Number"
              style={styles.input}
              value={receiverAcc}
              onChangeText={setReceiverAcc}
              keyboardType="number-pad"
              placeholderTextColor="grey"
            />

            <TextInput
              placeholder="Amount"
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholderTextColor="grey"
            />

            {loading ? (
              <ActivityIndicator
                size="large"
                color="#8CA6DB"
                style={{ marginTop: verticalScale(20) }}
              />
            ) : (
              <TouchableOpacity onPress={handleSend} style={{ width: '80%' }}>
                <LinearGradient
                  colors={['#8CA6DB', '#B993D6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.button}
                >
                  <Text style={styles.btntxt}>Send</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
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
    height: verticalScale(340),
    width: scale(300),
    borderRadius: moderateScale(14),

    shadowColor: 'rgba(66, 0, 55, 0.32)', // Shadow color (black)
    shadowOffset: { width: 0, height: 4 }, // Shadow offset (horizontal, vertical)
    shadowOpacity: 1, // Shadow transparency (0 is fully transparent, 1 is fully opaque)
    shadowRadius: 10, // Shadow blur radius
    // Android shadow properties
    elevation: 15, // This is the shadow depth for Android
  },
  title: {
    fontSize: moderateScale(26),
    marginBottom: verticalScale(22),
    color: 'rgba(39,0,29,0.74)',
    fontWeight: 'bold',
  },
  input: {
    width: '80%',
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
    marginTop: verticalScale(12),
    alignItems: 'center',
  },
  btntxt: { color: '#fff', fontWeight: 'bold', fontSize: moderateScale(17) },
});
