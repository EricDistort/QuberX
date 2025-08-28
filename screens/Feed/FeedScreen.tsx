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
  scale,
  verticalScale,
  moderateScale,
  ms,
  vs,
} from 'react-native-size-matters';
import Video from 'react-native-video';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.95;

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
        {/* Image or Video */}
        {isVideo ? (
          <Video
            source={{ uri: item.banner_url }}
            style={styles.media}
            resizeMode="cover"
            repeat
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
        <ActivityIndicator
          size="large"
          color="#000"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={feeds}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ padding: 10 }}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    width: cardWidth,
    alignSelf: 'center',
    overflow: 'hidden',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  media: {
    width: '100%',
    height: verticalScale(150),
    backgroundColor: '#000',
  },
  textContainer: {
    padding: moderateScale(12),
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 6,
  },
  body: {
    fontSize: 15,
    color: '#555',
  },
  maintitle: {
    fontSize: ms(20),
    marginBottom: vs(10),
    color: '#a96bb1ff',
    fontWeight: 'bold',
    alignSelf: 'center',
    marginTop: vs(20),
  },
});
