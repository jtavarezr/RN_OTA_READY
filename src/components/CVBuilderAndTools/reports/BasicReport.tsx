import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../../utils/themeColors';
import { useTailwind } from '../../../utils/tailwind';

interface BasicReportProps {
  data: {
    score: number;
    verdict: string;
    summary: string;
    pros: string[];
    cons: string[];
  };
}

export const BasicReport: React.FC<BasicReportProps> = ({ data }) => {
  const colors = useThemeColors();
  const tw = useTailwind();

  return (
    <View style={tw('w-full')}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={tw('items-center mb-4')}>
            <View style={[styles.scoreCircle, { borderColor: data.score > 70 ? colors.success : colors.warning }]}>
                <Text style={[tw('text-4xl font-black'), { color: colors.textMain }]}>{data.score}%</Text>
            </View>
            <Text style={[tw('text-lg font-bold mt-2'), { color: colors.textMain }]}>{data.verdict}</Text>
        </View>
        <Text style={[tw('text-center text-sm mb-4 leading-5'), { color: colors.textSecondary }]}>
          {data.summary}
        </Text>
      </View>

      <View style={tw('flex-row gap-3')}>
        <View style={[styles.card, { flex: 1, backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[tw('font-bold text-sm mb-2 text-center'), { color: colors.success }]}>PROS</Text>
          {data.pros.map((item, index) => (
            <View key={index} style={tw('flex-row items-start mb-2')}>
               <Ionicons name="checkmark" size={14} color={colors.success} style={tw('mr-1 mt-0.5')} />
               <Text style={[tw('text-xs flex-1'), { color: colors.textMain }]}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, { flex: 1, backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[tw('font-bold text-sm mb-2 text-center'), { color: colors.error }]}>CONS</Text>
          {data.cons.map((item, index) => (
            <View key={index} style={tw('flex-row items-start mb-2')}>
               <Ionicons name="close" size={14} color={colors.error} style={tw('mr-1 mt-0.5')} />
               <Text style={[tw('text-xs flex-1'), { color: colors.textMain }]}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 12 },
  scoreCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 6, alignItems: 'center', justifyContent: 'center' }
});
