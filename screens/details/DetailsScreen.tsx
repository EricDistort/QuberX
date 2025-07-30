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
} from 'react-native';
import { useUser } from '../../utils/UserContext';
import { sendMoney } from '../../utils/transactions'; // your function to call supabase rpc

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
      const sender = user.account_number; // pass as string
      const receiver = receiverAcc.trim(); // pass as string
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <Text style={styles.title}>Send Money</Text>

      <TextInput
        placeholder="Receiver Account Number"
        style={styles.input}
        value={receiverAcc}
        onChangeText={setReceiverAcc}
        keyboardType="number-pad"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Amount"
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSend}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send'}</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#8CA6DB',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
