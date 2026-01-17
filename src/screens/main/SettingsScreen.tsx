import React from 'react';
import { StyleSheet, View } from 'react-native';
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
  const { autoUpdate, toggleAutoUpdate } = useSettingsStore();

  const toggleLanguage = () => {
    const current = i18n.language;
    i18n.changeLanguage(current === 'en' ? 'es' : 'en');
  };

  return (
    <ScreenLayout>
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

      <Button status='danger' onPress={logout} style={styles.logoutButton}>
        {t('logout')}
      </Button>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  title: {
    marginVertical: 16,
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
  logoutButton: {
    marginTop: 'auto',
    marginBottom: 24,
  },
});
