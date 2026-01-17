import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Card, Avatar, Button } from '@ui-kitten/components';
import { ScreenLayout } from '../../components/ScreenLayout';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

export const ProfileScreen = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const displayName =
    // @ts-ignore
    user?.name ||
    // @ts-ignore
    user?.email ||
    // @ts-ignore
    user?.$id ||
    'User Name';

  const displayId =
    // @ts-ignore
    user?.$id ||
    // @ts-ignore
    user?.uid ||
    'N/A';

  return (
    <ScreenLayout>
      <View style={styles.header}>
        <Avatar
          style={styles.avatar}
          size='giant'
          source={require('../../../assets/icon.png')} // Fallback to app icon or a placeholder
        />
        <Text category='h5' style={styles.name}>
          {displayName}
        </Text>
        <Text category='s1' appearance='hint'>
          {user?.email || 'user@example.com'}
        </Text>
      </View>

      <Card style={styles.card}>
        <Text category='h6'>{t('profile')}</Text>
        <View style={styles.infoRow}>
            <Text category='s1'>ID:</Text>
            <Text category='p1'>{displayId}</Text>
        </View>
        <View style={styles.infoRow}>
            <Text category='s1'>{t('email')}:</Text>
            <Text category='p1'>
              {
                // @ts-ignore
                user?.email || 'N/A'
              }
            </Text>
        </View>
      </Card>

      <Button status='danger' onPress={logout} style={styles.logoutButton}>
        {t('logout')}
      </Button>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  name: {
    marginBottom: 4,
  },
  card: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  logoutButton: {
    marginTop: 24,
  },
});
