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
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';

// Keep your existing utils
import { supabase } from '../utils/supabaseClient';
import { useUser } from '../utils/UserContext';
import ScreenWrapper from '../utils/ScreenWrapper';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

// --- MODERN POP BUTTON COMPONENT ---
const ModernPopButton = ({
  onPress,
  title,
  disabled,
}: {
  onPress: () => void;
  title: string;
  disabled?: boolean;
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
      style={{ width: '100%' }}
    >
      <Animated.View
        style={{ transform: [{ scale: scaleValue }], width: '100%' }}
      >
        <LinearGradient
          colors={['#7b0094ff', '#ff00d4ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <Text style={styles.btnText}>{title}</Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

export default function Login() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setUser } = useUser();
  const [accountNumber, setAccountNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Animation for the input focus line (optional polish)
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const navigateToApp = (userData: any) => {
    setUser(userData);
    navigation.replace('Main');
  };

  const handleLogin = async () => {
    if (!accountNumber.trim() || !password.trim())
      return Alert.alert('Error', 'Please fill all fields');

    setLoading(true);
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('account_number', parseInt(accountNumber.trim()))
        .maybeSingle();

      if (error) throw error;

      if (!user) {
        setLoading(false);
        return Alert.alert('Error', 'Account number not found');
      }

      if (user.password === password.trim()) {
        setLoading(false);
        navigateToApp(user);
      } else {
        setLoading(false);
        Alert.alert('Error', 'Invalid password');
      }
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Login Error', error.message);
    }
  };

  return (
    <ScreenWrapper>
      <StatusBar barStyle="light-content" />
      <View style={styles.mainContainer}>
        {/* Background Glow Effect */}
        <View style={styles.backgroundGlow} />

        {/* Loading Overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <LottieView
              source={require('./LoginMedia/loginanimation2.json')}
              autoPlay
              loop
              style={styles.loadingAnimation}
            />
          </View>
        )}

        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            {/* Header Section */}
            <View style={styles.headerContainer}>
              <Text style={styles.welcomeText}>Welcome</Text>
              <Text style={styles.subWelcomeText}>Back!</Text>
              <Text style={styles.instructionText}>
                Please sign in to access your account.
              </Text>
            </View>

            {/* Form Section */}
            <View style={styles.formContainer}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>ACCOUNT NUMBER</Text>
                <TextInput
                  placeholder="12345678"
                  style={styles.modernInput}
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  keyboardType="numeric"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>PASSWORD</Text>
                <TextInput
                  placeholder="••••••••"
                  style={styles.modernInput}
                  value={password}
                  secureTextEntry
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.actionContainer}>
                <ModernPopButton
                  title="LOG IN"
                  onPress={handleLogin}
                  disabled={loading}
                />

                <Pressable
                  onPress={() => navigation.navigate('Register')}
                  style={styles.registerLink}
                >
                  <Text style={styles.registerText}>
                    Don't have an account?{' '}
                    <Text style={styles.registerHighlight}>Register</Text>
                  </Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#050505', // Deep Black
  },
  // Creates a purple/pink ambient glow at the top left
  backgroundGlow: {
    position: 'absolute',
    top: -height * 0.2,
    left: -width * 0.2,
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: '#7b0094',
    opacity: 0.15,
    borderRadius: width,
    transform: [{ scale: 1.5 }],
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingAnimation: {
    width: s(200),
    height: s(200),
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: ms(24),
  },
  headerContainer: {
    marginBottom: vs(40),
  },
  welcomeText: {
    fontSize: ms(36),
    color: '#FFF',
    fontWeight: '300', // Thin weight
    letterSpacing: 1,
  },
  subWelcomeText: {
    fontSize: ms(38),
    color: '#FFF',
    fontWeight: '800', // Heavy weight
    marginTop: -5,
  },
  instructionText: {
    color: '#888',
    marginTop: vs(10),
    fontSize: ms(14),
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: vs(20),
  },
  inputLabel: {
    color: '#ff00d4', // Neon Pink label
    fontSize: ms(10),
    fontWeight: 'bold',
    marginBottom: vs(8),
    letterSpacing: 1,
  },
  modernInput: {
    backgroundColor: '#1E1E1E',
    borderRadius: ms(12),
    paddingVertical: ms(16),
    paddingHorizontal: ms(16),
    fontSize: ms(16),
    color: '#FFF',
    borderWidth: 1,
    borderColor: '#333',
  },
  actionContainer: {
    marginTop: vs(20),
    alignItems: 'center',
  },
  gradientButton: {
    paddingVertical: ms(18),
    borderRadius: ms(16),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff00d4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  btnText: {
    color: '#FFF',
    fontSize: ms(16),
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  registerLink: {
    marginTop: vs(20),
    padding: ms(10),
  },
  registerText: {
    color: '#888',
    fontSize: ms(14),
  },
  registerHighlight: {
    color: '#ff00d4',
    fontWeight: 'bold',
  },
});
