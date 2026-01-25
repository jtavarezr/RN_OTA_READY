import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTailwind } from '../../utils/tailwind';
import { useThemeColors } from '../../utils/themeColors';
import { useLearningStore, Course } from '../../store/useLearningStore';

const { width } = Dimensions.get('window');

// --- Mock Data ---
const CATEGORIES = ['Development', 'Design', 'Business', 'Soft Skills'];

const COURSES: Course[] = [
  {
    id: '1',
    title: 'CS50: Introduction to Computer Science',
    provider: 'Harvard / edX',
    category: 'Development',
    url: 'https://www.edx.org/course/introduction-computer-science-harvardx-cs50x',
    thumbnail: 'https://img-c.udemycdn.com/course/480x270/1565838_e54e_16.jpg',
  },
  {
    id: '2',
    title: 'Google UX Design Professional Certificate',
    provider: 'Google / Coursera',
    category: 'Design',
    url: 'https://www.coursera.org/professional-certificates/google-ux-design',
    thumbnail: 'https://img-c.udemycdn.com/course/480x270/1231298_ad38_11.jpg',
  },
  {
    id: '3',
    title: 'Financial Markets',
    provider: 'Yale / Coursera',
    category: 'Business',
    url: 'https://www.coursera.org/learn/financial-markets-global',
    thumbnail: 'https://img-c.udemycdn.com/course/480x270/1362070_b9a1_2.jpg',
  },
  {
    id: '4',
    title: 'The Science of Well-Being',
    provider: 'Yale / Coursera',
    category: 'Soft Skills',
    url: 'https://www.coursera.org/learn/the-science-of-well-being',
    thumbnail: 'https://img-c.udemycdn.com/course/480x270/2405628_776d.jpg',
  },
  {
    id: '5',
    title: 'Full Stack Open',
    provider: 'University of Helsinki',
    category: 'Development',
    url: 'https://fullstackopen.com/en/',
    thumbnail: 'https://img-c.udemycdn.com/course/480x270/1646980_23f7_2.jpg',
  },
];

// --- Sub-components ---
const RNText = require('react-native').Text;

const Text = ({ children, category, appearance, style, ...props }: any) => {
  const tw = useTailwind();
  const colors = useThemeColors();
  const styles = category ? {
    h5: tw('text-xl font-bold'),
    h6: tw('text-lg font-semibold'),
    s1: tw('text-base font-semibold'),
    s2: tw('text-sm font-medium'),
    p1: tw('text-sm'),
    label: { fontSize: 11, fontWeight: '600', letterSpacing: 1.2 },
  }[category as 'h5'|'h6'|'s1'|'s2'|'p1'|'label'] : {};

  return (
    <RNText
      style={[
        { color: colors.textMain },
        appearance === 'hint' && { color: colors.textSecondary },
        styles,
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

export const CoursesScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const tw = useTailwind();
  const colors = useThemeColors();
  const { updateProgress, getCourseProgress } = useLearningStore();

  const handleOpenCourse = (course: Course) => {
    // Simulate progress when opening
    const currentProgress = getCourseProgress(course.id);
    if (currentProgress < 100) {
      updateProgress(course.id, Math.min(100, currentProgress + 10));
    }
    Linking.openURL(course.url).catch(err => console.error("Couldn't load page", err));
  };

  const renderCourseCard = (course: Course) => {
    const progress = getCourseProgress(course.id);
    return (
      <TouchableOpacity
        key={course.id}
        onPress={() => handleOpenCourse(course)}
        style={[
          tw('rounded-2xl mb-4 overflow-hidden border'),
          { backgroundColor: colors.card, borderColor: colors.cardBorder },
        ]}
      >
        <Image
          source={{ uri: course.thumbnail }}
          style={{ width: '100%', height: 120, backgroundColor: colors.background }}
          resizeMode="cover"
        />
        <View style={tw('p-4')}>
          <View style={tw('flex-row justify-between items-start')}>
            <View style={tw('flex-1')}>
              <Text category="s1">{course.title}</Text>
              <Text appearance="hint" style={tw('text-xs mt-1')}>{course.provider}</Text>
            </View>
            <View style={[tw('px-2 py-1 rounded-md'), { backgroundColor: `${colors.primary}20` }]}>
              <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '700' }}>{course.category}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={tw('mt-4')}>
            <View style={tw('flex-row justify-between items-center mb-1')}>
              <Text style={{ fontSize: 10 }}>Progress</Text>
              <Text style={{ fontSize: 10, fontWeight: '700' }}>{progress}%</Text>
            </View>
            <View style={[tw('h-1.5 rounded-full w-full'), { backgroundColor: colors.cardBorder }]}>
              <View 
                style={[
                  tw('h-full rounded-full'), 
                  { backgroundColor: colors.primary, width: `${progress}%` }
                ]} 
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: colors.background }]} edges={['left', 'right']}>
      <View style={[tw('flex-row items-center px-4 py-3 border-b'), { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={tw('mr-3')}>
          <Ionicons name="arrow-back" size={24} color={colors.textMain} />
        </TouchableOpacity>
        <Text category="h6">{t('home.courses')}</Text>
      </View>

      <ScrollView style={tw('flex-1 px-4 pt-4')} showsVerticalScrollIndicator={false}>
        {CATEGORIES.map(category => {
          const categoryCourses = COURSES.filter(c => c.category === category);
          if (categoryCourses.length === 0) return null;

          return (
            <View key={category} style={tw('mb-6')}>
              <Text category="label" appearance="hint" style={tw('mb-3 uppercase')}>{category}</Text>
              {categoryCourses.map(renderCourseCard)}
            </View>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};
