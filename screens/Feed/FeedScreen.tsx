import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
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
const cardWidth = width * 0.92;

export default function FeedScreen() {
  const [feeds, setFeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

    return (
      
        <View style={styles.card}>
          {isVideo ? (
            <Video
              source={{ uri: item.banner_url }}
              style={styles.media}
              resizeMode="cover"
              repeat
              controls
            />
          ) : (
            <Image
              source={{ uri: item.banner_url }}
              style={styles.media}
              resizeMode="cover"
            />
          )}

          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        </View>
      
    );
  };

  return (
    <ScreenWrapper>
      <Text style={styles.maintitle}>News Feed</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#00ffff" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={feeds}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: vs(30), alignItems: 'center' }}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  gradientBorder: {
    borderRadius: ms(14),
    padding: ms(2),
    marginBottom: vs(12),
    width: cardWidth,
  },
  card: {
    backgroundColor: 'rgba(0, 204, 255, 0.1)',
    borderRadius: ms(14),
    overflow: 'hidden',
    marginBottom: vs(20),
    margin: s(10),
    
  },
  media: {
    width: '100%',
    height: vs(160),
    backgroundColor: '#000',
    borderTopLeftRadius: ms(14),
    borderTopRightRadius: ms(14),
  },
  textContainer: {
    padding: s(12),
  },
  title: {
    fontSize: ms(18),
    fontWeight: 'bold',
    color: '#00ffff',
    marginBottom: vs(6),
  },
  body: {
    fontSize: ms(15),
    color: '#ddd',
  },
  maintitle: {
    fontSize: ms(22),
    marginBottom: vs(12),
    color: '#00ffff',
    fontWeight: 'bold',
    alignSelf: 'center',
    marginTop: vs(20),
  },
});
