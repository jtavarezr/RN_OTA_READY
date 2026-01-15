import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useOTA } from './src/hooks/useOTA';
import { useEffect, useState } from 'react';
import { logger, LogEntry } from './src/utils/logger';

export default function App() {
  const { status, error, checkUpdates, reload, runtimeVersion, updateId } =
    useOTA();
  const [logs, setLogs] = useState<LogEntry[]>(logger.getLogs());

  useEffect(() => {
    return logger.subscribe((newLogs) => setLogs([...newLogs]));
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'ready':
        return '#22c55e';
      case 'error':
        return '#ef4444';
      case 'downloading':
        return '#3b82f6';
      case 'checking':
        return '#f59e0b';
      default:
        return '#64748b';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Expo OTA Version 2</Text>
        <Text style={styles.subtitle}>Runtime {runtimeVersion || 'N/A'}</Text>
        <Text style={styles.version}>Update ID: {updateId || 'Native'}</Text>

        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Actualizaciones OTA</Text>
          <Text style={styles.cardDescription}>
            Esta aplicación puede recibir actualizaciones Over-The-Air desde el servidor configurado.
          </Text>

          {(status === 'checking' || status === 'downloading') && (
            <ActivityIndicator color="#3b82f6" style={{ marginBottom: 16 }} />
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={checkUpdates}
            disabled={status === 'checking' || status === 'downloading'}
          >
            <Text style={styles.primaryButtonText}>Buscar actualización</Text>
          </TouchableOpacity>

          {status === 'ready' && (
            <TouchableOpacity style={styles.secondaryButton} onPress={reload}>
              <Text style={styles.secondaryButtonText}>Reiniciar aplicación</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.card, styles.logsCard]}>
          <View style={styles.logsHeader}>
            <Text style={styles.logsTitle}>Logs</Text>
            <TouchableOpacity onPress={() => logger.info('Manual test log')}>
              <Text style={styles.logsAction}>Test</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.logsList}>
            {logs.map((log, i) => (
              <View key={i} style={styles.logItem}>
                <Text style={styles.logTime}>
                  {log.timestamp.toLocaleTimeString()}
                </Text>
                <Text
                  style={[
                    styles.logLevel,
                    {
                      color:
                        log.level === 'error'
                          ? '#ef4444'
                          : log.level === 'warn'
                          ? '#f59e0b'
                          : '#38bdf8',
                    },
                  ]}
                >
                  {log.level.toUpperCase()}
                </Text>
                <Text style={styles.logMessage}>{log.message}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <StatusBar style="light" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },

  header: {
    paddingTop: 70,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: '#020617',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  version: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },

  statusBadge: {
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  content: {
    padding: 20,
    gap: 20,
  },

  card: {
    backgroundColor: '#020617',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e5e7eb',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 20,
    lineHeight: 20,
  },

  errorText: {
    color: '#ef4444',
    marginBottom: 12,
    fontSize: 13,
  },

  primaryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: '700',
  },

  logsCard: {
    backgroundColor: '#020617',
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  logsTitle: {
    color: '#e5e7eb',
    fontSize: 16,
    fontWeight: '700',
  },
  logsAction: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '600',
  },
  logsList: {
    maxHeight: 280,
  },
  logItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  logTime: {
    color: '#64748b',
    fontSize: 10,
    width: 60,
    fontFamily: 'monospace',
  },
  logLevel: {
    width: 60,
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  logMessage: {
    flex: 1,
    color: '#cbd5f5',
    fontSize: 11,
    fontFamily: 'monospace',
  },
});
