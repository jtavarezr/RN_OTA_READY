import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, Card } from '@ui-kitten/components';
import { ScreenLayout } from '../../components/ScreenLayout';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

export const HomeScreen = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const displayName =
    // @ts-ignore
    user?.name ||
    // @ts-ignore
    user?.email ||
    // @ts-ignore
    user?.$id ||
    '';

  return (
    <ScreenLayout>
      <Text category='h4' style={styles.title}>{t('home')}</Text>
      
      <Card style={styles.card}>
        <Text category='h6'>
          {t('welcome')}{displayName ? `, ${displayName}` : ''}
        </Text>
        <Text category='p1' style={styles.text}>
          PRUEBA NEW SERVER OTA! AppWriter vs Firebase.
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text category='h6'>Recent Activity</Text>
        <Text category='p2'>No recent activity.</Text>
      </Card>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  title: {
    marginVertical: 16,
  },
  card: {
    marginBottom: 16,
  },
  text: {
    marginTop: 8,
  },
});
