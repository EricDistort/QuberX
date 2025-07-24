import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useUser } from '../../utils/UserContext';

export default function HomeScreen() {
  const { user } = useUser();

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome, {user?.username || 'Guest'}!</Text>
      <Text style={styles.balance}>
        Balance: ${user?.balance?.toFixed(2) || '0.00'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  welcome: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  balance: { fontSize: 20, color: '#555' },
});
