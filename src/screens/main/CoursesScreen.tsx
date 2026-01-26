import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Linking,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTailwind } from '../../utils/tailwind';
import { useThemeColors } from '../../utils/themeColors';
import { useLearningStore } from '../../store/useLearningStore';
import { useAuth } from '../../context/AuthContext';
import { eduService, Course } from '../../services/eduService';


const { width } = Dimensions.get('window');

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
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const tw = useTailwind();
  const colors = useThemeColors();
  const { user } = useAuth();
  const userId = (user as any)?.$id || (user as any)?.uid || (user as any)?.id;
  const { updateProgress, getCourseProgress } = useLearningStore();


  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    const data = await eduService.getCourses();
    setCourses(data);
    setLoading(false);
  };

  const handleOpenCourse = (course: Course) => {
    // Determine ID correctly (Appwrite uses $id)
    const id = course.$id || (course as any).id;
    const currentProgress = getCourseProgress(id);
    if (currentProgress < 100) {
      updateProgress(id, Math.min(100, currentProgress + 10), userId);
    }

    Linking.openURL(course.url).catch(err => console.error("Couldn't load page", err));
  };

  const renderCourseCard = (course: Course) => {
    const id = course.$id || (course as any).id;
    const progress = getCourseProgress(id);
    return (
      <TouchableOpacity
        key={id}
        onPress={() => handleOpenCourse(course)}
        style={[
          tw('rounded-2xl mb-4 overflow-hidden border'),
          { backgroundColor: colors.card, borderColor: colors.cardBorder },
        ]}
      >
        <Image
          source={{ uri: course.thumbnail || 'https://via.placeholder.com/300x150' }}
          style={{ width: '100%', height: 120, backgroundColor: colors.background }}
          resizeMode="cover"
        />
        <View style={tw('p-4')}>
          <View style={tw('flex-row justify-between items-start')}>
            <View style={tw('flex-1 pr-2')}>
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
              <Text style={{ fontSize: 10 }}>{t('education.progress')}</Text>
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

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(courses.map(c => c.category)))];

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={[tw('flex-row items-center px-4 py-3 border-b'), { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        <TouchableOpacity onPress={() => navigation.navigate('StudyHub')} style={tw('mr-3')}>
          <Ionicons name="arrow-back" size={24} color={colors.textMain} />
        </TouchableOpacity>
        <Text category="h6">{t('eduHub.courses')}</Text>
      </View>

      <View style={tw('px-4 py-4')}>
          {/* Search */}
          <View style={[tw('flex-row items-center rounded-xl px-3 py-2 border mb-4'), { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput 
                  placeholder={t('eduHub.searchCourses')}
                  placeholderTextColor={colors.textSecondary}
                  style={[tw('flex-1 ml-2'), { color: colors.textMain }]}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
              />
          </View>

          {/* Categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw('mb-4')}>
              {categories.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={[
                        tw('px-4 py-2 rounded-full mr-2 border'),
                        selectedCategory === cat 
                            ? { backgroundColor: colors.primary, borderColor: colors.primary } 
                            : { backgroundColor: colors.card, borderColor: colors.cardBorder }
                    ]}
                  >
                      <Text style={{ color: selectedCategory === cat ? '#fff' : colors.textMain, fontWeight: '600' }}>{cat}</Text>
                  </TouchableOpacity>
              ))}
          </ScrollView>
      </View>

      {loading ? (
           <View style={tw('flex-1 justify-center items-center')}>
               <ActivityIndicator size="large" color={colors.primary} />
           </View>
      ) : (
          <ScrollView style={tw('flex-1 px-4')} showsVerticalScrollIndicator={false}>
            {filteredCourses.length > 0 ? (
                filteredCourses.map(renderCourseCard)
            ) : (
                <Text appearance="hint" style={tw('text-center mt-10')}>No courses found.</Text>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
      )}
    </SafeAreaView>
  );
};
