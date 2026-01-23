import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet, Dimensions, SafeAreaView,
  KeyboardAvoidingView, Platform, Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../utils/themeColors';
import { useTailwind } from '../../utils/tailwind';
import { NativeAd } from '../../components/ads/NativeAd';
import { useRewardedAd } from '../../components/ads/useRewardedAd';
import { useInterstitialAd } from '../../components/ads/useInterstitialAd';

// Steps
import { JobInputStep } from './steps/JobInputStep';
import { ResumeInputStep } from './steps/ResumeInputStep';

// Reports
import { BasicReport } from './reports/BasicReport';
import { AdvancedReport } from './reports/AdvancedReport';
import basicReportData from '../../data/reports/basicReport.json';
import advancedReportData from '../../data/reports/advancedReport.json';
import { useWallet } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
type ReportType = 'basic' | 'advanced';

export const JobResumeCompatibility = () => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const tw = useTailwind();
  const { loaded, showRewarded, reward } = useRewardedAd();
  const { loaded: interstitialLoaded, showInterstitial } = useInterstitialAd();
  const { user } = useAuth();
  // Wallet Hook
  const { balance, spendCredits, prices, refreshBalance } = useWallet();
  const scrollViewRef = useRef<ScrollView>(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [reportType, setReportType] = useState<ReportType>('basic');

  // --- PARAMETERS ---
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobInputType, setJobInputType] = useState<'text' | 'file'>('text');
  const [jobFile, setJobFile] = useState<any>(null);

  // --- CV DATA ---
  const [resumeText, setResumeText] = useState('');
  const [resumeInputType, setResumeInputType] = useState<'text' | 'file'>('file');
  const [resumeFile, setResumeFile] = useState<any>(null);
  
  const [result, setResult] = useState<null | any>(null);

  useEffect(() => {
    let interval: any;
    if (loading) {
      setScanProgress(0);
      interval = setInterval(() => {
        setScanProgress((prev) => (prev >= 100 ? 100 : prev + 2));
      }, 50);
    } else {
      setScanProgress(0);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const pickDocument = async (target: 'job' | 'resume') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        if (target === 'job') setJobFile(result.assets[0]);
        else setResumeFile(result.assets[0]);
      }
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };

  const startAnalysis = async () => {
    setLoading(true);
    // Show interstitial ad if available while it's generating
    if (interstitialLoaded) {
      showInterstitial();
    }
    try {
        const formData = new FormData();
        const userId = (user as any)?.$id || (user as any)?.uid || (user as any)?.id;
        
        formData.append('userId', userId);
        formData.append('jobTitle', jobTitle);
        formData.append('reportType', reportType);
        formData.append('language', t('i18n.language') || 'en'); // Assuming a way to get current lang or use i18n
        
        if (jobInputType === 'text') {
            formData.append('jobDescription', jobDescription);
        } else if (jobFile) {
            formData.append('jdFile', {
                uri: Platform.OS === 'ios' ? jobFile.uri.replace('file://', '') : jobFile.uri,
                name: jobFile.name,
                type: jobFile.mimeType || 'application/pdf',
            } as any);
        }

        if (resumeInputType === 'text') {
            formData.append('resumeText', resumeText);
        } else if (resumeFile) {
            formData.append('resumeFile', {
                uri: Platform.OS === 'ios' ? resumeFile.uri.replace('file://', '') : resumeFile.uri,
                name: resumeFile.name,
                type: resumeFile.mimeType || 'application/pdf',
            } as any);
        }

        const response = await api.post('/api/cv/analyze', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.data && response.data.result) {
            setResult(response.data.result);
            setStep(3);
            refreshBalance(); // Refresh wallet
        } else {
            alert(t('jobResume.actions.analysisFailed'));
        }
    } catch (error: any) {
        console.error('Analysis Error:', error);
        const msg = error.response?.data?.error || "Failed to analyze compatibility. Please check your connection.";
        alert(msg);
    } finally {
        setLoading(false);
        setTimeout(() => scrollViewRef.current?.scrollTo({ y: 0, animated: true }), 100);
    }
  };

  useEffect(() => { if (reward) startAnalysis(); }, [reward]);

  const handleEvaluate = async () => {
    const hasJob = jobInputType === 'text' ? !!jobDescription : !!jobFile;
    const hasResume = resumeInputType === 'text' ? !!resumeText : !!resumeFile;
    if (!hasJob || !hasResume) return;

    // Determine Cost
    const costBasic = prices?.BASIC_REPORT?.cost ?? 1;
    const costAdvanced = prices?.ADVANCED_REPORT?.cost ?? 2;
    const cost = reportType === 'advanced' ? costAdvanced : costBasic;

    // Debug Logs
    console.log('DEBUG: ReportType:', reportType);
    console.log('DEBUG: Prices from Context:', prices);
    console.log('DEBUG: Calculated Cost:', cost);

    if (balance < cost) {
        alert(`DEBUG CHECK: Required: ${cost}, Available: ${balance}. Should be 1 for basic.`);
        return;
    }

    const success = await spendCredits(cost, `Generated ${reportType} CV Report`);
    if (success) {
        startAnalysis();
    } else {
        alert(t('jobResume.actions.transactionFailed'));
    }
  };

  const renderStepper = () => (
    <View style={tw('flex-row items-center justify-between px-6 mb-6 mt-2')}>
      {[ {id: 1, n: t('jobResume.steps.job')}, {id: 2, n: t('jobResume.steps.resume')}, {id: 3, n: t('jobResume.steps.report')} ].map((s, i) => (
        <View key={s.id} style={tw('items-center flex-1')}>
          <View style={[
            styles.stepIcon, 
            { backgroundColor: step >= s.id ? colors.primary : colors.cardBorder }
          ]}>
            <Ionicons 
              name={s.id === 1 ? 'briefcase' : s.id === 2 ? 'person' : 'stats-chart'} 
              size={16} 
              color={step >= s.id ? 'white' : colors.textSecondary} 
            />
          </View>
          <Text style={[styles.stepLabel, { color: step >= s.id ? colors.primary : colors.textSecondary }]}>{s.n}</Text>
          {i < 2 && <View style={[styles.stepLine, { backgroundColor: step > s.id ? colors.primary : colors.cardBorder }]} />}
        </View>
      ))}
    </View>
  );

  const onShare = async () => {
    try {
      if (result) {
        await Share.share({ message: `Compatibility Score: ${result.score}%` });
      }
    } catch (error) { console.log(error); }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={[tw('p-5'), { paddingBottom: 150 }]} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          
          {renderStepper()}

          {/* STEP 1: JOB DESCRIPTION */}
          {step === 1 && (
            <JobInputStep
              jobTitle={jobTitle}
              setJobTitle={setJobTitle}
              jobDescription={jobDescription}
              setJobDescription={setJobDescription}
              jobInputType={jobInputType}
              setJobInputType={setJobInputType}
              jobFile={jobFile}
              pickDocument={pickDocument}
              reportType={reportType}
              setReportType={setReportType}
            />
          )}

          {/* STEP 2: RESUME UPLOAD */}
          {step === 2 && !loading && (
            <ResumeInputStep
              resumeText={resumeText}
              setResumeText={setResumeText}
              resumeInputType={resumeInputType}
              setResumeInputType={setResumeInputType}
              resumeFile={resumeFile}
              pickDocument={pickDocument}
            />
          )}

          {/* LOADING STATE */}
          {loading && (
            <View style={tw('items-center justify-center py-20')}>
              <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 1, borderColor: colors.cardBorder }}>
                 <ActivityIndicator size="large" color={colors.primary} />
              </View>
              <Text style={[tw('mt-4 text-xl font-black'), { color: colors.textMain }]}>{scanProgress}%</Text>
              <Text style={[tw('mt-2 text-sm font-bold opacity-60'), { color: colors.textSecondary }]}>
                {reportType === 'advanced' ? t('jobResume.step3.analyzing') : t('jobResume.step3.calculating')}
              </Text>
              <View style={[tw('w-64 h-2 mt-6 rounded-full overflow-hidden'), { backgroundColor: colors.cardBorder }]}>
                <View style={[tw('h-full'), { backgroundColor: colors.primary, width: `${scanProgress}%` }]} />
              </View>
            </View>
          )}

          {/* STEP 3: RESULTS */}
          {step === 3 && result && (
            <View>
              <View style={tw('flex-row items-center justify-center mb-6')}>
                 <Ionicons name="shield-checkmark" size={24} color={colors.primary} style={tw('mr-2')} />
                 <Text style={[styles.title, { marginBottom: 0, color: colors.textMain }]}>{t('jobResume.step3.title')}</Text>
              </View>

              {reportType === 'advanced' ? (
                <AdvancedReport data={result} />
              ) : (
                <BasicReport data={result} />
              )}

              <View style={styles.adContainer}>
                 <NativeAd />
              </View>
            </View>
          )}
        </ScrollView>

        {/* FIXED FOOTER */}
        {!loading && (
          <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.cardBorder }]}>
            <View style={tw('flex-row gap-4')}>
              {step > 1 && (
                <TouchableOpacity 
                  onPress={() => setStep(step - 1)}
                  style={[styles.btn, styles.btnSecondary, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                >
                  <Ionicons name="arrow-back" size={20} color={colors.textMain} />
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => {
                  if (step === 1) {
                    const hasJob = jobInputType === 'text' ? !!jobDescription : !!jobFile;
                    if (!hasJob) return;
                    setStep(2);
                  } else if (step === 2) {
                    handleEvaluate();
                  } else {
                    onShare();
                  }
                }}
                disabled={step === 1 ? (jobInputType === 'text' ? !jobDescription : !jobFile) : 
                          step === 2 ? (resumeInputType === 'text' ? !resumeText : !resumeFile) : false}
                style={[
                  styles.btn, 
                  styles.btnPrimary,
                  { 
                    backgroundColor: colors.primary,
                    opacity: (step === 1 && (jobInputType === 'text' ? !jobDescription : !jobFile)) ||
                             (step === 2 && (resumeInputType === 'text' ? !resumeText : !resumeFile)) ? 0.6 : 1,
                    flex: 1
                  }
                ]}
              >
                <Text style={styles.btnText}>
                  {step === 1 ? t('jobResume.actions.next') : 
                   step === 2 ? t('jobResume.actions.payAndAnalyze', { cost: reportType === 'advanced' ? (prices?.ADVANCED_REPORT?.cost ?? 2) : (prices?.BASIC_REPORT?.cost ?? 1) }) : 
                   t('jobResume.actions.share')}
                </Text>
                {step < 3 && <Ionicons name="arrow-forward" size={18} color="white" style={tw('ml-2')} />}
                {step === 3 && <Ionicons name="share-social" size={18} color="white" style={tw('ml-2')} />}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 6 },
  stepIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', zIndex: 10, borderWidth: 2, borderColor: 'white' },
  stepLabel: { fontSize: 10, fontWeight: '700', marginTop: 6, textTransform: 'uppercase' },
  stepLine: { position: 'absolute', top: 15, left: '50%', width: '100%', height: 2, zIndex: 0 },
  adContainer: { marginVertical: 10, alignItems: 'center', width: '100%', overflow: 'hidden' },
  footer: { position: 'absolute', bottom: 0, width: '100%', padding: 20, paddingBottom: Platform.OS === 'ios' ? 30 : 20, borderTopWidth: 1 },
  btn: { height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  btnPrimary: {  },
  btnSecondary: { width: 56 },
  btnText: { color: 'white', fontSize: 16, fontWeight: '800' },
});