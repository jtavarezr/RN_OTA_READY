import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Dimensions, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTailwind } from '../../utils/tailwind';
import { useThemeColors } from '../../utils/themeColors';
import { useLearningStore } from '../../store/useLearningStore';
import { usePracticeStore } from '../../store/usePracticeStore';
import { useCourse } from '../../hooks/useEduQueries';

const { width } = Dimensions.get('window');

// Enhanced Text Component
const RNText = require('react-native').Text;
const Text = ({ children, style, category, ...props }: any) => {
    const tw = useTailwind();
    const colors = useThemeColors();
    const styles = category ? {
        h1: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
        h2: { fontSize: 24, fontWeight: '700', letterSpacing: -0.3 },
        h3: { fontSize: 20, fontWeight: '700' },
        h6: tw('text-lg font-semibold'),
        body: tw('text-base'),
        caption: { fontSize: 12, color: colors.textSecondary },
        label: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
    }[category as string] : {};
    return <RNText style={[{ color: colors.textMain }, styles, style]} {...props}>{children}</RNText>;
};

export const StudyHubScreen = () => {
    const navigation = useNavigation<any>();
    const { t } = useTranslation();
    const tw = useTailwind();
    const colors = useThemeColors();
    
    // Stats from Stores
    // Stats from Stores - simplified to avoid object reference loops
    // Store scalars directly
    const inProgress = useLearningStore(state => 
        Object.values(state.coursesProgress || {}).filter(p => p.progress > 0 && p.progress < 100).length
    );
    const completed = useLearningStore(state => 
        Object.values(state.coursesProgress || {}).filter(p => p.progress === 100).length
    );
    const streak = useLearningStore(state => state.streak || 0);
    const totalHours = useLearningStore(state => state.totalHours || 0);

    const practiceAverageScore = usePracticeStore(state => {
        const attempts = state.attempts || [];
        if (attempts.length === 0) return 0;
        const totalScore = attempts.reduce((acc, a) => acc + (a.score / a.totalQuestions), 0);
        return Math.round((totalScore / attempts.length) * 100);
    });
    const practiceTotalQuizzes = usePracticeStore(state => state.attempts?.length || 0);

    // Real "Resume Learning" logic
    const coursesProgress = useLearningStore(state => state.coursesProgress);
    
    // Find most recently accessed course ID
    const lastCourseId = React.useMemo(() => {
        const progresses = Object.values(coursesProgress || {});
        if (progresses.length === 0) return null;
        const last = progresses.reduce((prev, current) => 
            (prev.lastAccessed > current.lastAccessed) ? prev : current
        );
        return last?.courseId || null;
    }, [coursesProgress]);

    const { data: courseDetails } = useCourse(lastCourseId || '');
    const lastActivity = React.useMemo(() => {
        if (!courseDetails || !lastCourseId) return null;
        const progress = coursesProgress?.[lastCourseId]?.progress || 0;
        return {
            title: courseDetails.title,
            progress,
            type: 'course',
            thumbnail: courseDetails.thumbnail
        };
    }, [courseDetails, lastCourseId, coursesProgress]);


    const QuickStat = ({ icon, value, label, color }: any) => (
        <View style={[tw('flex-1 p-4 rounded-2xl mr-3'), { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder }]}>
            <View style={[tw('w-10 h-10 rounded-full justify-center items-center mb-3'), { backgroundColor: `${color}15` }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.textMain }}>{value}</Text>
            <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 4 }}>{label}</Text>
        </View>
    );

    return (
        <SafeAreaView style={[{ flex: 1, backgroundColor: colors.background }]} edges={['right', 'left']}>
            {/* HERO Header - FIXED */}
            <ImageBackground 
                source={{ uri: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop' }} 
                style={{ width: '100%', height: 260, position: 'absolute', top: 0, zIndex: 1 }}
                imageStyle={{ borderBottomLeftRadius: 32, borderBottomRightRadius: 32, opacity: 0.15 }}
            >
                <SafeAreaView edges={['top']} style={tw('px-6 pt-2')}>
                    <View style={tw('flex-row justify-between items-center mb-6')}>
                        <TouchableOpacity onPress={() => navigation.navigate('Main')} style={[tw('p-2 rounded-full'), { backgroundColor: `${colors.background}80` }]}>
                            <Ionicons name="arrow-back" size={24} color={colors.textMain} />
                        </TouchableOpacity>
                        <View style={[tw('flex-row items-center py-1.5 rounded-full border'), { paddingHorizontal: 12, borderColor: colors.cardBorder, backgroundColor: `${colors.card}90` }]}>
                            <Ionicons name="flame" size={16} color="#f59e0b" style={tw('mr-1.5')} />
                            <Text style={{ fontWeight: '700', fontSize: 13 }}>{streak} {t('eduHub.dayStreak', { defaultValue: 'Day Streak' })}</Text>
                        </View>
                    </View>

                    <Text category="label" style={{ color: colors.primary, marginBottom: 8 }}>{t('eduHub.learningHub', { defaultValue: 'Learning Hub' })}</Text>
                    <Text category="h1" style={{ marginBottom: 8 }}>{t('eduHub.expandPotential', { defaultValue: 'Expand Your Potential' })}</Text>
                </SafeAreaView>
            </ImageBackground>

            <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={{ paddingTop: 240, paddingBottom: 100 }}
            >
                {/* Quick Stats Row */}
                <View style={tw('px-6 -mt-8 flex-row mb-8')}>
                     <QuickStat icon="time-outline" value={`${Math.round(totalHours)}h`} label={t('eduHub.totalLearned', { defaultValue: 'Total Learned' })} color="#3b82f6" />
                     <QuickStat icon="trophy-outline" value={`${practiceAverageScore}%`} label={t('eduHub.avgScore', { defaultValue: 'Avg. Score' })} color="#f59e0b" />
                     <QuickStat icon="checkmark-circle-outline" value={completed} label={t('eduHub.certificates', { defaultValue: 'Certificates' })} color="#10b981" />
                </View>

                {/* Continue Learning */}
                {lastActivity && (
                    <View style={tw('px-6 mb-8')}>
                        <Text category="h3" style={tw('mb-4')}>{t('eduHub.resumeLearning', { defaultValue: 'Resume Learning' })}</Text>
                        <TouchableOpacity 
                            onPress={() => navigation.navigate('Courses')} 
                            style={[tw('p-4 rounded-2xl flex-row items-center border'), { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                        >
                            <View style={[tw('w-12 h-12 rounded-xl justify-center items-center mr-4'), { backgroundColor: '#3b82f620' }]}>
                                <Ionicons name="play" size={24} color="#3b82f6" />
                            </View>
                            <View style={tw('flex-1')}>
                                <Text style={tw('font-bold text-base mb-1')}>{lastActivity.title}</Text>
                                <View style={tw('flex-row items-center')}>
                                    <View style={[tw('h-1.5 flex-1 rounded-full mr-3'), { backgroundColor: colors.cardBorder }]}>
                                        <View style={{ width: `${lastActivity.progress}%`, height: '100%', backgroundColor: '#3b82f6', borderRadius: 99 }} />
                                    </View>
                                    <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary }}>{lastActivity.progress}%</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Main Sections */}
                <View style={tw('px-4')}>
                    <Text category="h3" style={tw('mb-4')}>{t('eduHub.explore', { defaultValue: 'Explore' })}</Text>

                    {/* Row */}
                    <View style={tw('flex-row')}>
                        
                        {/* Tutorials Card */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Courses')}
                            style={[
                                tw('flex-1 mr-2 rounded-3xl overflow-hidden border'),
                                { backgroundColor: colors.card, borderColor: colors.cardBorder }
                            ]}
                        >
                            <View style={tw('p-5')}>
                                <View style={tw('flex-row justify-between items-start mb-4')}>
                                    <View style={[tw('p-3 rounded-2xl'), { backgroundColor: '#8b5cf6' }]}>
                                        <Ionicons name="play-circle-outline" size={28} color="white" />
                                    </View>
                                </View>

                                <Text category="h3" style={tw('mb-2')}>
                                    {t('eduHub.courses')}
                                </Text>

                                <Text style={{ color: colors.textSecondary, marginBottom: 12 }}>
                                    {t('eduHub.guidedVideoContent', { defaultValue: 'Guided video content.' })}
                                </Text>

                                <View style={tw('flex-row items-center')}>
                                    <Text style={{ fontWeight: '700', color: '#8b5cf6', marginRight: 6 }}>
                                        {t('eduHub.browse', { defaultValue: 'Browse' })}
                                    </Text>
                                    <Ionicons name="arrow-forward" size={14} color="#8b5cf6" />
                                </View>
                            </View>
                        </TouchableOpacity>

                        {/* Practice Zone Card */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate('PracticeZone')}
                            style={[
                                tw('flex-1 ml-2 rounded-3xl overflow-hidden border'),
                                { backgroundColor: colors.card, borderColor: colors.cardBorder }
                            ]}
                        >
                            <View style={tw('p-5')}>
                                <View style={tw('flex-row justify-between items-start mb-4')}>
                                    <View style={[tw('p-3 rounded-2xl'), { backgroundColor: '#10b981' }]}>
                                        <Ionicons name="flask-outline" size={28} color="white" />
                                    </View>
                                </View>

                                <Text category="h3" style={tw('mb-2')}>
                                    {t('eduHub.practice')}
                                </Text>

                                <Text style={{ color: colors.textSecondary, marginBottom: 12 }}>
                                    {t('eduHub.interactiveQuizzes', { defaultValue: 'Interactive quizzes.' })}
                                </Text>

                                <View style={tw('flex-row items-center')}>
                                    <Text style={{ fontWeight: '700', color: '#10b981', marginRight: 6 }}>
                                        {t('eduHub.start', { defaultValue: 'Start' })}
                                    </Text>
                                    <Ionicons name="arrow-forward" size={14} color="#10b981" />
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};
