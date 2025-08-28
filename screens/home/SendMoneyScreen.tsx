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
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';

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
                style={{ marginTop: vs(20) }}
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
            <Text style={styles.withdrawableText}>
              Current Transferable Amount{' '}
              <Text style={styles.boldAmount}>
                ₹{user?.withdrawal_amount || 0}
              </Text>
            </Text>
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
    padding: ms(8),
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    padding: s(14),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    height: vs(340),
    width: s(300),
    borderRadius: ms(14),
    shadowColor: 'rgba(66, 0, 55, 0.32)',
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 1,
    shadowRadius: ms(10),
    elevation: 15,
  },
  title: {
    fontSize: ms(26),
    marginBottom: vs(22),
    color: '#a96bb1ff',
    fontWeight: 'bold',
  },
  input: {
    width: '80%',
    paddingVertical: ms(10),
    marginBottom: vs(12),
    backgroundColor: 'transparent',
    color: 'rgba(36,0,31,0.74)',
    borderRadius: ms(4),
    fontSize: ms(17),
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.74)',
  },
  button: {
    padding: ms(14),
    borderRadius: ms(8),
    marginTop: vs(12),
    alignItems: 'center',
  },
  btntxt: { color: '#fff', fontWeight: 'bold', fontSize: ms(17) },
  withdrawableText: {
    marginTop: vs(8),
    fontSize: ms(13),
    color: '#555',
    textAlign: 'center',
  },
  boldAmount: {
    fontWeight: 'bold',
    fontSize: ms(16),
  },
});
