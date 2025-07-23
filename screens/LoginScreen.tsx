import 'react-native-url-polyfill/auto'; // <-- Fixes URL & fetch issues
import { createClient } from '@supabase/supabase-js';
import { fetch } from 'cross-fetch'; // <-- Needed for React Native

import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';

// ---- Supabase client inside same file ----
const SUPABASE_URL = 'https://wplzxpodnfsxtdguwpsl.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwbHp4cG9kbmZzeHRkZ3V3cHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyODE4MDMsImV4cCI6MjA2ODg1NzgwM30.IIQw5dTdxBwzXNVoRhpeA0uDU6qyIQYsrKiOjDDLLBU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: { fetch },
});

type RootStackParamList = {
  Login: undefined;
  Main: { username: string };
};

export default function LoginRegister() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigateToApp = () => navigation.replace('Main', { username });

  // ---- REGISTER ----
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

      const { error: insertError } = await supabase
        .from('users')
        .insert([{ username: username.trim(), password: password.trim() }]);
      if (insertError) throw insertError;

      setLoading(false);
      navigateToApp();
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Registration Error', error.message);
    }
  };

  // ---- LOGIN ----
  const handleLogin = async () => {
    if (!username.trim() || !password.trim())
      return Alert.alert('Fill all fields');
    setLoading(true);

    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('username, password')
        .eq('username', username.trim())
        .maybeSingle();

      if (error) throw error;
      if (!user) {
        setLoading(false);
        return Alert.alert('User not found');
      }

      if (user.password === password.trim()) {
        setLoading(false);
        navigateToApp();
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
    <ImageBackground
      source={require('./LoginMedia/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
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

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#8CA6DB"
              style={{ marginTop: verticalScale(20) }}
            />
          ) : (
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
              <TouchableOpacity
                onPress={handleRegister}
                style={{ width: '48%' }}
              >
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
          )}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
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
    backgroundColor: 'rgba(255,255,255,0.74)',
    height: verticalScale(340),
    width: scale(320),
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
