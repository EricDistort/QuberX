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
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import { supabase } from '../utils/supabaseClient';
import { useUser } from '../utils/UserContext';
import ScreenWrapper from '../utils/ScreenWrapper';
import LottieView from 'lottie-react-native';

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
    setUser(userData);
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
        .select('*')
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
            <LottieView
              source={require('./LoginMedia/loginanimation.json')}
              autoPlay
              loop
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
            placeholderTextColor="#31175383"
          />
          <TextInput
            placeholder="Password"
            style={styles.input}
            value={password}
            secureTextEntry
            onChangeText={setPassword}
            autoCapitalize="none"
            placeholderTextColor="#31175383"
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleLogin} style={styles.button}>
             
                <Text style={styles.btntxt}>Login</Text>
             
            </TouchableOpacity>
            <TouchableOpacity onPress={handleRegister} style={styles.button}>
             
                <Text style={styles.btntxt}>Register</Text>
              
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
    padding: ms(8),
  },
  fullScreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  fullScreenAnimation: {
    width: s(620),
    height: s(620),
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
  },
  title: {
    fontSize: ms(26),
    marginBottom: vs(22),
    color: '#452966ff',
    fontWeight: 'bold',
  },
  input: {
    width: '80%',
    paddingVertical: ms(10),
    marginBottom: vs(12),
    backgroundColor: 'transparent',
    color: '#452966ff',
    borderRadius: ms(4),
    fontSize: ms(17),
    borderBottomWidth: 0.5,
    borderBottomColor: '#452966ff',
  },
  button: {
    padding: ms(14),
    borderRadius: ms(8),
    marginTop: vs(12),
    alignItems: 'center',
    backgroundColor: '#452966ff',
    width: '48%',
  },
  btntxt: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: ms(17),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    alignItems: 'center',
    marginTop: vs(12),
  },
});
