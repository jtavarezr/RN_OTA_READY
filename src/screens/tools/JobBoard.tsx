// JobBoard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  StatusBar,
  FlatList,
  Modal,
  ActivityIndicator,
  Image,
  Linking,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useThemeColors } from '../../utils/themeColors';
import { AppHeader } from '../../components/AppHeader';
import { NativeAd } from '../../components/ads/NativeAd';
import RenderHtml from 'react-native-render-html';

const REMOTIVE_BASE_URL = 'https://remotive.com/api/remote-jobs';
const USAJOBS_BASE_URL = 'https://data.usajobs.gov/api/search';
const THEMUSE_BASE_URL = 'https://www.themuse.com/api/public/jobs';
const JOBICY_BASE_URL = 'https://jobicy.com/api/v2/remote-jobs';

export default function JobBoard() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const colors = useThemeColors();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  const [search, setSearch] = useState('developer');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'remotive' | 'jobicy' | 'themuse' | 'usajobs'>('remotive');
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  const sources = [
    { id: 'remotive', label: 'Remotive', icon: 'cloud-queue' },
    { id: 'jobicy', label: 'Jobicy', icon: 'work-outline' },
    { id: 'themuse', label: 'The Muse', icon: 'public' },
    { id: 'usajobs', label: 'USAJobs', icon: 'location-city' },
  ];

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    let data: any[] = [];
    try {
        if (source === 'remotive') {
            const res = await fetch(`${REMOTIVE_BASE_URL}?search=${encodeURIComponent(search)}&limit=20`);
            const json = await res.json();
            data = (json.jobs || []).map((j: any) => ({ 
                ...j, 
                id: `remotive-${j.id}`, 
                title: j.title, 
                company: j.company_name, 
                logo: j.company_logo, 
                desc: j.description,
                srcLabel: 'Remotive',
                date: j.publication_date
            }));
        } else if (source === 'jobicy') {
            const res = await fetch(`${JOBICY_BASE_URL}?tag=${encodeURIComponent(search)}`);
            const json = await res.json();
            data = (json.jobs || []).map((j: any) => ({ 
                ...j, 
                id: `jobicy-${j.id}`, 
                title: j.jobTitle, 
                company: j.companyName, 
                logo: j.companyLogo, 
                desc: j.jobDescription, 
                location: j.jobGeo,
                salary: j.annualSalaryMin ? `${j.annualSalaryMin}-${j.annualSalaryMax} ${j.salaryCurrency}` : null,
                srcLabel: 'Jobicy',
                date: j.pubDate
            }));
        } else if (source === 'themuse') {
            const res = await fetch(`${THEMUSE_BASE_URL}?category=${encodeURIComponent(search === 'developer' ? 'Software Engineering' : search)}&page=1`);
            const json = await res.json();
            data = (json.results || []).map((j: any) => ({ 
                ...j, 
                id: `themuse-${j.id}`, 
                title: j.name, 
                company: j.company?.name, 
                desc: j.contents, 
                location: j.locations?.[0]?.name, 
                url: j.refs?.landing_page,
                srcLabel: 'The Muse',
                date: j.publication_date
            }));
        } else if (source === 'usajobs') {
            const res = await fetch(`${USAJOBS_BASE_URL}?Keyword=${encodeURIComponent(search)}&ResultsPerPage=20`, { headers: { 'User-Agent': 'JobBoardApp/1.0' } });
            const json = await res.json();
            data = (json.SearchResult?.SearchResultItems || []).map((item: any) => {
                const j = item.MatchedObjectDescriptor;
                return { 
                    id: `usa-${j.PositionID}`, 
                    title: j.PositionTitle, 
                    company: j.OrganizationName, 
                    desc: j.UserArea?.Details?.JobSummary, 
                    location: j.PositionLocationDisplay, 
                    url: j.PositionURI,
                    salary: j.PositionRemuneration?.[0]?.MinimumRange ? `$${j.PositionRemuneration[0].MinimumRange}+` : null,
                    srcLabel: 'USAJobs',
                    date: j.PublicationStartDate
                };
            });
        }
    } catch (e) { console.error(e); }

    const withAds: any[] = [];
    data.forEach((item, i) => {
      withAds.push(item);
      if ((i + 1) % 6 === 0) withAds.push({ isAd: true, id: `ad-${source}-${i}` });
    });
    setJobs(withAds);
    setLoading(false);
  }, [search, source]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const renderItem = ({ item }: { item: any }) => {
    if (item.isAd) return <View style={{ marginVertical: 10, paddingHorizontal: 20 }}><NativeAd /></View>;
    
    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} 
        onPress={() => setSelectedJob(item)}
      >
        <View style={styles.cardHeader}>
            <View style={[styles.sourceBadge, { backgroundColor: colors.background }]}>
                <Text style={[styles.sourceText, { color: colors.primary }]}>{item.srcLabel}</Text>
            </View>
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                {item.date ? new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
            </Text>
        </View>

        <View style={styles.row}>
          {item.logo ? <Image source={{ uri: item.logo }} style={styles.logo} resizeMode="contain" /> : (
            <View style={[styles.logo, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
                <MaterialIcons name="business" size={24} color={colors.textSecondary} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.textMain }]} numberOfLines={2}>{item.title}</Text>
            <Text style={[styles.company, { color: colors.textSecondary }]} numberOfLines={1}>{item.company}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
            <View style={styles.tags}>
                <View style={[styles.tag, { backgroundColor: colors.background }]}>
                    <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
                    <Text style={[styles.tagText, { color: colors.textSecondary }]} numberOfLines={1}>{item.location || 'Remote'}</Text>
                </View>
                <View style={[styles.tag, { backgroundColor: colors.background }]}>
                    <Ionicons name="briefcase-outline" size={12} color={colors.textSecondary} />
                    <Text style={[styles.tagText, { color: colors.textSecondary }]}>{item.job_type || 'Job'}</Text>
                </View>
            </View>
            {item.salary && (
                <Text style={[styles.salaryText, { color: colors.success }]} numberOfLines={1}>{item.salary}</Text>
            )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.master, { backgroundColor: colors.background }]}>
      <AppHeader showBack={true} onBackPress={() => navigation.goBack()} title={t('jobBoard.title')} />
      
      <View style={styles.topBar}>
        <View style={[styles.search, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, { color: colors.textMain }]}
            value={search}
            onChangeText={setSearch}
            placeholder={t('jobBoard.searchPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            onSubmitEditing={fetchJobs}
            returnKeyType="search"
          />
        </View>
      </View>

      <View style={{ height: 50, marginBottom: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {sources.map(s => (
            <TouchableOpacity 
                key={s.id} 
                onPress={() => setSource(s.id as any)}
                style={[styles.chip, { backgroundColor: source === s.id ? colors.primary : colors.card, borderColor: colors.cardBorder }]}
            >
              <MaterialIcons name={s.icon as any} size={14} color={source === s.id ? 'white' : colors.primary} />
              <Text style={[styles.chipText, { color: source === s.id ? 'white' : colors.textMain }]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} color={colors.primary} size="large" />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 50, color: colors.textSecondary }}>{t('jobBoard.noOffers')}</Text>}
        />
      )}

      <Modal visible={!!selectedJob} animationType="slide" onRequestClose={() => setSelectedJob(null)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
            <TouchableOpacity onPress={() => setSelectedJob(null)} style={styles.p10}><Ionicons name="close" size={28} color={colors.textMain} /></TouchableOpacity>
            <Text style={[styles.modalHeaderText, { color: colors.textMain }]} numberOfLines={1}>{selectedJob?.company}</Text>
            <TouchableOpacity onPress={() => selectedJob?.url && Linking.openURL(selectedJob.url)} style={styles.p10}><Ionicons name="open-outline" size={24} color={colors.primary} /></TouchableOpacity>
          </View>
          
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text style={[styles.fullTitle, { color: colors.textMain }]}>{selectedJob?.title}</Text>
            <View style={[styles.hDivider, { backgroundColor: colors.cardBorder }]} />
            <Text style={[styles.descLabel, { color: colors.textMain, marginBottom: 10 }]}>{t('jobBoard.description')}</Text>
            <RenderHtml
                contentWidth={width - 40}
                source={{ html: selectedJob?.desc || '<p>No description available.</p>' }}
                baseStyle={{ color: colors.textMain, fontSize: 16, lineHeight: 24 }}
            />
            <View style={{ height: 100 }} />
          </ScrollView>

          <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.cardBorder }]}>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => selectedJob?.url && Linking.openURL(selectedJob.url)}>
              <Text style={styles.btnText}>{t('jobBoard.applyNow')}</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={fetchJobs}>
        <Ionicons name="refresh" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  master: { flex: 1 },
  topBar: { paddingHorizontal: 20, paddingBottom: 10 },
  search: { flexDirection: 'row', alignItems: 'center', height: 45, borderRadius: 12, paddingHorizontal: 15, borderWidth: 1 },
  input: { flex: 1, marginLeft: 10, fontSize: 15 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, height: 36 },
  chipText: { fontSize: 12, fontWeight: 'bold', marginLeft: 5 },
  card: { padding: 15, borderRadius: 18, marginBottom: 15, borderWidth: 1, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sourceBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  sourceText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  dateText: { fontSize: 10, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  logo: { width: 48, height: 48, borderRadius: 10, marginRight: 15 },
  title: { fontSize: 16, fontWeight: 'bold', flex: 1, lineHeight: 20 },
  company: { fontSize: 14, fontWeight: '500', marginTop: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 10 },
  tags: { flexDirection: 'row', gap: 8, flex: 1 },
  tag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  tagText: { fontSize: 11, fontWeight: '600' },
  salaryText: { fontSize: 13, fontWeight: 'bold' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingBottom: 10, borderBottomWidth: 1 },
  modalHeaderText: { fontSize: 16, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  p10: { padding: 10 },
  fullTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  hDivider: { height: 1, marginVertical: 15 },
  descLabel: { fontSize: 18, fontWeight: 'bold' },
  footer: { padding: 20, borderTopWidth: 1 },
  btn: { height: 55, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  btnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 },
});
