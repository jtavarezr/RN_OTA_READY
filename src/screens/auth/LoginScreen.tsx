import React, { useState } from 'react';
import { StyleSheet, View, Alert, TouchableOpacity } from 'react-native';
import { Button, Input, Text } from '@ui-kitten/components';
import { useAuth } from '../../context/AuthContext';
import { ScreenLayout } from '../../components/ScreenLayout';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

export const LoginScreen = () => {
  const { login } = useAuth();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('error'), 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
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
        <Text category='s1' style={styles.subtitle}>{t('login')}</Text>
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

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text category='c1' status='primary' style={styles.forgotPassword}>
          {t('forgotPassword')}
        </Text>
      </TouchableOpacity>

      <Button onPress={handleLogin} disabled={loading} style={styles.button}>
        {loading ? t('loading') : t('login')}
      </Button>

      <Button
        appearance='ghost'
        onPress={() => navigation.navigate('Register')}
        style={styles.button}
      >
        {t('register')}
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
  forgotPassword: {
    textAlign: 'right',
    marginBottom: 24,
  },
  button: {
    marginBottom: 16,
  },
});
