import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Text,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';

export default function BrowserScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();

  const url = route.params?.url || 'https://santrx.com/login';
  const title = route.params?.title || 'Browser';

  const [isLoading, setIsLoading] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 🛑 FAIL-SAFE: Force stop loading after 8 seconds max
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 8000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleLoadStart = () => {
    setIsLoading(true);
    // Restart fail-safe timer on new navigation
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsLoading(false), 8000);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* 2️⃣ WebView */}
      <View style={styles.webViewContainer}>
        <WebView
          key={url} // Forces a fresh instance if URL changes
          source={{ uri: url }}
          // Load Handlers
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleLoadEnd}
          onHttpError={handleLoadEnd}
          onNavigationStateChange={navState => {
            // If page is done loading, stop spinner
            if (!navState.loading) handleLoadEnd();
          }}
          style={{ flex: 1, backgroundColor: '#000' }}
          containerStyle={{ backgroundColor: '#000' }}
          // Performance & JS Settings
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false} // We handle the loader manually
        />

        {/* 3️⃣ Floating Loader */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#ff00d4" />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    backgroundColor: '#000',
    zIndex: 10,
  },
  header: {
    height: vs(50),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(15),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 0, 212, 0.2)',
    backgroundColor: '#000',
  },
  headerTitle: {
    color: '#fff',
    fontSize: ms(16),
    fontWeight: 'bold',
    letterSpacing: 0.5,
    maxWidth: '60%',
  },
  backButtonContainer: {
    shadowColor: '#ff00d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  backButton: {
    width: s(36),
    height: s(36),
    borderRadius: s(18),
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    color: '#fff',
    fontSize: ms(20),
    fontWeight: 'bold',
    marginBottom: vs(2),
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
    marginTop: vs(20),
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
});
