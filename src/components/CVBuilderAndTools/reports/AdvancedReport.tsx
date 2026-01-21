import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../../utils/themeColors';
import { useTailwind } from '../../../utils/tailwind';

interface AdvancedReportProps {
  data: {
    score: number;
    verdict: string;
    verdictDesc: string;
    summary: string;
    sections: Array<{
      title: string;
      score: number;
      items: Array<{ label: string; match: boolean; desc: string }>;
    }>;
    strengths: string[];
    improvements: string[];
  };
}

export const AdvancedReport: React.FC<AdvancedReportProps> = ({ data }) => {
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const tw = useTailwind();
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const handleToggleSpeech = async () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      Speech.speak(data.summary, {
        language: i18n.language || 'en',
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  return (
    <View style={tw('w-full')}>
      {/* OVERALL SCORE CARD */}
      <View style={[styles.reportCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={{ flexDirection: 'column' /* siempre vertical */ }}>
          
          {/* SCORE */}
          <View>
            <Text style={[tw('text-xs font-bold uppercase tracking-wider mb-1'), { color: colors.textSecondary }]}>
              {t('jobResume.analysisReport.matchScore')}
            </Text>
            
            <View style={tw('flex-row justify-between items-center')}>
              <Text style={[tw('text-5xl font-black'), { color: colors.primary }]}>
                <Text style={{ fontSize: 50 }}>{data.score}%</Text>
              </Text>

              <TouchableOpacity onPress={handleToggleSpeech} activeOpacity={0.7}>
                <Ionicons 
                  name={isSpeaking ? "stop-circle" : "volume-high"} 
                  size={42} 
                  color={colors.primary} 
                />
              </TouchableOpacity>
            </View>

            <View style={[tw('mt-2 px-3 py-1 rounded-lg self-start'), { backgroundColor: data.score > 80 ? colors.success + '20' : colors.warning + '20' }]}>
              <Text style={{ color: data.score > 80 ? colors.success : colors.warning, fontWeight: '700', fontSize: 12 }}>
                {data.verdict.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* SPACING */}
          <View style={{ height: 20 }} />

          {/* EXECUTIVE SUMMARY */}
          <View>
            <Text style={[tw('text-xs font-bold uppercase tracking-wider mb-1'), { color: colors.textSecondary }]}>
              {t('jobResume.analysisReport.executiveSummary')}
            </Text>
            <Text style={[tw('text-sm leading-5'), { color: colors.textMain }]}>
              {data.summary}
            </Text>
          </View>

        </View>
      </View>


      {/* SECTIONS */}
      {data.sections.map((section, idx) => (
        <View key={idx} style={[styles.reportCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, padding: 0 }]}>
          <View style={[tw('flex-row justify-between items-center p-4 border-b'), { borderBottomColor: colors.cardBorder }]}>
            <Text style={[tw('text-base font-bold'), { color: colors.textMain }]}>{section.title}</Text>
            <Text style={[tw('font-black'), { color: colors.primary }]}>{t('jobResume.analysisReport.scoreOutOf100', { score: section.score })}</Text>
          </View>

          <View style={tw('p-4')}>
            {section.items.map((item, i) => (
                <View key={i} style={tw('flex-row items-start mb-4')}>
                <Ionicons 
                    name={item.match ? "checkmark-circle" : "alert-circle"} 
                    size={20} 
                    color={item.match ? colors.success : colors.warning} 
                    style={tw('mt-0.5 mr-3')}
                />
                <View style={tw('flex-1')}>
                    <Text style={[tw('font-semibold text-sm'), { color: colors.textMain }]}>{item.label}</Text>
                    <Text style={[tw('text-xs mt-0.5 leading-4'), { color: colors.textSecondary }]}>{item.desc}</Text>
                </View>
                </View>
            ))}
          </View>
        </View>
      ))}

      {/* STRENGTHS & IMPROVEMENTS */}
      <View style={tw('flex-row gap-3')}>
        <View style={[styles.reportCard, { flex: 1, backgroundColor: colors.card, borderColor: colors.cardBorder, padding: 15 }]}>
          <View style={tw('flex-row items-center mb-3')}>
            <Ionicons name="trending-up" size={16} color={colors.success} style={tw('mr-2')} />
            <Text style={[tw('font-bold text-sm'), { color: colors.textMain }]}>{t('jobResume.analysisReport.strengths')}</Text>
          </View>
          {data.strengths.map((s, i) => (
            <Text key={i} style={[tw('text-xs mb-2 leading-4'), { color: colors.textSecondary }]}>• {s}</Text>
          ))}
        </View>
        <View style={[styles.reportCard, { flex: 1, backgroundColor: colors.card, borderColor: colors.cardBorder, padding: 15 }]}>
           <View style={tw('flex-row items-center mb-3')}>
            <Ionicons name="build" size={16} color={colors.warning} style={tw('mr-2')} />
            <Text style={[tw('font-bold text-sm'), { color: colors.textMain }]}>{t('jobResume.analysisReport.toImprove')}</Text>
          </View>
          {data.improvements.map((s, i) => (
            <Text key={i} style={[tw('text-xs mb-2 leading-4'), { color: colors.textSecondary }]}>• {s}</Text>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  reportCard: { borderRadius: 20, padding: 20, borderWidth: 1, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: {width: 0, height: 4} },
});
