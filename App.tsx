import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './src/context/AuthContext';
import { WalletProvider } from './src/context/WalletContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { useSettingsStore } from './src/context/SettingsStore';
import { AppNavigator } from './src/navigation/AppNavigator';
import { CustomSplashScreen } from './src/components/CustomSplashScreen';
import './src/i18n';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SyncProvider } from './src/context/SyncContext';
import { getDb } from './src/utils/db';
import { useLearningStore } from './src/store/useLearningStore';

import { usePracticeStore } from './src/store/usePracticeStore';

import { TailwindProvider } from 'tailwind-rn';
import utilities from './tailwind.json';
import { useAppOpenAd } from './src/components/ads/useAppOpenAd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Prevent the native splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const AppContent = () => {
  const { theme } = useTheme();
  const { primaryColor, fontColor } = useSettingsStore();
  const [isSplashFinished, setIsSplashFinished] = useState(false);
  
  // Initialize App Open Ad hook to handle ads on app resume/start
  useAppOpenAd();

  useEffect(() => {
    // Hide the native splash screen and init DB
    const startup = async () => {
      try {
        await getDb(); // Safe singleton init
        await useLearningStore.getState().init();
        await usePracticeStore.getState().init();
        await SplashScreen.hideAsync();


      } catch (e) {

        console.warn('Error during startup:', e);
      }
    };
    
    startup();
  }, []);


  if (!isSplashFinished) {
    return <CustomSplashScreen onFinish={() => setIsSplashFinished(true)} />;
  }

  const baseTheme = theme === 'light' ? eva.light : eva.dark;
  const customTheme = {
    ...baseTheme,
    'color-primary-default': primaryColor,
    'color-primary-500': primaryColor,
    'color-primary-400': primaryColor,
    'color-primary-600': primaryColor,
    ...(fontColor ? { 'text-basic-color': fontColor } : {}),
  };

  return (
    <ApplicationProvider {...eva} theme={customTheme}>
      <StatusBar style={theme === 'light' ? 'dark' : 'light'} />
      <AppNavigator />
    </ApplicationProvider>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <IconRegistry icons={EvaIconsPack} />
        {/* @ts-ignore - TailwindProvider types might be mismatching but it supports children */}
        <TailwindProvider utilities={utilities}>
          <ThemeProvider>
          <SyncProvider>
            <AuthProvider>
              <WalletProvider>
                <AppContent />
              </WalletProvider>
            </AuthProvider>
          </SyncProvider>
        </ThemeProvider>

        </TailwindProvider>
      </QueryClientProvider>
    </SafeAreaProvider>

  );
}
