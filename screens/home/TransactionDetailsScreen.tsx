import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';
import ScreenWrapper from '../../utils/ScreenWrapper';
import { useUser } from '../../utils/UserContext';

export default function TransactionDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { user } = useUser();
  const { transaction } = route.params || {};

  if (!transaction) return null;

  const isSent = transaction.sender_acc === user.account_number;
  const otherUser = isSent ? transaction.receiver : transaction.sender;
  const statusColor = '#00ff9d'; // Assuming transactions in this table are successful

  return (
    <ScreenWrapper>
      <SafeAreaView style={styles.container}>
        {/* 1️⃣ Animation Area (Top 60%) */}
        <View style={styles.animationContainer}>
          <LottieView
            // Use your receipt or checkmark animation here. 
            // If you don't have one, use the login one or download a checkmark json.
            source={require('../LoginMedia/loginanimation2.json')} 
            autoPlay
            loop
            style={styles.lottie}
          />
        </View>

        {/* 2️⃣ Details Area (Bottom 40%) */}
        <View style={styles.detailsContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            
            {/* Header / Amount */}
            <View style={styles.headerRow}>
              <Text style={styles.statusText}>Transaction Successful</Text>
              <Text style={[styles.amountText, { color: isSent ? '#ff0055' : '#00ff9d' }]}>
                {isSent ? '-' : '+'}${Math.abs(transaction.amount)}
              </Text>
              <Text style={styles.dateText}>
                {new Date(transaction.created_at).toLocaleString()}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Info Grid */}
            <View style={styles.infoRow}>
              <Text style={styles.label}>Transaction ID</Text>
              <Text style={styles.value}>{transaction.id}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Sender</Text>
              <View style={{alignItems:'flex-end'}}>
                <Text style={styles.value}>{isSent ? 'You' : transaction.sender?.username}</Text>
                <Text style={styles.subValue}>Acc: {transaction.sender_acc}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Receiver</Text>
              <View style={{alignItems:'flex-end'}}>
                <Text style={styles.value}>{!isSent ? 'You' : transaction.receiver?.username}</Text>
                <Text style={styles.subValue}>Acc: {transaction.receiver_acc}</Text>
              </View>
            </View>

            {/* Back Button */}
            <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => navigation.goBack()}
            >
              <LinearGradient
                colors={['#00c6ff', '#0072ff']}
                style={styles.gradientBtn}
              >
                <Text style={styles.btnText}>Close</Text>
              </LinearGradient>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </SafeAreaView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  
  /* Top Animation Area */
  animationContainer: {
    height: '55%', // Slightly less than 60 to leave room for content
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,255,255,0.05)', // Subtle glow background
    borderBottomLeftRadius: ms(30),
    borderBottomRightRadius: ms(30),
    overflow: 'hidden',
  },
  lottie: {
    width: s(300),
    height: s(300),
  },

  /* Bottom Details Area */
  detailsContainer: {
    flex: 1,
    padding: s(20),
  },
  headerRow: {
    alignItems: 'center',
    marginBottom: vs(15),
  },
  statusText: {
    color: '#00ff9d',
    fontSize: ms(16),
    fontWeight: '600',
    marginBottom: vs(5),
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  amountText: {
    fontSize: ms(36),
    fontWeight: 'bold',
    marginBottom: vs(5),
  },
  dateText: {
    color: '#666',
    fontSize: ms(14),
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: vs(15),
    width: '100%',
  },

  /* Info Rows */
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vs(20),
  },
  label: {
    color: '#888',
    fontSize: ms(15),
  },
  value: {
    color: '#fff',
    fontSize: ms(16),
    fontWeight: 'bold',
  },
  subValue: {
    color: '#555',
    fontSize: ms(12),
    marginTop: vs(2),
  },

  /* Button */
  closeButton: {
    marginTop: vs(10),
    width: '100%',
    alignItems: 'center',
  },
  gradientBtn: {
    width: '100%',
    paddingVertical: vs(14),
    borderRadius: ms(12),
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: ms(16),
    fontWeight: 'bold',
  },
});