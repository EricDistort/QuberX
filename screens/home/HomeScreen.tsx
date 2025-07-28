import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ImageBackground,
} from 'react-native';
import { useUser } from '../../utils/UserContext';
import ScreenWrapper from '../../utils/ScreenWrapper';
import { launchImageLibrary } from 'react-native-image-picker';
import { supabase } from '../../utils/supabaseClient';

export default function HomeScreen({ navigation }: any) {
  const { user, setUser } = useUser();

  const handleEditProfileImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.7,
    });
    if (result.didCancel || !result.assets) return;

    const file = result.assets[0];
    const fileExt = file.fileName?.split('.').pop() || 'jpg';
    const filePath = `avatars/${user.id}.${fileExt}`;

    try {
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
        );
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      const { error: updateError } = await supabase
        .from('users')
        .update({ profileImage: publicUrl })
        .eq('id', user.id);
      if (updateError) throw updateError;

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
          <Image
            source={{
              uri: user?.profileImage || 'https://via.placeholder.com/80',
            }}
            style={styles.profileImage}
          />
          <View style={styles.userInfo}>
            <Text style={styles.name}>{user?.username || 'Guest User'}</Text>
            <Text style={styles.accountNumber}>
              Account No: {user?.account_number || '0000000000'}
            </Text>
          </View>
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

        {/* Second Container - Balance Section */}
        <View style={styles.secondContainerWrapper}>
          <ImageBackground
            source={require('../homeMedia/balancecard.webp')}
            style={styles.secondContainer}
            resizeMode="contain"
          >
            <View style={styles.balanceOverlay}>
              <Text style={styles.balanceSubHeader}>Current Balance</Text>
              <Text style={styles.balanceAmount}>
                ${user?.balance || '0.00'}
              </Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.buttonText}>Send</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.buttonText}>Receive</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
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
    paddingVertical: 5, // Reduced padding to minimize gaps
  },
  firstContainer: {
    width: '95%',
    height: '23%',
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
  secondContainerWrapper: {
    width: '92%',
    height: '30%',
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden', // Ensures no gaps
    marginTop: -60, // Reduced margin to minimize gaps
  },
  secondContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  balanceOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  balanceSubHeader: {
    fontSize: 16,
    color: 'rgba(212, 249, 255, 0.84)',
    //marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  actionButton: {
    backgroundColor: '#ffffffff',
    width: 120, // Fixed width
    height: 40, // Fixed height
    justifyContent: 'center', // Center text vertically
    alignItems: 'center', // Center text horizontally
    borderRadius: 20,
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'rgba(82, 82, 82, 1)',
    fontWeight: 'bold',
    fontSize: 16,
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
