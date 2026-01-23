import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, 
  Animated, ScrollView, Platform, Share, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { 
  useAudioRecorder, 
  useAudioPlayer,
  RecordingPresets, 
  requestRecordingPermissionsAsync, 
  setAudioModeAsync 
} from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../utils/themeColors';
import { NativeAdSmall } from '../../components/ads/NativeAdSmall';

interface RecordingEntry {
  id: string;
  uri: string;
  date: string;
  title: string;
  duration: string;
}

const AudioWaves = ({ isPlaying, colors }: { isPlaying: boolean; colors: any }) => {
  const animations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    if (isPlaying) {
      const animate = (anim: Animated.Value, delay: number) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      animations.forEach((anim, i) => animate(anim, i * 150));
    } else {
      animations.forEach(anim => {
        anim.stopAnimation();
        anim.setValue(0);
      });
    }
  }, [isPlaying]);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 40, gap: 4 }}>
      {animations.map((anim, i) => (
        <Animated.View
          key={i}
          style={{
            width: 4,
            height: 30,
            borderRadius: 2,
            backgroundColor: colors.primary,
            transform: [{
              scaleY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1]
              })
            }]
          }}
        />
      ))}
    </View>
  );
};

export default function AudioRecorder() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const navigation = useNavigation();
  
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [status, setStatus] = useState(t('voiceRecorder.ready'));
  const [transcript, setTranscript] = useState('');
  const [lastUri, setLastUri] = useState<string | null>(null);
  const [recordingsList, setRecordingsList] = useState<RecordingEntry[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [adKey, setAdKey] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const player = useAudioPlayer(lastUri);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [barWidth, setBarWidth] = useState(0);
  
  const handleSeek = (ratio: number) => {
    if (player && playbackDuration > 0) {
      const newPos = ratio * playbackDuration;
      player.seekTo(newPos);
      setPlaybackPosition(newPos);
    }
  };

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (player) {
      const subscription = player.addListener('playbackStatusUpdate', (status: any) => {
        setIsPlaying(status.playing);
        setPlaybackPosition(status.currentTime || 0);
        
        const duration = status.duration || player.duration || 0;
        setPlaybackDuration(duration);
        
        if (status.didJustFinish) {
          player.pause();
          player.seekTo(0);
          setIsPlaying(false);
          setPlaybackPosition(0);
        }
      });
      return () => subscription.remove();
    }
  }, [player]);

  useEffect(() => {
    if (recorder.isRecording) {
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recorder.isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- LÓGICA DE GRABACIÓN ---
  async function startRecording() {
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('voiceRecorder.permissionRequired'), t('voiceRecorder.micAccess'));
        return;
      }
      
      setTranscript(t('voiceRecorder.startSignalCapture'));
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      
      try {
        await recorder.prepareToRecordAsync();
      } catch (prepErr) {
        console.log('Recorder prepare info:', prepErr);
      }

      recorder.record();
      setAdKey(prev => prev + 1); // Forzar cambio de anuncio al grabar
      setStatus(t('voiceRecorder.recording'));
      startPulse();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (err) { 
      console.error('Failed to start recording', err); 
    }
  }

  async function stopRecording() {
    if (!recorder.isRecording) return;
    
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) return;
      
      const newEntry: RecordingEntry = {
        id: Date.now().toString(),
        uri: uri,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: `LOG_${recordingsList.length + 1}`,
        duration: formatTime(recordingTime)
      };
      
      setRecordingsList([newEntry, ...recordingsList]);
      setLastUri(uri);
      setStatus(t('voiceRecorder.idle'));
      setTranscript(prev => prev + `\n${t('voiceRecorder.logStored', { logTitle: newEntry.title })}`);
      pulseAnim.setValue(1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  }

  // --- CONTROLES DE REPRODUCCIÓN ---
  function playPauseSound() {
    if (!lastUri || !player) return;
    
    if (player.playing) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  }

  const stopSound = () => { 
    if (player) {
      player.pause();
      player.seekTo(0);
      setIsPlaying(false);
    }
  };

  const restartSound = () => { 
    if (player) {
      player.seekTo(0);
      player.play();
      setIsPlaying(true);
    }
  };

  // --- GESTIÓN DE MEMORIA ---
  const selectFromHistory = (uri: string) => {
    setLastUri(uri);
    setTranscript(t('voiceRecorder.loaded', { logTitle: recordingsList.find(r => r.uri === uri)?.title }));
  };

  const deleteOne = (id: string) => {
    setRecordingsList(prev => prev.filter(r => r.id !== id));
    if (recordingsList.length === 1) setLastUri(null);
  };

  const clearAll = () => {
    Alert.alert(t('voiceRecorder.deleteHistory'), t('voiceRecorder.confirmDelete'), [
      { text: t('voiceRecorder.cancel'), style: "cancel" },
      { text: t('voiceRecorder.delete'), onPress: () => { setRecordingsList([]); setLastUri(null); setTranscript(t('voiceRecorder.emptyMemory')); } }
    ]);
  };

  const startPulse = () => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ])).start();
  };

  const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: colors.background, 
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.cardBorder,
    },
    headerTitle: {
      color: colors.textMain,
      fontSize: 18,
      fontWeight: '700',
    },
    content: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 10,
    },
    
    terminal: { 
      width: '100%', 
      backgroundColor: colors.card, 
      borderRadius: 16, 
      borderWidth: 1, 
      borderColor: colors.primary, 
      overflow: 'hidden',
      marginBottom: 15,
    },
    termHeader: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      backgroundColor: colors.card, 
      padding: 10, 
      borderBottomWidth: 1, 
      borderBottomColor: colors.primary 
    },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.error, marginRight: 10 },
    termLabel: { color: colors.textSecondary, fontSize: 10, fontWeight: 'bold' },
    termText: { color: colors.success, fontSize: 12, padding: 15, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },

    micArea: { 
      height: 180, 
      justifyContent: 'center', 
      alignItems: 'center', 
      marginVertical: 5,
      width: '100%',
    },
    timerText: {
      color: colors.error,
      fontSize: 20,
      fontWeight: 'bold',
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      marginTop: 10,
    },
    recBtnContainer: {
      width: 100,
      height: 100,
      justifyContent: 'center',
      alignItems: 'center',
    },
    recBtn: { 
      width: 80, 
      height: 80, 
      borderRadius: 40, 
      backgroundColor: colors.card, 
      justifyContent: 'center', 
      alignItems: 'center', 
      borderWidth: 3, 
      borderColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
      zIndex: 2,
    },
    recBtnActive: { borderColor: colors.error, shadowColor: colors.error },
    pulse: { 
      position: 'absolute', 
      width: 95, 
      height: 95, 
      borderRadius: 47.5, 
      borderWidth: 3, 
      borderColor: colors.error,
      zIndex: 1,
    },

    playbackPanel: { 
      minHeight: 130, 
      width: '100%', 
      justifyContent: 'center',
      paddingVertical: 10,
    },
    controlsRow: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-evenly', 
      paddingHorizontal: 20,
      marginTop: 10,
    },
    playBtn: { 
      width: 65, 
      height: 65, 
      borderRadius: 32.5, 
      backgroundColor: colors.primary, 
      justifyContent: 'center', 
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 5,
    },
    subBtn: { 
      width: 45, 
      height: 45, 
      borderRadius: 22.5, 
      backgroundColor: colors.card, 
      justifyContent: 'center', 
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.primaryMuted,
    },
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 10,
    },
    progressBar: {
      flex: 1,
      height: 6,
      backgroundColor: colors.cardBorder,
      borderRadius: 3,
      marginHorizontal: 10,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
    },
    timeLabel: {
      color: colors.textSecondary,
      fontSize: 10,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      width: 40,
      textAlign: 'center',
    },
    historyBox: { 
      width: '100%', 
      flex: 1, 
      backgroundColor: colors.card, 
      borderRadius: 20, 
      padding: 15, 
      borderWidth: 1, 
      borderColor: colors.cardBorder,
      marginBottom: 10,
    },
    historyHeader: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: 15, 
      paddingBottom: 10, 
      borderBottomWidth: 1, 
      borderBottomColor: colors.cardBorder 
    },
    historyTitle: { color: colors.primary, fontWeight: 'bold', fontSize: 12 },
    clearBtn: { color: colors.error, fontSize: 11, fontWeight: 'bold' },
    item: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      backgroundColor: colors.background, 
      padding: 14, 
      borderRadius: 12, 
      marginBottom: 10,
      borderWidth: 1,
      borderColor: 'transparent'
    },
    itemActive: { borderColor: colors.success, backgroundColor: colors.card },
    itemText: { color: colors.textMain, fontWeight: 'bold', fontSize: 14 },
    itemDuration: { color: colors.primary, fontSize: 12, fontWeight: 'bold' },
    itemDate: { color: colors.textSecondary, fontSize: 10, marginTop: 2 },
    
    footerStatus: { 
      color: colors.textSecondary, 
      fontSize: 10, 
      fontWeight: 'bold', 
      textAlign: 'center',
      marginBottom: 15,
      letterSpacing: 1 
    }
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
          <Ionicons name="arrow-back" size={24} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('voiceRecorder.title')}</Text>
        <View style={{ width: 34 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.terminal, { flex: recordingsList.length > 0 ? 0.4 : 0.8 }]}>
          <View style={styles.termHeader}>
            <View style={styles.dot} />
            <Text style={styles.termLabel}>{t('voiceRecorder.systemTranscript')}</Text>
          </View>
          <ScrollView ref={scrollViewRef} onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}>
            <Text style={styles.termText}>{transcript || t('voiceRecorder.waitingForData')}</Text>
          </ScrollView>
        </View>

        <View style={styles.micArea}>
          <View style={styles.recBtnContainer}>
            {!!recorder.isRecording && (
              <Animated.View style={[styles.pulse, { transform: [{ scale: pulseAnim }] }]} />
            )}
            <TouchableOpacity 
              onPress={recorder.isRecording ? stopRecording : startRecording} 
              style={[styles.recBtn, recorder.isRecording && styles.recBtnActive]}
            >
              {isPlaying ? (
                <AudioWaves isPlaying={isPlaying} colors={colors} />
              ) : (
                <Ionicons 
                  name={recorder.isRecording ? "stop" : "mic"} 
                  size={45} 
                  color={recorder.isRecording ? colors.error : colors.primary} 
                />
              )}
            </TouchableOpacity>
          </View>
          {!!recorder.isRecording && (
            <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
          )}
          <Text style={[styles.footerStatus, { marginTop: 15, marginBottom: 0 }]}>{status}</Text>
        </View>

        <View style={styles.playbackPanel}>
          {!!(lastUri && !recorder.isRecording) && (
            <>
              <View style={styles.progressContainer}>
                <Text style={styles.timeLabel}>{formatTime(Math.floor(playbackPosition))}</Text>
                <TouchableOpacity 
                  style={styles.progressBar} 
                  activeOpacity={1}
                  onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
                  onPress={(e) => {
                    if (barWidth > 0) {
                      handleSeek(e.nativeEvent.locationX / barWidth);
                    }
                  }}
                >
                  <View style={[styles.progressFill, { width: `${(playbackPosition / (playbackDuration || 1)) * 100}%` }]} />
                </TouchableOpacity>
                <Text style={styles.timeLabel}>{formatTime(Math.floor(playbackDuration))}</Text>
              </View>

              <View style={styles.controlsRow}>
                <TouchableOpacity onPress={restartSound} style={styles.subBtn}>
                  <Ionicons name="refresh" size={24} color={colors.primary} />
                </TouchableOpacity>
                
                <TouchableOpacity onPress={playPauseSound} style={styles.playBtn}>
                  <Ionicons name={isPlaying ? "pause" : "play"} size={35} color="white" />
                </TouchableOpacity>

                <TouchableOpacity onPress={stopSound} style={styles.subBtn}>
                  <Ionicons name="square" size={20} color={colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => Share.share({ url: lastUri })} style={styles.subBtn}>
                  <Ionicons name="share-social" size={24} color={colors.success} />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <View style={{ width: '100%', paddingVertical: 10 }}>
          <NativeAdSmall key={adKey} />
        </View>

        <View style={styles.historyBox}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>{t('voiceRecorder.savedFiles')}</Text>
            {recordingsList.length > 0 ? (
              <TouchableOpacity onPress={clearAll}>
                <Text style={styles.clearBtn}>{t('voiceRecorder.clearAll')}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          
          {recordingsList.length > 0 ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              {recordingsList.map((item) => (
                <View key={item.id} style={[styles.item, lastUri === item.uri && styles.itemActive]}>
                  <TouchableOpacity style={{ flex: 1 }} onPress={() => selectFromHistory(item.uri)}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={styles.itemText}>{item.title}</Text>
                      <Text style={styles.itemDuration}>{item.duration}</Text>
                    </View>
                    <Text style={styles.itemDate}>{item.date}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteOne(item.id)} style={{ padding: 5, marginLeft: 10 }}>
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', opacity: 0.3 }}>
              <Ionicons name="folder-open-outline" size={40} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 10 }}>{t('voiceRecorder.emptyMemory')}</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}