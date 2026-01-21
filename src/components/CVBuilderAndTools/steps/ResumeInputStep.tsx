import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../../utils/themeColors';
import { useTailwind } from '../../../utils/tailwind';
import { NativeAd } from '../../ads/NativeAd';

interface ResumeInputStepProps {
  resumeText: string;
  setResumeText: (text: string) => void;
  resumeInputType: 'text' | 'file';
  setResumeInputType: (type: 'text' | 'file') => void;
  resumeFile: any;
  pickDocument: (target: 'resume') => void;
}

export const ResumeInputStep: React.FC<ResumeInputStepProps> = ({
  resumeText, setResumeText,
  resumeInputType, setResumeInputType,
  resumeFile, pickDocument
}) => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const tw = useTailwind();

  return (
    <View>
      <Text style={[styles.title, { color: colors.textMain }]}>{t('jobResume.step2.title')}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('jobResume.step2.subtitle')}</Text>
      
      <View style={[styles.mainCard, styles.resumeCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={tw('flex-row gap-3 mb-6 w-full')}>
          {['file', 'text'].map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setResumeInputType(type as any)}
              style={[
                tw('flex-1 py-3 rounded-xl border items-center flex-row justify-center gap-2'),
                { 
                  borderColor: resumeInputType === type ? colors.primary : colors.cardBorder,
                  backgroundColor: resumeInputType === type ? colors.primary + '15' : colors.background
                }
              ]}
            >
              <Ionicons name={type === 'text' ? 'create-outline' : 'document-text-outline'} size={18} color={resumeInputType === type ? colors.primary : colors.textSecondary} />
              <Text style={{ color: resumeInputType === type ? colors.primary : colors.textSecondary, fontWeight: '600', textTransform: 'capitalize' }}>
                {type === 'text' ? t('jobResume.step1.pasteText') : t('jobResume.step1.uploadFile')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {resumeInputType === 'file' ? (
          <View style={tw('w-full items-center')}>
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => pickDocument('resume')}
              style={[styles.previewBtn, { width: '100%', borderColor: colors.primary, backgroundColor: colors.primary + '05', borderStyle: 'dashed' }]}
            >
                {resumeFile ? (
                      <View style={tw('items-center')}>
                        <Ionicons name="document" size={38} color={colors.primary} />
                        <Text style={[styles.fileName, { color: colors.textMain, marginTop: 10 }]}>{resumeFile.name}</Text>
                        <Text style={{ color: colors.success, fontSize: 12, fontWeight: '700', marginTop: 4 }}>{t('jobResume.step2.ready')}</Text>
                      </View>
                ) : (
                    <View style={tw('items-center')}>
                        <Ionicons name="cloud-upload" size={38} color={colors.primary} />
                        <Text style={[styles.previewText, { color: colors.textSecondary, marginTop: 10 }]}>{t('jobResume.step2.tapToUpload')}</Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 4 }}>{t('jobResume.step2.fileType')}</Text>
                    </View>
                )}
            </TouchableOpacity>
          </View>
        ) : (
          <TextInput
            multiline
            style={[styles.textArea, { width: '100%', borderColor: colors.cardBorder, color: colors.textMain, backgroundColor: colors.background }]}
            placeholder={t('jobResume.step2.pastePlaceholder')}
            placeholderTextColor={colors.textSecondary}
            value={resumeText}
            onChangeText={setResumeText}
          />
        )}
      </View>

      <View style={styles.adContainer}>
          <NativeAd />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '800', marginBottom: 6 },
  subtitle: { fontSize: 14, marginBottom: 20 },
  mainCard: { borderRadius: 20, padding: 20, borderWidth: 1, marginBottom: 15 },
  resumeCard: { alignItems: 'center', paddingVertical: 30 },
  fileName: { fontSize: 16, fontWeight: '700' },
  textArea: { height: 140, borderWidth: 1, borderRadius: 12, padding: 15, textAlignVertical: 'top', fontSize: 15, lineHeight: 22 },
  previewBtn: { width: '100%', height: 120, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  previewText: { fontSize: 14, fontWeight: '700' },
  adContainer: { marginVertical: 10, alignItems: 'center', width: '100%', overflow: 'hidden' },
});
