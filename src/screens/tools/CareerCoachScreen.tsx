import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator, 
  Alert,
  Keyboard
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../utils/themeColors';
import { useTailwind } from '../../utils/tailwind';
import { useWallet } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api'; 
import { useTranslation } from 'react-i18next';
import { useAudioRecorder, RecordingStatus, RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync } from 'expo-audio';
import * as Speech from 'expo-speech';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
  isAudio?: boolean;
  audioUri?: string;
}

export const CareerCoachScreen = ({ navigation }: any) => {
  const colors = useThemeColors();
  const tw = useTailwind();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  
  const { user } = useAuth();
  const { balance, prices, refreshBalance } = useWallet();
  const cost = prices?.AI_COACH_INTERACTION?.cost ?? 1;
  const interactionsLimit = prices?.AI_COACH_INTERACTION?.interactions ?? 5;

  const currentLanguage = i18n.language;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [interactionsLeft, setInteractionsLeft] = useState<number>(0);
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
  
  const flatListRef = useRef<FlatList>(null);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const [interactionsTotal, setInteractionsTotal] = useState<number>(5);

  useEffect(() => {
    if (prices) {
        // 1. AI Disclaimer Alert
        Alert.alert(
          t('careerCoach.disclaimerTitle', 'AI Assistant Disclaimer'),
          t('careerCoach.disclaimerMessage', { count: interactionsLimit }),
          [{ text: t('common.ok', 'OK') }]
        );

        // 2. Forced Session Reset on Mount
        setSessionId(null);
        setInteractionsLeft(0);
        setInteractionsTotal(interactionsLimit);
    }
  }, [prices]);

  useEffect(() => {
     setMessages([
         {
             id: 'welcome',
             text: t('careerCoach.welcomeMessage'),
             sender: 'bot',
             timestamp: new Date().toISOString()
         }
     ]);
  }, [t]);

  const scrollToBottom = () => {
    setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSend = async (overrideInput?: string, audioUri?: string) => {
      const messageText = overrideInput || input;
      if ((!messageText.trim() && !audioUri) || loading) return;

      if (balance < cost) {
          Alert.alert(t('careerCoach.insufficientCredits'), t('careerCoach.needCredits', { cost, count: interactionsLimit }));
          return;
      }

      const userMsg: Message = {
          id: Date.now().toString(),
          text: audioUri ? t('careerCoach.voiceNote') : messageText.trim(),
          sender: 'user',
          timestamp: new Date().toISOString(),
          isAudio: !!audioUri,
          audioUri
      };

      setMessages(prev => [...prev, userMsg]);
      if (!audioUri) setInput('');
      setLoading(true);
      scrollToBottom();

      try {
          const userId = (user as any).$id || (user as any).uid || (user as any).id;
          
          let response;
          if (audioUri) {
              const formData = new FormData();
              formData.append('userId', userId);
              // @ts-ignore
              formData.append('audio', {
                  uri: audioUri,
                  type: 'audio/m4a',
                  name: 'voice_note.m4a',
              });
              formData.append('language', currentLanguage);
              if (sessionId) formData.append('sessionId', sessionId);
              response = await api.post('/api/chat/audio', formData, {
                  headers: { 'Content-Type': 'multipart/form-data' }
              });
          } else {
              response = await api.post('/api/chat/message', {
                  userId,
                  message: messageText,
                  language: currentLanguage,
                  sessionId
              });
          }

          const botMsg: Message = {
              id: Date.now().toString() + '_bot',
              text: response.data.response || "...",
              sender: 'bot',
              timestamp: new Date().toISOString()
          };

          setMessages(prev => [...prev, botMsg]);
          setSessionId(response.data.sessionId);
          setInteractionsLeft(response.data.interactionsLeft);

          // Update user message with transcription if available (STT)
          if (response.data.transcription && audioUri) {
              setMessages(prev => prev.map(m => 
                  m.audioUri === audioUri ? { ...m, text: `🎤 ${response.data.transcription}` } : m
              ));
          }
          if (response.data.maxInteractions) {
              setInteractionsTotal(response.data.maxInteractions);
          }
          refreshBalance();

      } catch (error: any) {
          console.error("Chat Error", error);
          const botErrorMsg: Message = {
             id: Date.now().toString() + '_err',
             text: t('careerCoach.errorConnecting'),
             sender: 'bot',
             timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, botErrorMsg]);
      } finally {
          setLoading(false);
          scrollToBottom();
      }
  };

  const startRecording = async () => {
    try {
      if (recorder.isRecording) {
          console.log('🎤 Recorder already recording, stopping first...');
          await recorder.stop();
      }
      // 1. Configure Audio Mode
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      // 2. Request Permissions
      const permission = await requestRecordingPermissionsAsync();
      
      if (!permission.granted) {
        Alert.alert(t('careerCoach.permissionRequired'), t('careerCoach.micAccess'));
        return;
      }
      setIsRecording(true);
      setRecordingStartTime(Date.now());
      
      try {
          await recorder.prepareToRecordAsync();
      } catch (prepErr: any) {
          // If already prepared, we can just proceed or ignore
          console.log('🎤 Recorder prepare info:', prepErr.message);
      }
      
      recorder.record();
    } catch (err) {
      console.error('Failed to start recording', err);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      
      const duration = Date.now() - recordingStartTime;
      if (duration < 1500) {
          console.log('🎤 Recording too short, skipping stop');
          // We still try to stop to cleanup, but ignore error if it's too short
          try { await recorder.stop(); } catch(e) {}
          return;
      }

      await recorder.stop();
      console.log('🎤 Recording stopped. URI:', recorder.uri);
      
      const uri = recorder.uri;
      if (uri) {
        handleSend('', uri);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const speak = (text: string) => {
    if (!text) return;
    Speech.speak(text, { 
      language: currentLanguage,
      pitch: 1.0,
      rate: 1.0 
    });
  };

  const renderItem = ({ item }: { item: Message }) => {
      const isUser = item.sender === 'user';
      return (
          <View style={[
              { 
                  marginBottom: 16,
                  padding: 14,
                  maxWidth: '82%',
                  borderRadius: 22,
                  elevation: 2,
                  shadowOffset: { width: 0, height: 1 },
                  shadowRadius: 3,
              },
              isUser ? 
                { 
                    alignSelf: 'flex-end', 
                    backgroundColor: colors.primary, 
                    borderBottomRightRadius: 4,
                    shadowColor: colors.primary,
                    shadowOpacity: 0.3,
                } : 
                { 
                    alignSelf: 'flex-start', 
                    backgroundColor: colors.card, 
                    borderBottomLeftRadius: 4,
                    borderWidth: 1,
                    borderColor: colors.cardBorder,
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                }
          ]}>
              <View style={tw('flex-row items-start')}>
                {!isUser && (
                    <View style={[tw('w-8 h-8 rounded-full items-center justify-center mr-2'), { backgroundColor: colors.primary + '15' }]}>
                        <Ionicons name="sparkles" size={16} color={colors.primary} />
                    </View>
                )}
                <View style={{ flexShrink: 1, justifyContent: 'center' }}>
                    <Text 
                        selectable
                        style={{ 
                            color: isUser ? '#FFFFFF' : (colors.textMain || '#000000'), 
                            fontSize: 16, 
                            lineHeight: 24,
                            minWidth: 40,
                        }}
                    >
                        {item.text || " "}
                    </Text>
                </View>
                {!isUser && item.text && (
                    <TouchableOpacity onPress={() => speak(item.text)} style={tw('ml-2 p-1')}>
                        <Ionicons name="volume-high-outline" size={20} color={colors.primary} />
                    </TouchableOpacity>
                )}
              </View>
              <Text style={{ 
                  color: isUser ? 'rgba(255,255,255,0.7)' : colors.textSecondary, 
                  fontSize: 10, 
                  marginTop: 6, 
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  fontWeight: '600'
              }}>
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
          </View>
      );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} 
        >
            <View style={[
                tw('flex-row items-center justify-between px-4 py-3 border-b'), 
                { borderColor: colors.cardBorder, paddingTop: insets.top + 10 }
            ]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={tw('p-2')}>
                    <Ionicons name="arrow-back" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <View style={tw('items-center')}>
                    <Text style={{ color: colors.textMain, fontSize: 18, fontWeight: '700' }}>{t('careerCoach.title')}</Text>
                    <Text style={{ color: sessionId ? colors.primary : colors.textSecondary, fontSize: 12, fontWeight: '600' }}>
                        {sessionId 
                            ? t('careerCoach.interactionsCount', { used: interactionsTotal - interactionsLeft, total: interactionsTotal })
                            : t('careerCoach.creditCost', { cost, count: interactionsLimit })}
                    </Text>
                </View>
                <View style={tw('flex-row items-center')}>
                    <TouchableOpacity 
                        onPress={() => {
                            setMessages([{ id: 'welcome', text: t('careerCoach.welcomeMessage'), sender: 'bot', timestamp: new Date().toISOString() }]);
                            setSessionId(null);
                            setInteractionsLeft(0);
                        }} 
                        style={tw('mr-3')}
                    >
                        <Ionicons name="refresh-circle-outline" size={28} color={colors.primary} />
                    </TouchableOpacity>

                    <View style={tw('flex-row items-center bg-gray-800 rounded-full px-3 py-1')}>
                        <Ionicons name="wallet-outline" size={16} color={colors.primary} style={tw('mr-1')} />
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>{balance}</Text>
                    </View>
                </View>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={tw('p-4')}
                style={{ flex: 1 }}
                onContentSizeChange={scrollToBottom}
                onLayout={scrollToBottom}
                ListFooterComponent={loading ? (
                    <View style={[
                        { 
                            alignSelf: 'flex-start', 
                            backgroundColor: colors.card, 
                            padding: 12, 
                            borderRadius: 18, 
                            borderBottomLeftRadius: 4,
                            borderWidth: 1,
                            borderColor: colors.cardBorder,
                            marginBottom: 16
                        }
                    ]}>
                        <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                ) : null}
            />

            {/* Input Area */}
            <View style={[
                tw('p-4 border-t flex-row items-center'), 
                { 
                    borderColor: colors.cardBorder, 
                    backgroundColor: colors.background,
                    paddingBottom: Platform.OS === 'ios' ? insets.bottom + 10 : 20 
                }
            ]}>
                  <TextInput
                      style={[
                          tw('flex-1 p-3 rounded-2xl mr-3 text-base'), 
                          { 
                            backgroundColor: colors.card, 
                            color: colors.textMain, 
                            maxHeight: 100, 
                            borderWidth: 1, 
                            borderColor: colors.cardBorder 
                          }
                      ]}
                      placeholder={isRecording ? t('careerCoach.recordingPlaceholder') : t('careerCoach.inputPlaceholder')}
                      placeholderTextColor={colors.textSecondary}
                      value={input}
                      onChangeText={setInput}
                      multiline
                      editable={!isRecording}
                  />
                                   <View style={tw('flex-row items-center')}>
                      {input.trim() === '' ? (
                          <TouchableOpacity 
                            onPressIn={() => startRecording()}
                            onPressOut={stopRecording}
                            disabled={(sessionId !== null && interactionsLeft === 0) || (balance < cost)}
                            style={[
                                tw('w-12 h-12 rounded-full items-center justify-center'),
                                { 
                                    backgroundColor: isRecording ? '#ef4444' : 
                                                   ((sessionId !== null && interactionsLeft === 0) || (balance < cost) ? colors.card : colors.cardBorder) 
                                }
                            ]}
                          >
                            <Ionicons 
                                name={isRecording ? "stop" : "mic"} 
                                size={24} 
                                color={isRecording ? "white" : ((sessionId !== null && interactionsLeft === 0) || (balance < cost) ? colors.textSecondary : colors.textMain)} 
                            />
                          </TouchableOpacity>
                      ) : (
                          <TouchableOpacity 
                              onPress={() => handleSend()}
                              disabled={loading || (sessionId !== null && interactionsLeft === 0) || (balance < cost)}
                              style={[
                                  tw('w-12 h-12 rounded-full items-center justify-center'),
                                  { 
                                    backgroundColor: (loading || (sessionId !== null && interactionsLeft === 0) || (balance < cost)) ? colors.cardBorder : colors.primary 
                                  }
                              ]}
                          >
                              {loading ? 
                                  <ActivityIndicator color="white" size="small" /> : 
                                  <Ionicons name="send" size={20} color="white" />
                              }
                          </TouchableOpacity>
                      )}
                  </View>
             </View>
        </KeyboardAvoidingView>
    </View>
  );
};