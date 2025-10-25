import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp?: string;
}

const SYSTEM_PROMPT = {
  role: 'system',
  content: 'You are a super friendly, laid-back companion named Luna, like a close friend chilling together. Greet the user in a friendly, casual way as soon as the app opens (e.g., "Hey, great to see you back!" or "Yo, good to hang out again! 😄"). Start every new chat session or day with a fresh, casual greeting that changes daily (e.g., "Hey, good to catch up!" or "Yo, what’s the scene today?") and end with a warm, unique goodbye (e.g., "Catch you around!" or "Take it easy, yeah?"). Talk with slang, emojis, and a fun vibe, asking about their day or interests in a natural way (e.g., "How’s the day going so far?" or "Got any cool plans?"). Pick up on their mood from their words—like if they sound tired or pumped—and respond supportively without labeling emotions (e.g., say "Whoa, sounds like a busy one!" instead of "You seem stressed"). Avoid romantic terms like babe, girlfriend, or boy, and never sound robotic, technical, or like you’re analyzing them. Keep it light, human, and like you’re just hanging out with a pal.',
};

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Send initial greeting when app opens
    if (messages.length === 0) {
      const initialGreeting = 'Hey, great to see you back! 😄 What’s on your mind?';
      const greetingMessage: Message = {
        id: Date.now().toString(),
        text: initialGreeting,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([greetingMessage]);
    }

    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });
    return () => {
      showSubscription.remove();
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMessage]);
    const userInput = input;
    setInput('');

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const apiMessages = [
        SYSTEM_PROMPT,
        ...messages.map((msg) => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.text,
        })),
        { role: 'user', content: userInput },
      ];

      const API_KEY = Constants.expoConfig?.extra?.groqApiKey || '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';

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: apiMessages,
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Groq API Error:', errorText);
        throw new Error(`API request failed: ${errorText}`);
      }

      const data = await response.json();
      const botText = data.choices[0].message.content.trim();

      const botMessage: Message = {
        id: Date.now().toString(),
        text: botText,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMessage]);

      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: 'Oops, something went wrong. Try again? 😅',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.isUser ? styles.userContainer : styles.botContainer]}>
      <Image
        source={{ uri: item.isUser ? 'https://unsplash.com/photos/woman-wearing-black-crew-neck-shirt-3TLl_97HNJo' : 'https://unsplash.com/photos/woman-wearing-black-crew-neck-shirt-3TLl_97HNJo' }}
        style={styles.avatar}
      />
      <View style={[styles.bubble, item.isUser ? styles.userBubble : styles.botBubble]}>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#E6E6FA', '#D8BFD8']} style={styles.gradientBackground}>
          <View style={styles.header}>
            <Image source={{ uri: 'https://unsplash.com/photos/woman-wearing-black-crew-neck-shirt-3TLl_97HNJo' }} style={styles.logo} />
            <Text style={styles.headerText}>Chat with Luna</Text>
          </View>
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 80}
          >
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              style={styles.chatList}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Type a message..."
                placeholderTextColor="#999"
                multiline
              />
              <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                <Ionicons name="send" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </LinearGradient>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: 15,
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  headerText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 5,
    alignItems: 'flex-end',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  botContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  bubble: {
    padding: 10,
    borderRadius: 15,
    maxWidth: '70%',
  },
  userBubble: {
    backgroundColor: '#DCF8C6',
  },
  botBubble: {
    backgroundColor: '#E8E8E8',
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  input: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#7a1461ff',
    borderRadius: 50,
    padding: 10,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Chatbot;