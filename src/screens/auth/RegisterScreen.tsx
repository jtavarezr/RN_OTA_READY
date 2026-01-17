import React, { useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Button, Input, Text } from '@ui-kitten/components';
import { useAuth } from '../../context/AuthContext';
import { ScreenLayout } from '../../components/ScreenLayout';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

export const RegisterScreen = () => {
  const { register } = useAuth();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert(t('error'), 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await register(email, password);
      Alert.alert(t('success'), t('registerSuccess'));
    } catch (error: any) {
      Alert.alert(t('error'), error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout style={styles.container}>
      <View style={styles.headerContainer}>
        <Text category='h1'>JobsPrepAI</Text>
        <Text category='s1' style={styles.subtitle}>{t('register')}</Text>
      </View>

      <Input
        placeholder={t('email')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize='none'
        keyboardType='email-address'
        style={styles.input}
      />
      <Input
        placeholder={t('password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Button onPress={handleRegister} disabled={loading} style={styles.button}>
        {loading ? t('loading') : t('register')}
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
  subtitle: {
    marginTop: 8,
    color: '#8F9BB3',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 16,
  },
});
