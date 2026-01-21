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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useTailwind } from '../../utils/tailwind';
import Svg, { Circle, Path } from 'react-native-svg';
import { AdBanner } from '../../components/ads/AdBanner';
import { NativeAd } from '../../components/ads/NativeAd';
import { NativeAdSmall } from '../../components/ads/NativeAdSmall';
import { BannerAdSize } from 'react-native-google-mobile-ads';

import { useWallet } from '../../context/WalletContext';
import { useRewardedAd } from '../../components/ads/useRewardedAd';
import { useThemeColors, ThemeColors } from '../../utils/themeColors';

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
  const { theme } = useTheme();
  const colors = useThemeColors();
  const tw = useTailwind();
  const { balance, earnCredits } = useWallet(); // Wallet integration
  
  // Ad Integration
  const { loaded, showRewarded, reward } = useRewardedAd();

  useEffect(() => {
    if (reward) {
        // In a real app, you'd use the server-side callback, but here we can trigger it manually for testing
        // or rely on the hook if it returned a signature. 
        // For this demo, we assume the hook's reward event is trusted enough to trigger our backend "earn"
        // Note: The WalletProvider's earnCredits uses a mock token currently.
        earnCredits('VALID_AD_TOKEN');
        alert('Reward Earned! +1 Credit');
    }
  }, [reward]);

  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const dataMap: Record<TabType, OverviewData | CareerData | LearningData | CommunityData> = {
    overview: { profile: 85, apps: 12, interviews: 3, matches: 8 },
    career: { active: 12, interviews: 24, offers: 3, rate: 68, weekly: [65,72,68,80,75,85,68] },
    learning: { inProgress: 4, completed: 12, hours: 127, streak: 14, progress: [30,45,60,75,85] },
    community: { posts: 24, helpful: 56, followers: 128, rep: 892, activity: [5,8,6,12,9,15,24] },
  };

  const data = dataMap[activeTab];

  const tabs: { id: TabType; label: string; icon: IconName }[] = [
    { id: 'overview', label: 'Overview', icon: 'apps-outline' },
    { id: 'career',   label: 'Carrera',   icon: 'briefcase-outline' },
    { id: 'learning', label: 'Aprendizaje', icon: 'school-outline' },
    { id: 'community', label: 'Comunidad', icon: 'people-outline' },
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
    const max = Math.max(...data);
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
    const max = Math.max(...data);
    const w = width - 88;
    const step = w / (data.length - 1);
    const points = data.map((v, i) => `${i * step},${height - (v / max) * height}`).join(' ');
    return (
      <Svg width={w} height={height}>
        <Path d={`M ${points}`} stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" />
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
            <Text category="s1" colors={colors}>Resumen General</Text>
            <Text appearance="hint" colors={colors} style={tw('text-xs mt-1')}>Tu progreso hoy</Text>
          </View>
          
          {/* Wallet Balance Widget */}
          <View style={[tw('flex-row items-center px-3 py-1.5 rounded-full border'), { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
             <Ionicons name="wallet-outline" size={16} color={colors.primary} style={tw('mr-2')} />
             <Text category="s2" colors={colors}>{balance} Créditos</Text>
          </View>

          <CircularProgress percent={d.profile} />
        </View>
        <View style={[tw('flex-row justify-around pt-4 border-t'), { borderTopColor: colors.cardBorder }]}>
          {[
            { value: d.apps, label: 'Aplicaciones', color: colors.warning },
            { value: d.interviews, label: 'Entrevistas', color: colors.success },
            { value: d.matches, label: 'Matches', color: colors.primary },
          ].map(({ value, label, color }, i) => (
            <View key={i} style={tw('items-center')}>
              <Text category="h6" colors={colors} style={{ color }}>{value}</Text>
              <Text appearance="hint" colors={colors} style={tw('text-[10px] mt-1')}>{label}</Text>
            </View>
          ))}
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
            <Text category="s1" colors={colors}>Actividad Carrera</Text>
            <Text appearance="hint" colors={colors} style={tw('text-xs mt-1')}>Últimos 7 días</Text>
          </View>
          <View style={tw('items-end')}>
            <Text category="h5" colors={colors} style={{ color: colors.primary }}>{d.rate}%</Text>
            <Text appearance="hint" colors={colors} style={tw('text-xs')}>Respuesta</Text>
          </View>
        </View>
        <MiniBar data={d.weekly} color={colors.primary} />
        <View style={[tw('flex-row justify-around pt-4 mt-2 border-t'), { borderTopColor: colors.cardBorder }]}>
          {[
            { value: d.active, label: 'Activas', color: colors.warning },
            { value: d.interviews, label: 'Entrevistas', color: colors.success },
            { value: d.offers, label: 'Ofertas', color: colors.primary },
          ].map(({ value, label, color }, i) => (
            <View key={i} style={tw('items-center')}>
              <Text category="h6" colors={colors} style={{ color }}>{value}</Text>
              <Text appearance="hint" colors={colors} style={tw('text-[10px] mt-1')}>{label}</Text>
            </View>
          ))}
        </View>
      </Card>
    );
  };

  const renderLearning = () => {
    const d = data as LearningData;
    return (
      <Card colors={colors}>
        <View style={tw('flex-row justify-between mb-4')}>
          <View>
            <Text category="s1" colors={colors}>Progreso Aprendizaje</Text>
            <View style={tw('flex-row items-center mt-1')}>
              <Ionicons name="flame" size={14} color={colors.warning} />
              <Text colors={colors} style={tw('ml-1.5 text-xs font-semibold text-yellow-500')}>
                Racha {d.streak} días
              </Text>
            </View>
          </View>
          <View style={tw('items-end')}>
            <Text category="h5" colors={colors} style={{ color: colors.success }}>{d.hours}h</Text>
            <Text appearance="hint" colors={colors} style={tw('text-xs')}>Total</Text>
          </View>
        </View>
        <MiniLine data={d.progress} color={colors.success} />
        <Text appearance="hint" colors={colors} style={tw('text-xs mt-2 text-center')}>
          Progreso últimos 5 cursos
        </Text>
        <View style={[tw('flex-row justify-around pt-4 mt-3 border-t'), { borderTopColor: colors.cardBorder }]}>
          {[
            { value: d.inProgress, label: 'En progreso', color: '#8b5cf6' },
            { value: d.completed, label: 'Completados', color: colors.success },
          ].map(({ value, label, color }, i) => (
            <View key={i} style={tw('items-center')}>
              <Text category="h6" colors={colors} style={{ color }}>{value}</Text>
              <Text appearance="hint" colors={colors} style={tw('text-[10px] mt-1')}>{label}</Text>
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
            <Text category="s1" colors={colors}>Actividad Comunitaria</Text>
            <Text appearance="hint" colors={colors} style={tw('text-xs mt-1')}>Última semana</Text>
          </View>
          <View style={tw('items-end')}>
            <Text category="h5" colors={colors} style={{ color: colors.reputation }}>{d.rep}</Text>
            <Text appearance="hint" colors={colors} style={tw('text-xs')}>Reputación</Text>
          </View>
        </View>
        <MiniBar data={d.activity} color={colors.reputation} />
        <View style={[tw('flex-row justify-around pt-4 mt-2 border-t'), { borderTopColor: colors.cardBorder }]}>
          {[
            { value: d.posts, label: 'Posts', color: colors.reputation },
            { value: d.helpful, label: 'Útiles', color: colors.success },
            { value: d.followers, label: 'Seguidores', color: colors.primary },
          ].map(({ value, label, color }, i) => (
            <View key={i} style={tw('items-center')}>
              <Text category="h6" colors={colors} style={{ color }}>{value}</Text>
              <Text appearance="hint" colors={colors} style={tw('text-[10px] mt-1')}>{label}</Text>
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
          <Text category="label" appearance="hint" colors={colors} style={tw('mb-2')}>PATROCINADO</Text>
          <NativeAd />
          
          {/* TEST REWARD BUTTON */}
          <TouchableOpacity 
            onPress={() => {
                if (loaded) {
                    showRewarded();
                } else {
                    alert('Ad not loaded yet. Please wait...');
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
                    {loaded ? 'Obtener Puntos (+1 Crédito)' : 'Cargando Anuncio...'}
                </Text>
             </View>
          </TouchableOpacity>
        </View>

        {/* Quick Access */}
        <View style={tw('mb-6')}>
          <Text category="label" appearance="hint" colors={colors} style={tw('mb-3')}>ACCESO RÁPIDO</Text>
          <View style={tw('flex-row flex-wrap justify-between')}>
            {[
              { icon: 'document-text-outline', title: 'CV Builder', sub: 'Crea tu currículum', color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
              { icon: 'mic-outline', title: 'Mock Interview', sub: '3 pendientes', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
              { icon: 'briefcase-outline', title: 'Job Board', sub: '42 nuevas ofertas', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
              { icon: 'school-outline', title: 'Cursos', sub: '60% completado', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
            ].map((m, i) => (
              <TouchableOpacity
                key={i}
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
            <NativeAdSmall style={{ width: (width - 48) / 2 }} />
            <NativeAdSmall style={{ width: (width - 48) / 2 }} />

            {[
              { icon: 'chatbubbles-outline', title: 'Foro', sub: '24 temas activos', color: '#ec4899', bg: 'rgba(236,72,153,0.15)' },
              { icon: 'flash-outline', title: 'Flashcards', sub: 'Practica ahora', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
            ].map((m, i) => (
              <TouchableOpacity
                key={`second-${i}`}
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
          </View>
        </View>

        {/* Recommended Course Featured Ad */}
        <View style={tw('mb-4')}>
          <Text category="label" appearance="hint" colors={colors} style={tw('mb-2')}>PATROCINADO</Text>
          <NativeAd />
        </View>
        {/* Recent Activity */}
        <View style={tw('mb-6')}>
          <Text category="label" appearance="hint" colors={colors} style={tw('mb-3')}>ACTIVIDAD RECIENTE</Text>
          {[
            { icon: 'checkmark-circle', color: colors.success, title: 'Aplicación enviada', sub: 'Software Engineer en Meta', time: 'Hace 2h' },
            { icon: 'chatbubble', color: colors.primary, title: 'Nuevo mensaje', sub: 'María comentó en tu publicación', time: 'Hace 4h' },
            { icon: 'trophy', color: colors.warning, title: 'Logro desbloqueado', sub: 'Completaste 10 entrevistas mock', time: 'Hace 1d' },
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
        </View>

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
