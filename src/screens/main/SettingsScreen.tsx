import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Toggle, Button, Layout, Divider } from '@ui-kitten/components';
import { ScreenLayout } from '../../components/ScreenLayout';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSettingsStore } from '../../context/SettingsStore';
import i18n from '../../i18n';

export const SettingsScreen = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const { 
    autoUpdate, toggleAutoUpdate,
    primaryColor, setPrimaryColor,
    buttonColor, setButtonColor,
  } = useSettingsStore();

  const toggleLanguage = () => {
    const current = i18n.language;
    i18n.changeLanguage(current === 'en' ? 'es' : 'en');
  };

  const colors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#1f2937'];

  return (
    <ScreenLayout>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text category='h4' style={styles.title}>{t('settings')}</Text>

        <Layout style={styles.section}>
          <View style={styles.row}>
            <Text category='s1'>{t('darkMode')}</Text>
            <Toggle checked={theme === 'dark'} onChange={toggleTheme} />
          </View>
          <Divider />
          <View style={styles.row}>
            <Text category='s1'>{t('autoUpdate')}</Text>
            <Toggle checked={autoUpdate} onChange={toggleAutoUpdate} />
          </View>
          <Divider />
          <View style={styles.row}>
            <Text category='s1'>{t('language')} ({i18n.language.toUpperCase()})</Text>
            <Button size='small' appearance='ghost' onPress={toggleLanguage}>
              {i18n.language === 'en' ? 'ESPAÑOL' : 'ENGLISH'}
            </Button>
          </View>
        </Layout>

        <Text category='h6' style={styles.subtitle}>Apariencia</Text>
        <Layout style={styles.section}>
          <Text category='s2' style={styles.label}>Color Principal</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorRow}>
            {colors.map(c => (
              <TouchableOpacity 
                key={c} 
                style={[
                  styles.colorCircle, 
                  { backgroundColor: c }, 
                  primaryColor === c && styles.selectedColor,
                  primaryColor === c && { borderColor: theme === 'dark' ? '#fff' : '#000' }
                ]}
                onPress={() => setPrimaryColor(c)}
              />
            ))}
          </ScrollView>

          <Divider style={{marginVertical: 12}} />

          <Text category='s2' style={styles.label}>Color de Botones</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorRow}>
            {colors.map(c => (
              <TouchableOpacity 
                key={c} 
                style={[
                  styles.colorCircle, 
                  { backgroundColor: c }, 
                  buttonColor === c && styles.selectedColor,
                  buttonColor === c && { borderColor: theme === 'dark' ? '#fff' : '#000' }
                ]}
                onPress={() => setButtonColor(c)}
              />
            ))}
          </ScrollView>
        </Layout>

        <Button status='danger' onPress={logout} style={styles.logoutButton}>
          {t('logout')}
        </Button>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  title: {
    marginVertical: 16,
  },
  subtitle: {
    marginVertical: 12,
    marginLeft: 4,
  },
  section: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  label: {
    marginBottom: 12,
  },
  colorRow: {
    marginBottom: 4,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    borderWidth: 0,
  },
  selectedColor: {
    borderWidth: 3,
  },
  logoutButton: {
    marginTop: 24,
    marginBottom: 48,
  },
});