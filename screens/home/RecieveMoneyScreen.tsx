import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Share,
} from 'react-native';
import { useUser } from '../../utils/UserContext';
import ScreenWrapper from '../../utils/ScreenWrapper';
import LinearGradient from 'react-native-linear-gradient';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';

export default function ReceiveMoneyScreen() {
  const { user } = useUser();

  const handleShare = async () => {
    try {
      const message = `Here are my account details:\n\nUsername: ${user?.username}\nAccount No: ${user?.account_number}`;
      await Share.share({ message });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <ScreenWrapper>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Receive Money</Text>

          <View style={styles.infoBox}>
            <Text style={styles.label}>Username</Text>
            <Text style={styles.value}>{user?.username || 'Guest User'}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.label}>Account Number</Text>
            <Text style={styles.value}>
              {user?.account_number || '0000000000'}
            </Text>
          </View>

          <TouchableOpacity onPress={handleShare} style={{ width: '80%' }}>
            <LinearGradient
              colors={['#8CA6DB', '#B993D6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.btntxt}>Share</Text>
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
    padding: ms(8),
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    padding: s(14),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    height: vs(300),
    width: s(300),
    borderRadius: ms(14),
    shadowColor: 'rgba(66, 0, 55, 0.32)',
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 1,
    shadowRadius: ms(10),
    elevation: 15,
  },
  title: {
    fontSize: ms(25),
    marginBottom: vs(22),
    color: '#612369ff',
    fontWeight: 'bold',
  },
  infoBox: {
    width: '80%',
    marginBottom: vs(12),
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.74)',
    paddingBottom: vs(6),
  },
  label: {
    fontSize: ms(14),
    color: 'grey',
  },
  value: {
    fontSize: ms(18),
    fontWeight: 'bold',
    color: 'rgba(36,0,31,0.74)',
  },
  button: {
    padding: ms(14),
    borderRadius: ms(8),
    marginTop: vs(20),
    alignItems: 'center',
  },
  btntxt: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: ms(17),
  },
});
