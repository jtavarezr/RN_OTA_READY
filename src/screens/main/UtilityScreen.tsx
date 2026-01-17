import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Text, Layout, Card, Button, Spinner, Divider } from '@ui-kitten/components';
import { ScreenLayout } from '../../components/ScreenLayout';
import { useTranslation } from 'react-i18next';
import { useOTA } from '../../hooks/useOTA';
import { logger, LogEntry } from '../../utils/logger';
import { useTailwind } from '../../utils/tailwind';

export const UtilityScreen = () => {
  const { t } = useTranslation();
  const tailwind = useTailwind();
  const { status, error, checkUpdates, reload, runtimeVersion, updateId } = useOTA();
  const [logs, setLogs] = useState<LogEntry[]>(logger.getLogs());

  useEffect(() => {
    return logger.subscribe((newLogs) => setLogs([...newLogs]));
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'ready':
        return 'success';
      case 'error':
        return 'danger';
      case 'downloading':
        return 'info';
      case 'checking':
        return 'warning';
      default:
        return 'basic';
    }
  };

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text category='h4' style={styles.title}>{t('utility')}</Text>
        
        <Card style={styles.card}>
          <Text category='h6'>Over-The-Air Updates</Text>
          <Text category='p2' style={styles.description}>
            Runtime: {runtimeVersion ? runtimeVersion : (__DEV__ ? 'Development (Expo Go)' : 'N/A')}
          </Text>
          <Text category='c1' appearance='hint' style={styles.version}>
            Update ID: {updateId || 'Native'}
          </Text>
          
          <View style={[styles.statusContainer, tailwind('mt-4 mb-4')]}>
            <Text category='s1'>Status: </Text>
            <Text category='s1' status={getStatusColor()}>{status.toUpperCase()}</Text>
          </View>

          {error && (
            <Text status='danger' style={styles.error}>
              {error}
            </Text>
          )}

          <View style={tailwind('flex-row justify-between mt-2')}>
            <Button
              size='small'
              onPress={checkUpdates}
              disabled={status === 'checking' || status === 'downloading'}
              accessoryLeft={status === 'checking' || status === 'downloading' ? (props) => <View {...props}><Spinner size='tiny'/></View> : undefined}
            >
              Check for Updates
            </Button>

            {status === 'ready' && (
              <Button size='small' status='success' onPress={() => reload()}>
                Reload App
              </Button>
            )}
          </View>
        </Card>

        <Card style={styles.card}>
            <View style={tailwind('flex-row justify-between items-center mb-2')}>
                <Text category='h6'>System Logs</Text>
                <Button size='tiny' appearance='ghost' onPress={() => logger.info('Manual test log')}>
                    Test Log
                </Button>
            </View>
            <Divider style={tailwind('mb-2')} />
            <View style={styles.logsList}>
                {logs.length === 0 ? (
                    <Text category='p2' appearance='hint'>No logs available</Text>
                ) : (
                    logs.map((log, i) => (
                        <View key={i} style={tailwind('flex-row mb-1')}>
                            <Text category='c1' appearance='hint' style={tailwind('w-16 mr-2 font-mono')}>
                                {log.timestamp.toLocaleTimeString()}
                            </Text>
                            <Text 
                                category='c1' 
                                status={log.level === 'error' ? 'danger' : log.level === 'warn' ? 'warning' : 'info'}
                                style={tailwind('w-12 font-bold mr-2 uppercase')}
                            >
                                {log.level}
                            </Text>
                            <Text category='c1' style={tailwind('flex-1 font-mono')}>
                                {log.message}
                            </Text>
                        </View>
                    ))
                )}
            </View>
        </Card>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  title: {
    marginVertical: 16,
  },
  card: {
    marginBottom: 16,
  },
  description: {
    marginTop: 8,
  },
  version: {
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  error: {
    marginBottom: 12,
  },
  logsList: {
    maxHeight: 300,
  },
});
