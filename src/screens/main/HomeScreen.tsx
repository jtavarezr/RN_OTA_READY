import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Text as RNText,
  ViewProps,
  TextProps as RNTextProps,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useTailwind } from '../../utils/tailwind';
import Svg, { Circle, Path } from 'react-native-svg';
import { AdBanner } from '../../components/ads/AdBanner';
import { NativeAd } from '../../components/ads/NativeAd';
import { NativeAdSmall } from '../../components/ads/NativeAdSmall';
import { BannerAdSize } from 'react-native-google-mobile-ads';
import { useTranslation } from 'react-i18next';

import { useWalletBalance, useWalletPrices } from '../../hooks/useWalletQueries';
import { useWalletMutations } from '../../hooks/useWalletMutations';
import { useAuth } from '../../context/AuthContext';
import { useSync } from '../../context/SyncContext';


import { useRewardedAd } from '../../components/ads/useRewardedAd';
import { useThemeColors, ThemeColors } from '../../utils/themeColors';
import { useLearningStore } from '../../store/useLearningStore';
import { useProfile } from '../../hooks/useProfileQueries';
import { usePracticeStore } from '../../store/usePracticeStore';



const { width } = Dimensions.get('window');

// ─── Interfaces ──────────────────────────────────────────────────────────────

type IconName = keyof typeof Ionicons.glyphMap;



const shadow = {
  card: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 4, elevation: 3 },
  metric: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
};

// ─── Component Props Interfaces ──────────────────────────────────────────────

interface CustomTextProps extends RNTextProps {
  children: React.ReactNode;
  category?: 'h5' | 'h6' | 's1' | 's2' | 'p1' | 'label';
  appearance?: 'hint' | 'default';
  colors?: ThemeColors;
}

interface CardProps extends ViewProps {
  children: React.ReactNode;
  colors?: ThemeColors;
}

interface CircularProgressProps {
  percent: number;
  size?: number;
  color?: string;
}

interface ChartProps {
  data: number[];
  height?: number;
  color?: string;
}

// ─── Data Interfaces ─────────────────────────────────────────────────────────

interface OverviewData {
  profile: number;
  apps: number;
  interviews: number;
  matches: number;
}

interface CareerData {
  active: number;
  interviews: number;
  offers: number;
  rate: number;
  weekly: number[];
}

interface LearningData {
  inProgress: number;
  completed: number;
  hours: number;
  streak: number;
  progress: number[];
}

interface CommunityData {
  posts: number;
  helpful: number;
  followers: number;
  rep: number;
  activity: number[];
}

type TabType = 'overview' | 'career' | 'learning' | 'community';

// ─── Components ──────────────────────────────────────────────────────────────

const Text = ({ children, category, appearance, colors, style, ...props }: CustomTextProps) => {
  const tw = useTailwind();
  const styles = category ? {
    h5: tw('text-xl font-bold'),
    h6: tw('text-lg font-semibold'),
    s1: tw('text-base font-semibold'),
    s2: tw('text-sm font-medium'),
    p1: tw('text-sm'),
    label: { fontSize: 11, fontWeight: '600', letterSpacing: 1.2 },
  }[category] : {};

  const defaultColors = useThemeColors();
  const finalColors = colors || defaultColors;

  return (
    <RNText
      style={[
        { color: finalColors.textMain },
        appearance === 'hint' && { color: finalColors.textSecondary },
        styles,
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

const Card = ({ children, style, colors, ...props }: CardProps) => {
  const tw = useTailwind();
  const defaultColors = useThemeColors();
  const finalColors = colors || defaultColors;

  return (
    <View
      style={[
        tw('rounded-2xl p-4 mb-4'),
        shadow.card,
        { backgroundColor: finalColors.card, borderWidth: 1, borderColor: finalColors.cardBorder },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const colors = useThemeColors();
  const tw = useTailwind();
  
  const { user } = useAuth();
  const userId = (user as any)?.$id || (user as any)?.uid || (user as any)?.id;
  const { isOnline, isServerReachable, pendingCount } = useSync();


  const { data: walletData } = useWalletBalance(userId);



  const balance = walletData?.balance || 0;
  
  const { earnCredits } = useWalletMutations();
  const { data: prices } = useWalletPrices();
  
  const learningStore = useLearningStore();

  
  // Ad Integration
  const { loaded, showRewarded, reward } = useRewardedAd();

  const [lastProcessedReward, setLastProcessedReward] = useState<any>(null);

  useEffect(() => {
    if (reward) {
        const rewardKey = JSON.stringify(reward);
        if (rewardKey !== lastProcessedReward) {
            setLastProcessedReward(rewardKey);
            earnCredits({ userId, adToken: 'VALID_AD_TOKEN' });
            alert('Reward Earned! +1 Credit');
        }
    }
  }, [reward, lastProcessedReward, userId, earnCredits]);


   const { data: profile } = useProfile(userId);
  const practiceStore = usePracticeStore();
  const practiceStats = practiceStore.getStats();


  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const dataMap: Record<TabType, OverviewData | CareerData | LearningData | CommunityData> = {
    overview: { 
      profile: profile ? 100 : 25, // Mocked logic: if exists 100, else 25
      apps: 12, 
      interviews: 3, 
      matches: 8 
    },

    career: { active: 12, interviews: 24, offers: 3, rate: 68, weekly: [65,72,68,80,75,85,68] },
    learning: { 
      inProgress: learningStore.getStats().inProgress, 
      completed: learningStore.getStats().completed, 
      hours: learningStore.getStats().totalHours, 
      streak: learningStore.getStats().streak, 
      progress: learningStore.getOverallProgress() 
    },
    community: { posts: 24, helpful: 56, followers: 128, rep: 892, activity: [5,8,6,12,9,15,24] },
  };


  const data = dataMap[activeTab];

  const tabs: { id: TabType; label: string; icon: IconName }[] = [
    { id: 'overview', label: t('home.overview'), icon: 'apps-outline' },
    { id: 'career',   label: t('home.career'),   icon: 'briefcase-outline' },
    { id: 'learning', label: t('home.learning'), icon: 'school-outline' },
    { id: 'community', label: t('home.community'), icon: 'people-outline' },
  ];

  // Mini gráficos ─────────────────────────────────────────────────────────────
  const CircularProgress = ({ percent, size = 64, color = colors.primary }: CircularProgressProps) => {
    const r = (size - 8) / 2;
    const c = r * 2 * Math.PI;
    return (
      <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
          <Circle cx={size/2} cy={size/2} r={r} stroke={colors.cardBorder} strokeWidth={8} fill="none" />
          <Circle
            cx={size/2} cy={size/2} r={r}
            stroke={color} strokeWidth={8} fill="none"
            strokeDasharray={c} strokeDashoffset={c - (percent / 100) * c}
            strokeLinecap="round"
          />
        </Svg>
        <Text category="s1" colors={colors} style={{ fontSize: 15, fontWeight: '700' }}>{percent}%</Text>
      </View>
    );
  };

  const MiniBar = ({ data, height = 56, color = colors.primary }: ChartProps) => {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data) || 1;
    const w = (width - 88) / data.length - 5;
    return (
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height, gap: 5 }}>
        {data.map((v, i) => (
          <View
            key={i}
            style={{
              width: w,
              height: (v / max) * height,
              backgroundColor: color,
              borderRadius: 4,
              opacity: 0.65 + (v / max) * 0.35,
            }}
          />
        ))}
      </View>
    );
  };

  const MiniLine = ({ data, height = 56, color = colors.success }: ChartProps) => {
    if (!data || data.length === 0) return null;

    const max = Math.max(...data) || 1;
    const w = width - 88;
    const step = data.length > 1 ? w / (data.length - 1) : 0;
    const points = data.map((v, i) => `${i * step},${height - (v / max) * height}`).join(' ');

    return (
      <Svg width={w} height={height}>
        {data.length > 1 && (
          <Path d={`M ${points}`} stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        )}
        {data.map((v, i) => (
          <Circle key={i} cx={i * step} cy={height - (v / max) * height} r={3.5} fill={color} />
        ))}
      </Svg>
    );
  };

  // Tarjetas por tab ──────────────────────────────────────────────────────────
  
  const renderOverview = () => {
    const d = data as OverviewData;
    return (
      <Card colors={colors}>
        <View style={tw('flex-row justify-between items-center mb-5')}>
          <View>
            <Text category="s1" colors={colors}>{t('home.generalSummary')}</Text>
            <Text appearance="hint" colors={colors} style={tw('text-xs mt-1')}>{t('home.todayProgress')}</Text>
          </View>
          
          {/* Connectivity & Wallet Widget */}
          <View style={tw('flex-row items-center')}>
              <View style={[tw('flex-row items-center px-2 py-1.5 rounded-full border mr-2'), { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
                  <Ionicons 
                    name={isServerReachable ? "cloud-done" : "cloud-offline"} 
                    size={16} 
                    color={isServerReachable ? colors.success : colors.error} 
                    style={tw('mr-1')} 
                  />
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: isServerReachable ? colors.success : colors.error }}>
                      {isServerReachable ? 'LIVE' : 'OFFLINE'}
                  </Text>


                  {pendingCount > 0 && (
                      <View style={tw('ml-1.5 flex-row items-center border-l pl-1.5 border-gray-300')}>
                          <Ionicons name="sync" size={12} color={colors.primary} />
                          <Text style={{ fontSize: 10, fontWeight: '600', marginLeft: 2, color: colors.primary }}>{pendingCount}</Text>
                      </View>
                  )}
              </View>

          </View>

          <CircularProgress percent={d.profile} />

        </View>
        <View style={[tw('flex-row justify-around pt-4 border-t'), { borderTopColor: colors.cardBorder }]}>
          {[
            { value: d.apps, label: t('home.applications'), color: colors.warning },
            { value: practiceStats.totalQuizzes, label: t('home.interviews'), color: colors.success }, // Using quiz count as mock interview count
            { value: d.matches, label: t('home.matches'), color: colors.primary },

          ].map(({ value, label, color }, i) => (
            <View key={i} style={tw('items-center')}>
              <Text category="h6" colors={colors} style={{ color }}>{value}</Text>
              <Text appearance="hint" colors={colors} style={[tw('mt-1'), { fontSize: 10 }]}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={[tw('flex-row items-center px-3 py-1.5 rounded-full border'), { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
          <Ionicons name="wallet-outline" size={16} color={colors.primary} style={tw('mr-2')} />
          <Text category="s2" colors={colors}>{t('home.credits', { count: balance })}</Text>
        </View>
      </Card>
    );
  };

  const renderCareer = () => {
    const d = data as CareerData;
    return (
      <Card colors={colors}>
        <View style={tw('flex-row justify-between mb-4')}>
          <View>
            <Text category="s1" colors={colors}>{t('home.careerActivity')}</Text>
            <Text appearance="hint" colors={colors} style={tw('text-xs mt-1')}>{t('home.last7Days')}</Text>
          </View>
          <View style={tw('items-end')}>
            <Text category="h5" colors={colors} style={{ color: colors.primary }}>{d.rate}%</Text>
            <Text appearance="hint" colors={colors} style={tw('text-xs')}>{t('home.response')}</Text>
          </View>
        </View>
        <MiniBar data={d.weekly} color={colors.primary} />
        <View style={[tw('flex-row justify-around pt-4 mt-2 border-t'), { borderTopColor: colors.cardBorder }]}>
          {[
            { value: d.active, label: t('home.active'), color: colors.warning },
            { value: d.interviews, label: t('home.interviews'), color: colors.success },
            { value: d.offers, label: t('home.offers'), color: colors.primary },
          ].map(({ value, label, color }, i) => (
            <View key={i} style={tw('items-center')}>
              <Text category="h6" colors={colors} style={{ color }}>{value}</Text>
              <Text appearance="hint" colors={colors} style={[tw('mt-1'), { fontSize: 10 }]}>{label}</Text>
            </View>
          ))}
        </View>
      </Card>
    );
  };

  const renderLearning = () => {
    const stats = learningStore.getStats();
    const progressData = learningStore.getOverallProgress();

    return (
      <Card colors={colors}>
        <View style={tw('flex-row justify-between mb-4')}>
          <View>
            <Text category="s1" colors={colors}>{t('home.learningProgress')}</Text>
            <View style={tw('flex-row items-center mt-1')}>
              <Ionicons name="flame" size={14} color={colors.warning} />
              <Text colors={colors} style={tw('ml-1.5 text-xs font-semibold text-yellow-500')}>
                {t('home.streak', { count: stats.streak })}
              </Text>
            </View>
          </View>
          <View style={tw('items-end')}>
            <Text category="h5" colors={colors} style={{ color: colors.success }}>{stats.totalHours}h</Text>
            <Text appearance="hint" colors={colors} style={tw('text-xs')}>{t('home.total')}</Text>
          </View>
        </View>
        <MiniLine data={progressData} color={colors.success} />
        <Text appearance="hint" colors={colors} style={tw('text-xs mt-2 text-center')}>
          {t('home.last5Courses')}
        </Text>
        <View style={[tw('flex-row justify-around pt-4 mt-3 border-t'), { borderTopColor: colors.cardBorder }]}>
          {[
            { value: stats.inProgress, label: t('home.inProgress'), color: '#8b5cf6' },
            { value: stats.completed, label: t('home.completed'), color: colors.success },
          ].map(({ value, label, color }, i) => (
            <View key={i} style={tw('items-center')}>
              <Text category="h6" colors={colors} style={{ color }}>{value}</Text>
              <Text appearance="hint" colors={colors} style={[tw('mt-1'), { fontSize: 10 }]}>{label}</Text>
            </View>
          ))}
        </View>
      </Card>
    );
  };

  const renderCommunity = () => {
    const d = data as CommunityData;
    return (
      <Card colors={colors}>
        <View style={tw('flex-row justify-between mb-4')}>
          <View>
            <Text category="s1" colors={colors}>{t('home.communityActivity')}</Text>
            <Text appearance="hint" colors={colors} style={tw('text-xs mt-1')}>{t('home.lastWeek')}</Text>
          </View>
          <View style={tw('items-end')}>
            <Text category="h5" colors={colors} style={{ color: colors.reputation }}>{d.rep}</Text>
            <Text appearance="hint" colors={colors} style={tw('text-xs')}>{t('home.reputation')}</Text>
          </View>
        </View>
        <MiniBar data={d.activity} color={colors.reputation} />
        <View style={[tw('flex-row justify-around pt-4 mt-2 border-t'), { borderTopColor: colors.cardBorder }]}>
          {[
            { value: d.posts, label: t('home.posts'), color: colors.reputation },
            { value: d.helpful, label: t('home.helpful'), color: colors.success },
            { value: d.followers, label: t('home.followers'), color: colors.primary },
          ].map(({ value, label, color }, i) => (
            <View key={i} style={tw('items-center')}>
              <Text category="h6" colors={colors} style={{ color }}>{value}</Text>
              <Text appearance="hint" colors={colors} style={[tw('mt-1'), { fontSize: 10 }]}>{label}</Text>
            </View>
          ))}
        </View>
      </Card>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'career': return renderCareer();
      case 'learning': return renderLearning();
      case 'community': return renderCommunity();
      default: return null;
    }
  };

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: colors.background }, tw('flex-1')]} edges={['left', 'right']}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Tabs */}
      <View style={[tw('border-b'), { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        <View style={tw('flex-row')}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[
                tw('flex-1 flex-row items-center justify-center py-3'),
                activeTab === tab.id && { borderBottomWidth: 2.5, borderBottomColor: colors.primary },
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon}
                size={18}
                color={activeTab === tab.id ? colors.primary : colors.textSecondary}
                style={tw('mr-1.5')}
              />
              <Text
                style={[
                  tw('text-xs font-medium'),
                  { color: activeTab === tab.id ? colors.primary : colors.textSecondary },
                  activeTab === tab.id && tw('font-semibold'),
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={tw('flex-1 px-4 pt-4')} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {renderContent()}

        {/* Featured Ad */}
        <View style={tw('mb-4')}>
          <Text category="label" appearance="hint" colors={colors} style={tw('mb-2')}>{t('home.sponsored')}</Text>
          <NativeAd />
          
          {/* TEST REWARD BUTTON */}
          <TouchableOpacity 
            onPress={() => {
                if (loaded) {
                    showRewarded();
                } else {
                    alert(t('home.adNotLoaded'));
                }
            }}
            style={[
                tw('mt-4 py-3 rounded-xl items-center justify-center border'), 
                { 
                    backgroundColor: loaded ? colors.primary : colors.card,
                    borderColor: loaded ? colors.primary : colors.cardBorder
                }
            ]}
          >
             <View style={tw('flex-row items-center')}>
                <Ionicons name={loaded ? "play-circle" : "time-outline"} size={20} color={loaded ? "white" : colors.textSecondary} style={tw('mr-2')} />
                <Text category="s1" style={{ color: loaded ? 'white' : colors.textSecondary }}>
                    {loaded ? t('home.getPoints') : t('home.loadingAd')}
                </Text>
             </View>
          </TouchableOpacity>
        </View>

        {/* Quick Access */}
        <View style={tw('mb-6')}>
          <Text category="label" appearance="hint" colors={colors} style={tw('mb-3')}>{t('home.quickAccess')}</Text>
          <View style={tw('flex-row flex-wrap justify-between')}>
            {[
              { icon: 'sparkles-outline', title: t('home.sofia'), sub: t('home.sofiaSub'), color: '#6366f1', bg: 'rgba(99,102,241,0.15)', screen: 'CareerCoach' },
              { icon: 'document-attach-outline', title: t('home.compatibility'), sub: t('home.compatibilitySub'), color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', screen: 'JobResumeCompatibility' },
              { icon: 'mic-outline', title: t('voiceRecorder.title'), sub: t('voiceRecorder.ready'), color: '#ef4444', bg: 'rgba(239,68,68,0.15)', screen: 'VoiceRecorder' },
              { icon: 'volume-high-outline', title: t('textReader.title'), sub: t('textReader.voiceConfig'), color: '#137fec', bg: 'rgba(19,127,236,0.15)', screen: 'TextReader' },
              { icon: 'briefcase-outline', title: t('home.jobBoard'), sub: t('home.jobBoardSub'), color: '#10b981', bg: 'rgba(16,185,129,0.15)', screen: 'JobBoard' },
              { icon: 'school-outline', title: t('home.courses'), sub: t('home.coursesSub'), color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', screen: 'StudyHub' },
            ].map((m, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => m.screen && navigation.navigate(m.screen)}
                style={[
                  tw('rounded-2xl p-4 items-center mb-4'),
                  shadow.metric,
                  { width: (width - 48) / 2, backgroundColor: colors.card },
                ]}
              >
                <View style={[tw('w-12 h-12 rounded-full justify-center items-center'), { backgroundColor: m.bg }]}>
                  <Ionicons name={m.icon as IconName} size={24} color={m.color} />
                </View>
                <Text category="s2" colors={colors} style={tw('mt-2')}>{m.title}</Text>
                <Text appearance="hint" colors={colors} style={{ fontSize: 11, marginTop: 2 }}>{m.sub}</Text>
              </TouchableOpacity>
            ))}
            
            {/* Native Ads Small */}
            {/* <NativeAdSmall style={{ width: (width - 48) / 2 }} />
            <NativeAdSmall style={{ width: (width - 48) / 2 }} /> */}
            {/*
            {[
              { icon: 'chatbubbles-outline', title: t('home.forum'), sub: t('home.forumSub'), color: '#ec4899', bg: 'rgba(236,72,153,0.15)' },
              { icon: 'flash-outline', title: t('home.flashcards'), sub: t('home.flashcardsSub'), color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
              { icon: 'mic-outline', title: t('voiceRecorder.title'), sub: t('home.recordPracticeSub'), color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', screen: 'VoiceRecorder' },
            ].map((m, i) => (
              <TouchableOpacity
                key={`second-${i}`}
                onPress={() => m.screen && navigation.navigate(m.screen)}
                style={[
                  tw('rounded-2xl p-4 items-center mb-4'),
                  shadow.metric,
                  { width: (width - 48) / 2, backgroundColor: colors.card },
                ]}
              >
                <View style={[tw('w-12 h-12 rounded-full justify-center items-center'), { backgroundColor: m.bg }]}>
                  <Ionicons name={m.icon as IconName} size={24} color={m.color} />
                </View>
                <Text category="s2" colors={colors} style={tw('mt-2')}>{m.title}</Text>
                <Text appearance="hint" colors={colors} style={{ fontSize: 11, marginTop: 2 }}>{m.sub}</Text>
              </TouchableOpacity>
            ))}
            */}
          </View>
        </View>

        {/* Recommended Course Featured Ad */}
        <View style={tw('mb-4')}>
          <Text category="label" appearance="hint" colors={colors} style={tw('mb-2')}>{t('home.sponsored')}</Text>
          <NativeAd />
        </View>
        {/* Recent Activity */}
        {/*<View style={tw('mb-6')}>
          <Text category="label" appearance="hint" colors={colors} style={tw('mb-3')}>{t('home.recentActivity')}</Text>
          {[
            { icon: 'checkmark-circle', color: colors.success, title: t('home.appSent'), sub: t('home.softwareEngineer'), time: t('home.time2h') },
            { icon: 'chatbubble', color: colors.primary, title: t('home.newMessage'), sub: t('home.mariaComment'), time: t('home.time4h') },
            { icon: 'trophy', color: colors.warning, title: t('home.achievementUnlocked'), sub: t('home.completed10Interviews'), time: t('home.time1d') },
          ].map((act, i) => (
            <View
              key={i}
              style={[
                tw('flex-row items-center rounded-xl p-3 mb-3'),
                shadow.metric,
                { backgroundColor: colors.card },
              ]}
            >
              <View style={[tw('w-10 h-10 rounded-full justify-center items-center'), { backgroundColor: `${act.color}20` }]}>
                <Ionicons name={act.icon as IconName} size={20} color={act.color} />
              </View>
              <View style={tw('flex-1 ml-3')}>
                <Text category="s2" colors={colors}>{act.title}</Text>
                <Text appearance="hint" colors={colors} style={tw('text-xs mt-0.5')}>{act.sub}</Text>
              </View>
              <Text appearance="hint" colors={colors} style={tw('text-[11px]')}>{act.time}</Text>
            </View>
          ))}
        </View>/*}

        {/* Sidebar Ads */}
        {/*<View style={tw('mb-8 items-center')}>
          <Text category="label" appearance="hint" colors={colors} style={tw('mb-3 self-start')}>RECURSOS RECOMENDADOS</Text>
          <View style={tw('gap-4')}>
             <AdBanner size={BannerAdSize.MEDIUM_RECTANGLE} />
             <AdBanner size={BannerAdSize.MEDIUM_RECTANGLE} />
          </View>
        </View> */}
      </ScrollView>

      {/* Fixed Bottom Banner */}
      <View style={[tw('items-center border-t'), { backgroundColor: colors.card, borderTopColor: colors.cardBorder }]}>
        <AdBanner size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
      </View>
    </SafeAreaView>
  );
};
