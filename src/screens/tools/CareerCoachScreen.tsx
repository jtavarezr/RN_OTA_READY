import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../utils/themeColors';
import { useTailwind } from '../../utils/tailwind';
import { useWallet } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api'; 
import { useTranslation } from 'react-i18next';

// Define Message Type
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

export const CareerCoachScreen = ({ navigation }: any) => {
  const colors = useThemeColors();
  const tw = useTailwind();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  
  // Wallet & Auth
  const { user } = useAuth();
  const { balance, prices, spendCredits, refreshBalance } = useWallet();
  const cost = prices?.AI_COACH_INTERACTION ?? 1;

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(true);
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
     // Initial Welcome Message
     setMessages([
         {
             id: 'welcome',
             text: "Hello! I am your AI Career Coach. I can help you with CVs, interviews, and career growth. How can I assist you today?",
             sender: 'bot',
             timestamp: new Date().toISOString()
         }
     ]);
     setItemsLoading(false);
  }, []);

  const handleSend = async () => {
      if (!input.trim() || loading) return;

      // 1. Check Balance
      if (balance < cost) {
          Alert.alert("Insufficient Credits", `You need ${cost} credit per message. Please earn more credits.`);
          return;
      }

      const userMsg: Message = {
          id: Date.now().toString(),
          text: input.trim(),
          sender: 'user',
          timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, userMsg]);
      setInput('');
      setLoading(true);

      // Perform API Call
      try {
          const userId = (user as any).$id || (user as any).uid || (user as any).id;
          
          // Optimistically deduct? No, let server handle deduction or context sync.
          // Ideally, we send request, server deducts. 
          
          const response = await api.post('/api/chat/message', {
              userId,
              message: userMsg.text
              // sessionId: ... (Optional, implementing single session for now or strictly stateless API with history context on server)
          });

          const botMsg: Message = {
              id: Date.now().toString() + '_bot',
              text: response.data.response,
              sender: 'bot',
              timestamp: new Date().toISOString()
          };

          setMessages(prev => [...prev, botMsg]);
          
          // Refresh balance to show deduction
          refreshBalance();

      } catch (error: any) {
          console.error("Chat Error", error);
          if (error.response?.status === 402) {
             Alert.alert("Insufficient Credits", "Out of credits.");
          } else {
             const botErrorMsg: Message = {
                id: Date.now().toString() + '_err',
                text: "I'm having trouble connecting to my service. Please try again.",
                sender: 'bot',
                timestamp: new Date().toISOString()
             };
             setMessages(prev => [...prev, botErrorMsg]);
          }
      } finally {
          setLoading(false);
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
  };

  const renderItem = ({ item }: { item: Message }) => {
      const isUser = item.sender === 'user';
      return (
          <View style={[
              tw('mb-4 max-w-3/4 p-4 rounded-2xl'),
              isUser ? 
                { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 4 } : 
                { alignSelf: 'flex-start', backgroundColor: colors.card, borderBottomLeftRadius: 4 }
          ]}>
              <Text style={{ color: isUser ? 'white' : colors.textMain, fontSize: 15, lineHeight: 22 }}>
                  {item.text}
              </Text>
              <Text style={{ color: isUser ? 'rgba(255,255,255,0.7)' : colors.textSecondary, fontSize: 10, marginTop: 4, alignSelf: 'flex-end' }}>
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
          </View>
      );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        {/* Header */}
        <View style={[tw('flex-row items-center justify-between px-4 py-3 border-b'), { borderColor: colors.cardBorder }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={tw('p-2')}>
                <Ionicons name="arrow-back" size={24} color={colors.textMain} />
            </TouchableOpacity>
            <View style={tw('items-center')}>
                <Text style={{ color: colors.textMain, fontSize: 18, fontWeight: '700' }}>AI Career Coach</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{cost} Credit / Message</Text>
            </View>
            <View style={tw('flex-row items-center')}>
                <TouchableOpacity 
                    onPress={() => {
                        setMessages([{
                             id: 'welcome',
                             text: "Hello! I am your AI Career Coach. I can help you with CVs, interviews, and career growth. How can I assist you today?",
                             sender: 'bot',
                             timestamp: new Date().toISOString()
                        }]);
                        setInput('');
                    }} 
                    style={tw('mr-3 padding-2')}
                >
                    <Ionicons name="refresh-circle-outline" size={28} color={colors.primary} />
                </TouchableOpacity>

                <View style={tw('flex-row items-center bg-gray-800 rounded-full px-3 py-1')}>
                        <Ionicons name="wallet-outline" size={16} color={colors.primary} style={tw('mr-1')} />
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>{balance}</Text>
                </View>
            </View>
        </View>

        {/* Chat List */}
        <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={tw('p-4')}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Input Area */}
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            style={{ width: '100%' }}
        >
             <View style={[tw('p-4 border-t flex-row items-center'), { borderColor: colors.cardBorder, backgroundColor: colors.background, paddingBottom: Platform.OS === 'android' ? 20 : 10 }]}>
                  <TextInput
                      style={[
                          tw('flex-1 p-3 rounded-full mr-3 text-base'), 
                          { backgroundColor: colors.card, color: colors.textMain, maxHeight: 100, borderWidth: 1, borderColor: colors.cardBorder }
                      ]}
                      placeholder="Ask about your CV, interview..."
                      placeholderTextColor={colors.textSecondary}
                      value={input}
                      onChangeText={setInput}
                      multiline
                  />
                  <TouchableOpacity 
                      onPress={handleSend}
                      disabled={loading || !input.trim()}
                      style={[
                          tw('w-12 h-12 rounded-full items-center justify-center'),
                          { backgroundColor: loading || !input.trim() ? colors.cardBorder : colors.primary }
                      ]}
                  >
                      {loading ? 
                          <ActivityIndicator color="white" size="small" /> : 
                          <Ionicons name="send" size={20} color="white" />
                      }
                  </TouchableOpacity>
             </View>
        </KeyboardAvoidingView>
    </View>
  );
};
