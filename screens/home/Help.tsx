import React, { useState, useEffect, useCallback } from 'react';
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
  ActivityIndicator, // Import ActivityIndicator
} from 'react-native';
import { supabase } from '../../utils/supabaseClient';
import { useUser } from '../../utils/UserContext';
import ScreenWrapper from '../../utils/ScreenWrapper';

export default function SupportScreen() {
  const { user } = useUser();
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loading, setLoading] = useState(false); // New loading state

  // Create a new conversation or fetch existing open one
  const fetchOrCreateConversation = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'open')
      .maybeSingle();

    if (error) console.log(error);

    if (data) {
      setConversationId(data.id);
      fetchMessages(data.id);
    } else {
      const { data: newConv, error: newError } = await supabase
        .from('conversations')
        .insert([{ user_id: user.id }])
        .select()
        .single();
      if (!newError) {
        setConversationId(newConv.id);
      }
    }
  };

  const fetchMessages = async (convId: number) => {
    setLoadingMessages(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (!error) {
      setMessages(data || []);
      setLoadingMessages(false);
    }
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
    Keyboard.dismiss(); // Dismiss the keyboard after sending the message
  };

  // Manually trigger the refresh of messages
  const handleManualRefresh = async () => {
    if (conversationId) {
      setLoading(true); // Set loading state to true when the button is clicked
      await fetchMessages(conversationId);
      setLoading(false); // Set loading state to false after the operation is done
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
          {/* Customer Support Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Customer Support</Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleManualRefresh}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" /> // Show loading animation when clicked
              ) : (
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                  Refresh
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ flex: 1, borderRadius: 15 }}>
            <FlatList
              data={messages}
              keyExtractor={item => String(item.id)}
              renderItem={renderItem}
              contentContainerStyle={{ padding: 10 }}
              inverted={false} // Display messages from top to bottom
            />
          </ScrollView>

          {/* Input Row */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Type your message..."
              placeholderTextColor="#808080ff"
              returnKeyType="send"
              onSubmitEditing={sendMessage} // Send message when 'send' key is pressed
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#a96bb1ff',
  },
  messageBubble: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 4,
    maxWidth: '80%',
  },
  userBubble: { backgroundColor: '#fcecffff', alignSelf: 'flex-end' },
  adminBubble: { backgroundColor: '#ffffffff', alignSelf: 'flex-start' },
  messageText: { fontSize: 16 },
  inputRow: {
    flexDirection: 'row',
    padding: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#ffffffff',
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#8CA6DB',
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    height: 40,
  },
  refreshButton: {
    backgroundColor: '#8CA6DB',
    padding: 10,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
