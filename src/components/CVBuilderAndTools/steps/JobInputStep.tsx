import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../../utils/themeColors';
import { useTailwind } from '../../../utils/tailwind';
import { NativeAd } from '../../ads/NativeAd';

interface JobInputStepProps {
  jobTitle: string;
  setJobTitle: (text: string) => void;
  jobDescription: string;
  setJobDescription: (text: string) => void;
  jobInputType: 'text' | 'file';
  setJobInputType: (type: 'text' | 'file') => void;
  jobFile: any;
  pickDocument: (target: 'job') => void;
  reportType: 'basic' | 'advanced';
  setReportType: (type: 'basic' | 'advanced') => void;
}

export const JobInputStep: React.FC<JobInputStepProps> = ({
  jobTitle, setJobTitle,
  jobDescription, setJobDescription,
  jobInputType, setJobInputType,
  jobFile, pickDocument,
  reportType, setReportType
}) => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const tw = useTailwind();

  return (
    <View>
      <Text style={[styles.title, { color: colors.textMain }]}>{t('jobResume.step1.title')}</Text>
      
      <View style={[styles.mainCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        {/* Report Type Selector */}
        <Text style={[styles.inputLabel, { color: colors.textMain }]}>{t('jobResume.step1.reportType')}</Text>
        <View style={tw('flex-row gap-3 mb-6')}>
          {(['basic', 'advanced'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setReportType(type)}
              style={[
                tw('flex-1 py-3 px-2 rounded-xl border items-center justify-center'),
                { 
                  borderColor: reportType === type ? colors.primary : colors.cardBorder,
                  backgroundColor: reportType === type ? colors.primary + '15' : colors.background
                }
              ]}
            >
              <Text style={{ color: reportType === type ? colors.primary : colors.textSecondary, fontWeight: '700', textTransform: 'capitalize' }}>
                {t(`jobResume.step1.${type}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.inputLabel, { color: colors.textMain }]}>{t('jobResume.step1.jobTitle')}</Text>
        <TextInput 
          style={[styles.inputField, { borderColor: colors.cardBorder, color: colors.textMain, backgroundColor: colors.background }]} 
          placeholder={t('jobResume.step1.jobTitlePlaceholder')}
          placeholderTextColor={colors.textSecondary}
          value={jobTitle}
          onChangeText={setJobTitle}
        />

        <Text style={[styles.inputLabel, { color: colors.textMain, marginTop: 14 }]}>{t('jobResume.step1.source')}</Text>
        <View style={tw('flex-row gap-3 mb-4')}>
          {['text', 'file'].map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setJobInputType(type as any)}
              style={[
                tw('flex-1 py-3 rounded-xl border items-center flex-row justify-center gap-2'),
                { 
                  borderColor: jobInputType === type ? colors.primary : colors.cardBorder,
                  backgroundColor: jobInputType === type ? colors.primary + '15' : colors.background
                }
              ]}
            >
              <Ionicons name={type === 'text' ? 'create-outline' : 'document-text-outline'} size={18} color={jobInputType === type ? colors.primary : colors.textSecondary} />
              <Text style={{ color: jobInputType === type ? colors.primary : colors.textSecondary, fontWeight: '600', textTransform: 'capitalize' }}>
                {type === 'text' ? t('jobResume.step1.pasteText') : t('jobResume.step1.uploadFile')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {jobInputType === 'text' ? (
          <TextInput
            multiline
            style={[styles.textArea, { borderColor: colors.cardBorder, color: colors.textMain, backgroundColor: colors.background }]}
            placeholder={t('jobResume.step1.pastePlaceholder')}
            placeholderTextColor={colors.textSecondary}
            value={jobDescription}
            onChangeText={setJobDescription}
            scrollEnabled={false} 
          />
        ) : (
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => pickDocument('job')}
            style={[styles.previewBtn, { borderColor: colors.cardBorder, backgroundColor: colors.background }]}
          >
            <Ionicons name={jobFile ? "document-attach" : "cloud-upload-outline"} size={32} color={colors.primary} />
            <Text style={[styles.previewText, { color: colors.textSecondary, marginTop: 8 }]}>
              {jobFile ? jobFile.name : t('jobResume.step1.selectFile')}
            </Text>
          </TouchableOpacity>
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
  mainCard: { borderRadius: 20, padding: 20, borderWidth: 1, marginBottom: 15 },
  inputLabel: { fontSize: 13, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', opacity: 0.8 },
  inputField: { height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 15, fontSize: 16 },
  textArea: { height: 140, borderWidth: 1, borderRadius: 12, padding: 15, textAlignVertical: 'top', fontSize: 15, lineHeight: 22 },
  previewBtn: { width: '100%', height: 120, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  previewText: { fontSize: 14, fontWeight: '700' },
  adContainer: { marginVertical: 10, alignItems: 'center', width: '100%', overflow: 'hidden' },
});
