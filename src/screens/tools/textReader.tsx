import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  Platform, StatusBar, ScrollView, Dimensions, FlatList, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useThemeColors } from '../../utils/themeColors';
import { AppHeader } from '../../components/AppHeader';
import { NativeAdSmall } from '../../components/ads/NativeAdSmall';

export default function TextReader() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const colors = useThemeColors();
  const navigation = useNavigation();
  
  const [text, setText] = useState('');
  const [rate, setRate] = useState(1.0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [gender, setGender] = useState('Female'); 
  const [selectedLang, setSelectedLang] = useState('es'); 
  const [availableVoices, setAvailableVoices] = useState<Speech.Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<Speech.Voice | null>(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [adKey, setAdKey] = useState(0);

  // 1. Cargar voces disponibles
  useEffect(() => {
    async function loadVoices() {
      const voices = await Speech.getAvailableVoicesAsync();
      setAvailableVoices(voices);
      
      // Selección inicial inteligente
      const defaultVoice = voices.find(v => v.language.startsWith('es')) || voices[0];
      setSelectedVoice(defaultVoice || null);
    }
    loadVoices();
  }, []);

  // 2. Detección de idioma automática
  useEffect(() => {
    if (!text.trim()) return;
    const words = text.toLowerCase().split(/\s+/);
    const esCommon = ['el', 'la', 'que', 'en', 'y', 'de', 'para', 'con', 'es', 'un'];
    const enCommon = ['the', 'and', 'that', 'with', 'of', 'is', 'for', 'this', 'it', 'in'];
    
    let esScore = 0;
    let enScore = 0;
    
    words.slice(0, 20).forEach(w => {
      if (esCommon.includes(w)) esScore++;
      if (enCommon.includes(w)) enScore++;
    });

    if (enScore > esScore && selectedLang !== 'en') setSelectedLang('en');
    else if (esScore > enScore && selectedLang !== 'es') setSelectedLang('es');
  }, [text]);

  // 3. Lógica de Filtrado de Voces
  const filteredVoices = useMemo(() => {
    const langVoices = availableVoices.filter(v => 
      v.language.toLowerCase().startsWith(selectedLang)
    );

    const genderVoices = langVoices.filter(v => {
      if (Platform.OS === 'ios') {
        return (v as any).gender === gender.toLowerCase();
      } else {
        const name = v.name.toLowerCase();
        const maleKeywords = ['male', 'guy', 'man', 'pablo', 'raul', 'en-us-x-iom', 'es-es-x-ana']; 
        const femaleKeywords = ['female', 'girl', 'woman', 'helena', 'laura', 'es-es-x-low', 'en-us-x-sfg'];

        if (gender === 'Male') {
          return maleKeywords.some(key => name.includes(key));
        } else {
          return femaleKeywords.some(key => name.includes(key));
        }
      }
    });

    return genderVoices.length > 0 ? genderVoices : langVoices;
  }, [availableVoices, selectedLang, gender]);

  // 4. Auto-seleccionar voz cuando cambian los filtros
  useEffect(() => {
    if (filteredVoices.length > 0) {
      const isStillAvailable = filteredVoices.find(v => v.identifier === selectedVoice?.identifier);
      if (!isStillAvailable) {
        setSelectedVoice(filteredVoices[0]);
      }
    }
  }, [filteredVoices]);

  const handleSpeak = async () => {
    if (!text.trim()) return;
    
    if (isSpeaking) {
      await Speech.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    setAdKey(prev => prev + 1); // Refresh ad when starting to speak
    await Speech.speak(text, {
      voice: selectedVoice?.identifier,
      language: selectedVoice?.language || (selectedLang === 'es' ? 'es-ES' : 'en-US'),
      rate: rate,
      onDone: () => { setIsSpeaking(false); },
      onStopped: () => { setIsSpeaking(false); },
      onError: (e) => {
        console.error(e);
        setIsSpeaking(false);
      },
    });
  };

  return (
    <View style={[styles.master, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      <AppHeader 
        showBack={true} 
        onBackPress={() => navigation.goBack()} 
        title={t('textReader.title')}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.inputWrapper}>
          <View style={[styles.inputBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <TextInput
              style={[styles.input, { color: colors.textMain }]}
              multiline
              placeholder={t('textReader.placeholder')}
              placeholderTextColor={colors.textSecondary}
              value={text}
              onChangeText={setText}
            />
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t('textReader.voiceConfig')}</Text>

        <View style={styles.grid}>
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} 
            onPress={() => setShowVoiceModal(true)}
          >
            <MaterialIcons name="record-voice-over" size={18} color={colors.primary} />
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('textReader.selectedVoice')}</Text>
            <Text style={[styles.cardValue, { color: colors.textMain }]} numberOfLines={1}>
              {selectedVoice?.name || t('textReader.searching')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} 
            onPress={() => setSelectedLang(selectedLang === 'es' ? 'en' : 'es')}
          >
            <MaterialIcons name="translate" size={18} color={colors.primary} />
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('textReader.languageManual')}</Text>
            <Text style={[styles.cardValue, { color: colors.textMain }]}>
              {selectedLang === 'es' ? 'Español' : 'Inglés'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t('textReader.genderSpeed')}</Text>

        <View style={styles.segmentedWrapper}>
          <View style={[styles.segmentedContainer, { backgroundColor: colors.background, borderColor: colors.cardBorder, borderWidth: 1 }]}>
            {['Male', 'Female'].map(g => (
              <TouchableOpacity 
                key={g} 
                onPress={() => setGender(g)} 
                style={[
                  styles.segmentBtn, 
                  gender === g && { backgroundColor: colors.primary }
                ]}
              >
                <Text style={[
                  styles.segmentText, 
                  { color: colors.textSecondary },
                  gender === g && { color: '#fff' }
                ]}>
                  {g === 'Male' ? t('textReader.male') : t('textReader.female')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.sliderCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.sliderHeader}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('textReader.speed')}</Text>
            <Text style={[styles.speedValue, { color: colors.primary }]}>{rate.toFixed(1)}x</Text>
          </View>
          <View style={styles.controlsRow}>
            <TouchableOpacity onPress={() => setRate(Math.max(0.5, rate - 0.1))} style={[styles.stepBtn, { backgroundColor: colors.background }]}>
              <MaterialIcons name="remove" size={20} color={colors.primary} />
            </TouchableOpacity>
            <View style={[styles.sliderTrack, { backgroundColor: colors.background }]}>
              <View style={[styles.sliderProgress, { width: `${(rate / 2) * 100}%`, backgroundColor: colors.primary }]} />
            </View>
            <TouchableOpacity onPress={() => setRate(Math.min(2, rate + 0.1))} style={[styles.stepBtn, { backgroundColor: colors.background }]}>
              <MaterialIcons name="add" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ paddingHorizontal: 25, marginBottom: 25 }}>
          <NativeAdSmall key={adKey} />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <Modal visible={showVoiceModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textMain }]}>
                {t('textReader.selectVoice')} ({selectedLang.toUpperCase()})
              </Text>
              <TouchableOpacity onPress={() => setShowVoiceModal(false)}>
                <MaterialIcons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={filteredVoices}
              keyExtractor={(item) => item.identifier}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.voiceItem, 
                    { backgroundColor: colors.background, borderColor: colors.cardBorder },
                    selectedVoice?.identifier === item.identifier && { borderColor: colors.primary, borderWidth: 1.5 }
                  ]}
                  onPress={() => { setSelectedVoice(item); setShowVoiceModal(false); }}
                >
                  <Text style={[styles.voiceItemText, { color: colors.textMain }]}>{item.name}</Text>
                  {selectedVoice?.identifier === item.identifier && 
                    <MaterialIcons name="check-circle" size={20} color={colors.primary} />
                  }
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <View style={styles.fabContainer}>
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: colors.primary }, isSpeaking && { backgroundColor: colors.error }]} 
          onPress={handleSpeak}
        >
          <MaterialIcons name={isSpeaking ? "stop" : "play-arrow"} size={50} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  master: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 20, paddingTop: 20 },
  header: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  inputWrapper: { paddingHorizontal: 25, marginBottom: 25 },
  inputBox: { 
    borderRadius: 20, 
    minHeight: 180, 
    padding: 15,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: { flex: 1, fontSize: 16, textAlignVertical: 'top' },
  sectionLabel: { paddingHorizontal: 25, fontSize: 11, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 },
  grid: { flexDirection: 'row', paddingHorizontal: 25, justifyContent: 'space-between', marginBottom: 25 },
  card: { width: '47%', borderRadius: 20, padding: 15, borderWidth: 1, elevation: 2 },
  cardLabel: { fontSize: 9, fontWeight: 'bold', marginTop: 10 },
  cardValue: { fontSize: 14, fontWeight: 'bold', marginTop: 4 },
  segmentedWrapper: { paddingHorizontal: 25, marginBottom: 25 },
  segmentedContainer: { flexDirection: 'row', borderRadius: 15, padding: 4 },
  segmentBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  segmentText: { fontSize: 12, fontWeight: 'bold' },
  sliderCard: { marginHorizontal: 25, padding: 20, borderRadius: 25, borderWidth: 1, elevation: 2 },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  speedValue: { fontWeight: 'bold', fontSize: 16 },
  controlsRow: { flexDirection: 'row', alignItems: 'center' },
  stepBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  sliderTrack: { flex: 1, height: 8, borderRadius: 4, marginHorizontal: 15, overflow: 'hidden' },
  sliderProgress: { height: '100%' },
  fabContainer: { 
    position: 'absolute', 
    bottom: 40, 
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', elevation: 10 },
  subFab: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 25, height: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  voiceItem: { padding: 18, borderRadius: 15, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1 },
  voiceItemText: { fontSize: 15, fontWeight: '500' }
});