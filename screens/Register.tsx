import React, { useState, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { scale as s, verticalScale as vs, moderateScale as ms } from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';

// Utils
import { supabase } from '../utils/supabaseClient';
import { useUser } from '../utils/UserContext';
import ScreenWrapper from '../utils/ScreenWrapper';

const { width, height } = Dimensions.get('window');

// --- GENERIC POP BUTTON COMPONENT ---
// Reusable wrapper to apply the pop effect to ANY content
const PopButton = ({
  onPress,
  children,
  disabled,
  style,
}: {
  onPress: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  style?: any;
}) => {
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
      tension: 50,
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
      <Animated.View style={{ transform: [{ scale: scaleValue }], width: '100%' }}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default function Register() {
  const navigation = useNavigation<any>();
  const { setUser } = useUser();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [referrerAcc, setReferrerAcc] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // 1. Client-side Check (Instant)
    if (!username.trim() || !email.trim() || !password.trim() || !mobile.trim() || !referrerAcc.trim())
      return Alert.alert('Missing Details', 'All fields are required.');

    setLoading(true);
    const startTime = Date.now(); // Start Timer

    try {
      // 2. Validate Referrer (Backend)
      const { data: refUser } = await supabase
        .from('users')
        .select('account_number')
        .eq('account_number', referrerAcc.trim())
        .maybeSingle();
      
      if (!refUser) {
        // Enforce min duration before error
        await enforceMinDuration(startTime);
        setLoading(false);
        setTimeout(() => Alert.alert('Invalid Referrer', 'The referrer account number does not exist.'), 100);
        return;
      }

      // 3. Insert User (Backend)
      const { data: insertedUser, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            username: username.trim(),
            email: email.trim(),
            password: password.trim(),
            mobile: mobile.trim(),
            balance: 0,
            referrer_account_number: refUser.account_number,
          },
        ])
        .select('*')
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
           throw new Error('Email or Mobile number is already registered.');
        }
        throw insertError;
      }

      // 4. Success - Enforce min duration
      await enforceMinDuration(startTime);

      setLoading(false);
      setUser(insertedUser);
      navigation.replace('Main');

    } catch (error: any) {
      // 5. Error - Enforce min duration
      await enforceMinDuration(startTime);
      
      setLoading(false);
      setTimeout(() => Alert.alert('Registration Failed', error.message), 100);
    }
  };

  // Helper to wait for the remaining time of the 3s window
  const enforceMinDuration = async (startTime: number) => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, 3000 - elapsed); // 3000ms = 3 seconds
    if (remaining > 0) {
      await new Promise(resolve => setTimeout(resolve, remaining));
    }
  };

  return (
    <ScreenWrapper>
      <StatusBar barStyle="light-content" backgroundColor="#050505" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.mainContainer}>
          
          {/* Subtle Background Glows */}
          <LinearGradient
            colors={['rgba(123, 0, 148, 0.4)', 'transparent']}
            style={styles.topGlow}
          />
          <View style={styles.bottomGlow} />

          {/* Loading Overlay */}
          {loading && (
            <View style={styles.loadingOverlay}>
              <LottieView
                source={require('./LoginMedia/Loading.json')}
                autoPlay
                loop
                style={styles.loadingAnimation}
              />
            </View>
          )}

          <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}
            >
              <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                
                {/* Compact Header */}
                <View style={styles.header}>
                  <Text style={styles.titleOutline}>Start</Text>
                  <Text style={styles.titleFilled}>Trading</Text>
                  <Text style={styles.subtitle}>Create your secure account.</Text>
                </View>

                {/* Compact Form Fields */}
                <View style={styles.formSection}>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>USERNAME</Text>
                    <TextInput
                      placeholder="e.g. CryptoKing"
                      style={styles.input}
                      value={username}
                      onChangeText={setUsername}
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>EMAIL</Text>
                    <TextInput
                      placeholder="name@domain.com"
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>MOBILE</Text>
                    <TextInput
                      placeholder="+1 234 567 890"
                      style={styles.input}
                      value={mobile}
                      onChangeText={setMobile}
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>PASSWORD</Text>
                    <TextInput
                      placeholder="••••••••••••"
                      style={styles.input}
                      value={password}
                      onChangeText={setPassword}
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      secureTextEntry
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>REFERRER CODE</Text>
                    <TextInput
                      placeholder="123456"
                      style={styles.input}
                      value={referrerAcc}
                      onChangeText={setReferrerAcc}
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.spacer} />

                  {/* CREATE ACCOUNT BUTTON with Pop Effect */}
                  <PopButton onPress={handleRegister} disabled={loading} style={{ width: '100%' }}>
                    <LinearGradient
                      colors={['#7b0094ff', '#ff00d4ff']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.gradientButton}
                    >
                      <Text style={styles.btnText}>CREATE ACCOUNT</Text>
                    </LinearGradient>
                  </PopButton>

                  {/* SIGN IN LINK with Pop Effect */}
                  <PopButton 
                    onPress={() => navigation.goBack()} 
                    style={styles.loginLink}
                  >
                    <Text style={styles.loginText}>
                      Already have an account? <Text style={styles.loginHighlight}>Sign In</Text>
                    </Text>
                  </PopButton>

                </View>

              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </View>
      </TouchableWithoutFeedback>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#050505', // Deepest Black
  },
  
  /* Ambient Effects */
  topGlow: {
    position: 'absolute',
    top: -height * 0.15,
    left: -width * 0.2,
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width,
    opacity: 0.3,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: vs(-100), // Scalable
    right: s(-50),    // Scalable
    width: s(200),    // Scalable
    height: s(200),   // Scalable
    borderRadius: s(100), // Scalable
    backgroundColor: '#ff00d4',
    opacity: 0.08,
    transform: [{ scale: 1.5 }],
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 1)', // Solid black for clean view
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingAnimation: {
    width: s(300),
    height: s(300),
  },

  /* Scroll Layout - Compacted */
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: s(24),
    justifyContent: 'center',
    paddingBottom: vs(20),
  },

  /* Header Typography - Compacted */
  header: {
    marginBottom: vs(15),
    marginTop: vs(10),
  },
  titleOutline: {
    fontSize: ms(32),
    fontWeight: '300',
    color: 'transparent',
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    letterSpacing: 2,
    marginBottom: -8,
  },
  titleFilled: {
    fontSize: ms(32),
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: ms(13),
    color: 'rgba(255,255,255,0.5)',
    marginTop: vs(2),
    fontWeight: '400',
  },

  /* Form - Compacted Spacing */
  formSection: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: vs(10),
  },
  label: {
    fontSize: ms(10),
    fontWeight: '700',
    color: '#ff00d4', 
    marginBottom: vs(4),
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: ms(18),
    paddingHorizontal: s(12),
    paddingVertical: vs(10),
    color: '#fff',
    fontSize: ms(16),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  /* Actions */
  spacer: {
    height: vs(10),
  },
  gradientButton: {
    paddingVertical: vs(14),
    borderRadius: ms(22),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff00d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    marginTop: vs(5),
  },
  btnText: {
    color: '#fff',
    fontSize: ms(14),
    fontWeight: '900',
    letterSpacing: 2,
  },
  loginLink: {
    marginTop: vs(15),
    alignSelf: 'center',
    padding: s(5),
  },
  loginText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: ms(14),
  },
  loginHighlight: {
    color: '#fff',
    fontWeight: '700',
  },
});