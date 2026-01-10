import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Animated,
  Pressable,
} from 'react-native';
import { supabase } from '../../utils/supabaseClient';
import ScreenWrapper from '../../utils/ScreenWrapper';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

// --- POP CARD COMPONENT ---
const PopCard = ({ children, style }: any) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.97, // Very subtle shrink for large cards
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
      // onPress event can be added here later for navigation
      style={style}
    >
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default function FeedScreen() {
  const [feeds, setFeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Theme Colors
  const THEME_SHADOW = '#ff00d4'; 

  const fetchFeeds = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('feeds')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setFeeds(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFeeds();
    setRefreshing(false);
  }, []);

  const renderItem = ({ item }: { item: any }) => {
    const isVideo =
      item.banner_url &&
      (item.banner_url.endsWith('.mp4') || item.banner_url.includes('video'));

    const formattedDate = new Date(item.created_at).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric'
    });

    return (
      <PopCard style={styles.cardContainer}>
        {/* Shadow Layer */}
        <View style={styles.cardShadow} />

        <View style={styles.card}>
          {/* Media Section (Full Bleed) */}
          <View style={styles.mediaContainer}>
            {isVideo ? (
              <Video
                source={{ uri: item.banner_url }}
                style={styles.media}
                resizeMode="cover"
                repeat
                muted={true}
                paused={false}
              />
            ) : (
              <Image
                source={{ uri: item.banner_url }}
                style={styles.media}
                resizeMode="cover"
              />
            )}

            {/* Gradient Scrim (Overlay) for Text Readability */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)', '#0a0a0a']}
              start={{ x: 0, y: 0.4 }}
              end={{ x: 0, y: 1 }}
              style={styles.gradientOverlay}
            />

            {/* Date Badge (Floating) */}
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>{formattedDate}</Text>
            </View>

            {/* Title Overlay (Immersive) */}
            <View style={styles.titleOverlay}>
              <Text style={styles.title} numberOfLines={2}>
                {item.title}
              </Text>
            </View>
          </View>

          {/* Body Content */}
          <View style={styles.contentContainer}>
             {/* Accent Line */}
             <LinearGradient 
                colors={['#7b0094', '#ff00d4']}
                start={{x:0, y:0}} end={{x:1, y:0}}
                style={styles.accentLine}
             />
            <Text style={styles.body} numberOfLines={4}>
              {item.body}
            </Text>
          </View>
        </View>
      </PopCard>
    );
  };

  return (
    <ScreenWrapper>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          
          {/* Clean Header */}
          <View style={styles.header}>
            <Text style={styles.mainTitle}>Trending News</Text>
          </View>

          {loading && !refreshing ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#ff00d4" />
            </View>
          ) : (
            <FlatList
              data={feeds}
              keyExtractor={item => item.id.toString()}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl 
                  refreshing={refreshing} 
                  onRefresh={onRefresh} 
                  tintColor="#ff00d4" 
                  colors={['#ff00d4', '#7b0094']}
                  progressBackgroundColor="#1a1a1a"
                />
              }
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      </SafeAreaView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: s(16),
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Header */
  header: {
    marginTop: vs(20),
    marginBottom: vs(15),
  },
  mainTitle: {
    fontSize: ms(32),
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
  },

  /* Card Layout */
  listContent: {
    paddingBottom: vs(50),
  },
  cardContainer: {
    marginBottom: vs(30),
    position: 'relative',
  },
  cardShadow: {
    position: 'absolute',
    top: vs(15),
    left: s(15),
    right: s(15),
    bottom: -vs(5),
    backgroundColor: '#ff00d4',
    borderRadius: ms(24),
    opacity: 0.15, // Subtle glowing shadow behind the card
    transform: [{ scale: 0.95 }],
  },
  card: {
    backgroundColor: '#121212', // Deep dark grey
    borderRadius: ms(24),
    overflow: 'hidden',
    elevation: 10, // Android shadow
  },

  /* Media Section */
  mediaContainer: {
    width: '100%',
    height: vs(240), // Tall, immersive image
    position: 'relative',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%', // Fades from bottom up
  },
  
  /* Date Badge */
  dateBadge: {
    position: 'absolute',
    top: s(15),
    right: s(15),
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: vs(6),
    paddingHorizontal: s(12),
    borderRadius: ms(20),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dateText: {
    color: '#fff',
    fontSize: ms(12),
    fontWeight: '700',
  },

  /* Title Overlay */
  titleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: s(20),
    paddingBottom: vs(10), // Pushes title slightly up into the image area
  },
  title: {
    fontSize: ms(22),
    fontWeight: '800',
    color: '#fff',
    lineHeight: ms(28),
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  /* Content Body */
  contentContainer: {
    padding: s(20),
    paddingTop: vs(10),
    backgroundColor: '#121212',
  },
  accentLine: {
    width: s(40),
    height: vs(3),
    borderRadius: ms(2),
    marginBottom: vs(12),
  },
  body: {
    fontSize: ms(14),
    color: 'rgba(255,255,255,0.7)',
    lineHeight: ms(22),
    fontWeight: '400',
  },
});