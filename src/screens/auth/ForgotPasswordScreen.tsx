import React, { useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Button, Input, Text } from '@ui-kitten/components';
import { useAuth } from '../../context/AuthContext';
import { ScreenLayout } from '../../components/ScreenLayout';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

export const ForgotPasswordScreen = () => {
  const { recoverPassword } = useAuth();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRecover = async () => {
    if (!email) {
      Alert.alert(t('error'), 'Please enter your email');
      return;
    }
    setLoading(true);
    try {
      await recoverPassword(email);
      Alert.alert(t('success'), 'Recovery email sent if account exists.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(t('error'), error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout style={styles.container}>
      <View style={styles.headerContainer}>
        <Text category='h5'>{t('recoverPassword')}</Text>
      </View>

      <Input
        placeholder={t('email')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize='none'
        keyboardType='email-address'
        style={styles.input}
      />

      <Button onPress={handleRecover} disabled={loading} style={styles.button}>
        {loading ? t('loading') : t('sendResetLink')}
      </Button>

      <Button
        appearance='ghost'
        onPress={() => navigation.goBack()}
        style={styles.button}
      >
        {t('backToLogin')}
      </Button>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 16,
  },
});
