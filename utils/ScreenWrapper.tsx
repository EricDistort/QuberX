import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

export default function ScreenWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ImageBackground
      source={require('../screens/LoginMedia/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
});
