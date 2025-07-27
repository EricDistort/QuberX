import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useUser } from '../../utils/UserContext';
import ScreenWrapper from '../../utils/ScreenWrapper';
import { launchImageLibrary } from 'react-native-image-picker';
import { supabase } from '../../utils/supabaseClient';

export default function HomeScreen({ navigation }: any) {
  const { user, setUser } = useUser();

  const handleEditProfileImage = async () => {
    // Step 1: Open Image Picker
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.7,
    });
    if (result.didCancel || !result.assets) return;

    const file = result.assets[0];
    const fileExt = file.fileName?.split('.').pop() || 'jpg';
    const filePath = `avatars/${user.id}.${fileExt}`;

    try {
      // Step 2: Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(
          filePath,
          {
            uri: file.uri,
            type: file.type,
            name: file.fileName,
          },
          { upsert: true },
        ); // Overwrite if already exists

      if (uploadError) throw uploadError;

      // Step 3: Get Public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // Step 4: Update user profile in DB
      const { error: updateError } = await supabase
        .from('users')
        .update({ profileImage: publicUrl })
        .eq('id', user.id);
      if (updateError) throw updateError;

      // Step 5: Update local context
      setUser({ ...user, profileImage: publicUrl });
      Alert.alert('Success', 'Profile picture updated!');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* First Container - Profile Card */}
        <View style={styles.firstContainer}>
          {/* Profile Image */}
          <Image
            source={{
              uri: user?.profileImage || 'https://via.placeholder.com/80',
            }}
            style={styles.profileImage}
          />

          {/* Name & Account Number */}
          <View style={styles.userInfo}>
            <Text style={styles.name}>{user?.username || 'Guest User'}</Text>
            <Text style={styles.accountNumber}>
              Account No: {user?.account_number || '0000000000'}
            </Text>
          </View>

          {/* Edit Button */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfileImage}
          >
            <Image
              source={require('../homeMedia/editbutton.webp')}
              style={styles.editImage}
            />
          </TouchableOpacity>
        </View>

        {/* Second Container */}
        <View style={styles.secondContainer}>
          <Text style={styles.containerText}>Second Container</Text>
        </View>

        {/* Third Container */}
        <View style={styles.thirdContainer}>
          <Text style={styles.containerText}>Third Container</Text>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  firstContainer: {
    width: '95%',
    height: '20%',
    backgroundColor: 'rgba(255, 255, 255, 0)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(248, 235, 255, 1)',
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  accountNumber: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  editButton: {
    padding: 8,
  },
  secondContainer: {
    width: '95%',
    height: '30%',
    backgroundColor: 'rgba(200, 200, 255, 0.8)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thirdContainer: {
    width: '95%',
    height: '50%',
    backgroundColor: 'rgba(200, 255, 200, 0.8)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  editImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});
