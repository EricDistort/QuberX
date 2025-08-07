import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import { supabase } from '../utils/supabaseClient';
import { useUser } from '../utils/UserContext';
import ScreenWrapper from '../utils/ScreenWrapper'; // <-- import wrapper
import LottieView from 'lottie-react-native'; // <-- import LottieView

type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

export default function LoginRegister() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setUser } = useUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigateToApp = (userData: any) => {
    setUser(userData); // store full user row
    navigation.replace('Main');
  };

  const handleRegister = async () => {
    if (!username.trim() || !password.trim())
      return Alert.alert('Fill all fields');
    setLoading(true);
    try {
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('username')
        .eq('username', username.trim())
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (existingUser) {
        setLoading(false);
        return Alert.alert('User already exists');
      }

      const { data: insertedUser, error: insertError } = await supabase
        .from('users')
        .insert([
          { username: username.trim(), password: password.trim(), balance: 0 },
        ])
        .select('*')
        .single();

      if (insertError) throw insertError;

      setLoading(false);
      navigateToApp(insertedUser);
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Registration Error', error.message);
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim())
      return Alert.alert('Fill all fields');
    setLoading(true);
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*') // fetch full row
        .eq('username', username.trim())
        .maybeSingle();

      if (error) throw error;
      if (!user) {
        setLoading(false);
        return Alert.alert('User not found');
      }

      if (user.password === password.trim()) {
        setLoading(false);
        navigateToApp(user);
      } else {
        setLoading(false);
        Alert.alert('Invalid password');
      }
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Login Error', error.message);
    }
  };

  return (
    <ScreenWrapper>
      <SafeAreaView style={styles.safeArea}>
        {loading && (
          <View style={styles.fullScreenContainer}>
            {/* Lottie animation that will loop indefinitely */}
            <LottieView
              source={require('./LoginMedia/loginanimation.json')} // <-- Animation path
              autoPlay
              loop={true} // Loop indefinitely
              style={styles.fullScreenAnimation}
            />
          </View>
        )}
        <View style={styles.container}>
          <Text style={styles.title}>Login / Register</Text>

          <TextInput
            placeholder="Username"
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholderTextColor="grey"
          />
          <TextInput
            placeholder="Password"
            style={styles.input}
            value={password}
            secureTextEntry
            onChangeText={setPassword}
            autoCapitalize="none"
            placeholderTextColor="grey"
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleLogin} style={{ width: '48%' }}>
              <LinearGradient
                colors={['#8CA6DB', '#B993D6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Text style={styles.btntxt}>Login</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleRegister} style={{ width: '48%' }}>
              <LinearGradient
                colors={['#8CA6DB', '#B993D6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Text style={styles.btntxt}>Register</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
  fullScreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100, // Ensure it overlays above other elements
  },
  fullScreenAnimation: {
    width: 620, // Full width
    height: 620, // Full height
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    alignItems: 'center',
    marginTop: verticalScale(12),
  },
});
