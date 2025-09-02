import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../../utils/supabaseClient';
import { useUser } from '../../utils/UserContext';
import ScreenWrapper from '../../utils/ScreenWrapper';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';

export default function SupportScreen() {
  const { user } = useUser();
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchOrCreateConversation = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'open')
      .maybeSingle();

    if (!error && data) {
      setConversationId(data.id);
      fetchMessages(data.id);
    } else {
      const { data: newConv, error: newError } = await supabase
        .from('conversations')
        .insert([{ user_id: user.id }])
        .select()
        .single();
      if (!newError) setConversationId(newConv.id);
    }
  };

  const fetchMessages = async (convId: number) => {
    setLoadingMessages(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (!error) setMessages(data || []);
    setLoadingMessages(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || !conversationId) return;
    await supabase.from('messages').insert([
      {
        conversation_id: conversationId,
        sender_id: user.id,
        sender_type: 'user',
        message_text: input.trim(),
      },
    ]);
    setInput('');
    fetchMessages(conversationId);
    Keyboard.dismiss();
  };

  const handleManualRefresh = async () => {
    if (conversationId) {
      setLoading(true);
      await fetchMessages(conversationId);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrCreateConversation();
  }, []);

  const renderItem = ({ item }: any) => (
    <View
      style={[
        styles.messageBubble,
        item.sender_type === 'user' ? styles.userBubble : styles.adminBubble,
      ]}
    >
      <Text style={styles.messageText}>{item.message_text}</Text>
    </View>
  );

  return (
    <ScreenWrapper>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Customer Support</Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleManualRefresh}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                  Refresh
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ flex: 1, borderRadius: ms(15) }}>
            <FlatList
              data={messages}
              keyExtractor={item => String(item.id)}
              renderItem={renderItem}
              contentContainerStyle={{ padding: s(10) }}
              inverted={false}
            />
          </ScrollView>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Type your message..."
              placeholderTextColor="#808080ff"
              returnKeyType="send"
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: s(20),
    paddingVertical: vs(10),
    marginTop: vs(40),
  },
  headerTitle: {
    fontSize: ms(22),
    fontWeight: 'bold',
    color: '#612369ff',
  },
  messageBubble: {
    padding: s(10),
    borderRadius: ms(8),
    marginVertical: vs(4),
    maxWidth: '80%',
  },
  userBubble: { backgroundColor: '#fcecffff', alignSelf: 'flex-end' },
  adminBubble: { backgroundColor: '#ffffffff', alignSelf: 'flex-start' },
  messageText: { fontSize: ms(16) },
  inputRow: {
    flexDirection: 'row',
    padding: s(20),
  },
  input: {
    flex: 1,
    backgroundColor: '#ffffffff',
    borderRadius: ms(50),
    paddingHorizontal: s(10),
    paddingVertical: vs(5),
    marginRight: s(8),
  },
  sendButton: {
    backgroundColor: '#8CA6DB',
    paddingHorizontal: s(16),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: ms(50),
    height: vs(40),
  },
  refreshButton: {
    backgroundColor: '#b78cdbff',
    //padding: ms(10),
    borderRadius: ms(50),
    justifyContent: 'center',
    alignItems: 'center',
    height: vs(30),
    width: s(70),
  },
});
