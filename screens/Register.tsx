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
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { scale as s, verticalScale as vs, moderateScale as ms } from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';

// Keep your existing utils
import { supabase } from '../utils/supabaseClient';
import { useUser } from '../utils/UserContext';
import ScreenWrapper from '../utils/ScreenWrapper';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

// --- MODERN POP BUTTON COMPONENT ---
const ModernPopButton = ({ 
  onPress, 
  title, 
  disabled 
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
      <Animated.View style={{ transform: [{ scale: scaleValue }], width: '100%' }}>
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

export default function Register() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setUser } = useUser();
  
  const [username, setUsername] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [referrerAcc, setReferrerAcc] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username.trim() || !password.trim() || !mobile.trim() || !referrerAcc.trim())
      return Alert.alert('Error', 'All fields, including Referrer Account, are required.');

    setLoading(true);
    try {
      // 2. Validate Referrer
      const { data: refUser } = await supabase
        .from('users')
        .select('account_number')
        .eq('account_number', referrerAcc.trim())
        .maybeSingle();
      
      if (!refUser) {
        setLoading(false);
        return Alert.alert('Error', 'Invalid Referrer Account Number.');
      }

      // 3. Insert User
      const { data: insertedUser, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            username: username.trim(),
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
            throw new Error('This mobile number is already registered.');
        }
        throw insertError;
      }

      // 4. Success
      setUser(insertedUser);
      navigation.replace('Main');

    } catch (error: any) {
      setLoading(false);
      Alert.alert('Registration Error', error.message);
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
            style={{ flex: 1 }}
          >
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              
              {/* Header Section */}
              <View style={styles.headerContainer}>
                <Text style={styles.welcomeText}>Create</Text>
                <Text style={styles.subWelcomeText}>Account</Text>
                <Text style={styles.instructionText}>Join us and start your journey.</Text>
              </View>

              {/* Form Section */}
              <View style={styles.formContainer}>
                
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>USERNAME</Text>
                  <TextInput
                    placeholder="JohnDoe"
                    style={styles.modernInput}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    placeholderTextColor="#666"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>MOBILE NUMBER</Text>
                  <TextInput
                    placeholder="+1234567890"
                    style={styles.modernInput}
                    value={mobile}
                    onChangeText={setMobile}
                    keyboardType="phone-pad"
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

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>REFERRER ACCOUNT NUMBER</Text>
                  <TextInput
                    placeholder="123456"
                    style={styles.modernInput}
                    value={referrerAcc}
                    onChangeText={setReferrerAcc}
                    keyboardType="numeric"
                    placeholderTextColor="#666"
                  />
                </View>

                <View style={styles.actionContainer}>
                  <ModernPopButton 
                    title="REGISTER" 
                    onPress={handleRegister} 
                    disabled={loading}
                  />

                  <Pressable
                    onPress={() => navigation.goBack()}
                    style={styles.loginLink}
                  >
                    <Text style={styles.loginText}>
                      Already have an account? <Text style={styles.loginHighlight}>Log In</Text>
                    </Text>
                  </Pressable>
                </View>

              </View>
            </ScrollView>
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
  scrollContent: {
    paddingHorizontal: ms(24),
    paddingBottom: vs(40),
    paddingTop: vs(20),
  },
  // Ambient Glow
  backgroundGlow: {
    position: 'absolute',
    top: -height * 0.1,
    right: -width * 0.2, // Positioned on the right for variety from Login screen
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: '#ff00d4',
    opacity: 0.12,
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
  headerContainer: {
    marginBottom: vs(30),
    marginTop: vs(10),
  },
  welcomeText: {
    fontSize: ms(36),
    color: '#FFF',
    fontWeight: '300',
    letterSpacing: 1,
  },
  subWelcomeText: {
    fontSize: ms(38),
    color: '#FFF',
    fontWeight: '800',
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
    marginBottom: vs(18),
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
    marginTop: vs(15),
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
  loginLink: {
    marginTop: vs(20),
    padding: ms(10),
  },
  loginText: {
    color: '#888',
    fontSize: ms(14),
  },
  loginHighlight: {
    color: '#ff00d4',
    fontWeight: 'bold',
  },
});