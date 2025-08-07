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
import { scale, moderateScale, verticalScale } from 'react-native-size-matters';

export default function ReceiveMoneyScreen() {
  const { user } = useUser();

  const handleShare = async () => {
    try {
      const message = `Here are my account details:\n\nUsername: ${user?.username}\nAccount No: ${user?.account_number}`;
      await Share.share({
        message,
      });
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
    padding: moderateScale(8),
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    padding: scale(14),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    height: verticalScale(300),
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
  infoBox: {
    width: '80%',
    marginBottom: verticalScale(12),
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.74)',
    paddingBottom: verticalScale(6),
  },
  label: {
    fontSize: moderateScale(14),
    color: 'grey',
  },
  value: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: 'rgba(36,0,31,0.74)',
  },
  button: {
    padding: moderateScale(14),
    borderRadius: moderateScale(8),
    marginTop: verticalScale(20),
    alignItems: 'center',
  },
  btntxt: { color: '#fff', fontWeight: 'bold', fontSize: moderateScale(17) },
});
