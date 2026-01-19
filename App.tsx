import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { CustomSplashScreen } from './src/components/CustomSplashScreen';
import './src/i18n';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TailwindProvider } from 'tailwind-rn';
import utilities from './tailwind.json';

// Prevent the native splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const AppContent = () => {
  const { theme } = useTheme();
  const [isSplashFinished, setIsSplashFinished] = useState(false);

  useEffect(() => {
    // Hide the native splash screen once the component mounts
    // so our CustomSplashScreen becomes visible
    const hideNativeSplash = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn('Error hiding splash screen:', e);
      }
    };
    
    hideNativeSplash();
  }, []);

  if (!isSplashFinished) {
    return <CustomSplashScreen onFinish={() => setIsSplashFinished(true)} />;
  }

  return (
    <ApplicationProvider {...eva} theme={theme === 'light' ? eva.light : eva.dark}>
      <StatusBar style={theme === 'light' ? 'dark' : 'light'} />
      <AppNavigator />
    </ApplicationProvider>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <IconRegistry icons={EvaIconsPack} />
      {/* @ts-ignore - TailwindProvider types might be mismatching but it supports children */}
      <TailwindProvider utilities={utilities}>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </TailwindProvider>
    </SafeAreaProvider>
  );
}
