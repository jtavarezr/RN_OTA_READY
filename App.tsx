import React from 'react';
import { StatusBar } from 'expo-status-bar';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import './src/i18n';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TailwindProvider } from 'tailwind-rn';
import utilities from './tailwind.json';

const AppContent = () => {
  const { theme } = useTheme();

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
