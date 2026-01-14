import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  Animated,
  Pressable,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';
import { supabase } from '../../utils/supabaseClient';
import { useUser } from '../../utils/UserContext';
import ScreenWrapper from '../../utils/ScreenWrapper';

// --- POP BUTTON COMPONENT ---
const PopButton = ({ onPress, children, style, disabled }: any) => {
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
      tension: 40,
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

export default function ProfileScreen({ navigation }: any) {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form States
  const [username, setUsername] = useState('');
  const [mobile, setMobile] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [actualStoredPassword, setActualStoredPassword] = useState('');

  // Read-Only Data
  const [referrerName, setReferrerName] = useState('N/A');
  const [totalDeposit, setTotalDeposit] = useState(0);

  const THEME_GRADIENT = ['#7b0094ff', '#ff00d4ff'];

  useEffect(() => {
    fetchFullProfile();
  }, [user?.id]);

  const fetchFullProfile = async () => {
    setLoading(true);
    try {
      // 1. Fetch User Data
      // Note: We don't need to fetch rank logic here anymore, the DB does it!
      const { data: userData, error } = await supabase
        .from('users')
        .select(
          'username, mobile, password, profileImage, referrer_account_number, deposits',
        )
        .eq('id', user.id)
        .single();

      if (error || !userData) {
        setLoading(false);
        return;
      }

      setUsername(userData.username || '');
      setMobile(userData.mobile || '');
      setActualStoredPassword(userData.password || '');
      setTotalDeposit(userData.deposits || 0);
      
      // Update local context to ensure image is fresh
      if (userData.profileImage !== user?.profileImage) {
         setUser({ ...user, profileImage: userData.profileImage });
      }

      // 2. Fetch Referrer Name
      if (userData.referrer_account_number) {
        const { data: refData } = await supabase
          .from('users')
          .select('username')
          .eq('account_number', userData.referrer_account_number)
          .maybeSingle();
        if (refData) setReferrerName(refData.username);
      }

    } catch (err) {
      console.log('Profile Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!username.trim() || !currentPasswordInput) {
      Alert.alert('Required', 'Username and Current Password are required.');
      return;
    }
    if (currentPasswordInput.trim() !== actualStoredPassword) {
      Alert.alert('Security', 'Incorrect current password.');
      return;
    }

    const finalPassword = newPassword.trim()
      ? newPassword.trim()
      : actualStoredPassword;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          username: username.trim(),
          mobile: mobile.trim(),
          password: finalPassword,
        })
        .eq('id', user.id);

      if (error) throw error;

      setActualStoredPassword(finalPassword);
      setUser({ ...user, username, mobile });
      setNewPassword('');
      setCurrentPasswordInput('');
      Alert.alert('Saved', 'Profile updated successfully!');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenWrapper>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* 1. COMPACT HERO SECTION */}
            <View style={styles.heroSection}>
              <View style={styles.avatarRow}>
                {/* Avatar Display Only (No Click/Edit) */}
                <View
                  
                  style={styles.avatarGradient}
                >
                  <View style={styles.avatarContainer}>
                    {user?.profileImage ? (
                      <Image
                        source={{ uri: user.profileImage }}
                        style={styles.avatar}
                      />
                    ) : (
                      <Text style={styles.avatarPlaceholder}>
                         {username ? username.charAt(0).toUpperCase() : 'U'}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.heroInfo}>
                  <Text style={styles.heroTitle}>Edit Profile</Text>
                  <Text style={styles.heroSubtitle}>
                    Account Number {user?.account_number}
                  </Text>
                </View>
              </View>

              {/* Mini Stats Grid */}
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Referrer</Text>
                  <Text style={styles.statValue} numberOfLines={1}>
                    {referrerName}
                  </Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Total Deposit</Text>
                  <Text style={[styles.statValue, { color: '#00e676' }]}>
                    ${totalDeposit}
                  </Text>
                </View>
              </View>
            </View>

            {/* 2. COMPACT FORM PANEL */}
            <View style={styles.formPanel}>
              {/* Row: Username & Mobile */}
              <View style={styles.inputRow}>
                <View style={{ flex: 1, marginRight: s(12) }}>
                  <Text style={styles.label}>USERNAME</Text>
                  <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Username"
                    placeholderTextColor="#666"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>MOBILE</Text>
                  <TextInput
                    style={styles.input}
                    value={mobile}
                    onChangeText={setMobile}
                    keyboardType="phone-pad"
                    placeholder="Mobile"
                    placeholderTextColor="#666"
                  />
                </View>
              </View>

              {/* Increased Spacer */}
              <View style={styles.spacer} />

              {/* New Password */}
              <Text style={styles.label}>NEW PASSWORD (OPTIONAL)</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholder="Type to change password"
                placeholderTextColor="#666"
              />

              {/* Increased Spacer */}
              <View style={styles.spacer} />

              {/* Current Password */}
              <Text style={[styles.label, { color: '#ff4d4d' }]}>
                CURRENT PASSWORD (REQUIRED)
              </Text>
              <TextInput
                style={[styles.input, styles.requiredInput]}
                value={currentPasswordInput}
                onChangeText={setCurrentPasswordInput}
                secureTextEntry
                placeholder="Verify to save"
                placeholderTextColor="#ff4d4d66"
              />

              {/* SAVE BUTTON with Pop Effect */}
              <PopButton
                onPress={handleSaveChanges}
                disabled={saving || loading}
                style={styles.buttonWrapper}
              >
                <LinearGradient
                  colors={THEME_GRADIENT}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveBtn}
                >
                  {saving || loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.saveBtnText}>SAVE CHANGES</Text>
                  )}
                </LinearGradient>
              </PopButton>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  container: {
    paddingHorizontal: s(10),
    paddingTop: vs(25),
    paddingBottom: vs(30),
    flexGrow: 1,
    marginTop: vs(10),
  },

  /* 1. HERO SECTION */
  heroSection: {
    marginBottom: vs(25),
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(20),
  },
  avatarGradient: {
    width: s(72),
    height: s(72),
    borderRadius: s(36),
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    width: '100%',
    height: '100%',
    borderRadius: s(36),
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
   
  },
  avatar: { width: '100%', height: '100%' },
  avatarPlaceholder: { color: '#fff', fontSize: ms(24) },
  heroInfo: {
    marginLeft: s(18),
    justifyContent: 'center',
  },
  heroTitle: {
    color: '#fff',
    fontSize: ms(24),
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: ms(13),
    marginTop: vs(4),
  },

  /* STATS GRID */
  statsGrid: {
    flexDirection: 'row',
    gap: s(12),
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: ms(14),
    paddingVertical: vs(12),
    paddingHorizontal: s(14),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: ms(10),
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: vs(4),
  },
  statValue: {
    color: '#fff',
    fontSize: ms(15),
    fontWeight: '700',
  },

  /* 2. FORM PANEL */
  formPanel: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: '#ff00d4',
    fontSize: ms(10),
    fontWeight: '800',
    marginBottom: vs(8),
    marginLeft: s(2),
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#121212',
    borderRadius: ms(12),
    paddingHorizontal: s(14),
    height: vs(48),
    color: '#fff',
    fontSize: ms(14),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  requiredInput: {
    borderColor: '#ff4d4d55',
    backgroundColor: 'rgba(255, 77, 77, 0.05)',
  },

  /* SPACER */
  spacer: {
    height: vs(20),
  },

  /* BUTTON */
  buttonWrapper: {
    marginTop: vs(30),
    shadowColor: '#ff00d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    width: '100%',
  },
  saveBtn: {
    height: vs(52),
    borderRadius: ms(26),
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: ms(15),
    fontWeight: '900',
    letterSpacing: 1,
  },
});