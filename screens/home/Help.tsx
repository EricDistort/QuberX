import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { supabase } from '../../utils/supabaseClient';
import { useUser } from '../../utils/UserContext';

export default function SupportScreen() {
  const { user } = useUser();
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');

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
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (!error) setMessages(data || []);
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
    <SafeAreaView style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 10 }}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type your message..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  messageBubble: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 4,
    maxWidth: '80%',
  },
  userBubble: { backgroundColor: '#d1f7c4', alignSelf: 'flex-end' },
  adminBubble: { backgroundColor: '#e0e0e0', alignSelf: 'flex-start' },
  messageText: { fontSize: 16 },
  inputRow: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    marginBottom: 100,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  sendButton: {
    backgroundColor: '#8CA6DB',
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderRadius: 8,
  },
});
