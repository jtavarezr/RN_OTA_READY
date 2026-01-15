import { useState, useEffect } from 'react';
import * as Updates from 'expo-updates';
import { Alert } from 'react-native';
import { logger } from '../utils/logger';

export type OTAStatus = 'idle' | 'checking' | 'downloading' | 'ready' | 'error';

export const useOTA = () => {
  const [status, setStatus] = useState<OTAStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [manifest, setManifest] = useState<any>(null);

  const checkUpdates = async () => {
    if (__DEV__) {
      logger.info('Running in DEV mode (Expo Go)');
      logger.warn('OTA updates require a Release Build or Development Build to function fully.');
    }

    try {
      setStatus('checking');
      logger.info('Checking for updates...');
      const update = await Updates.checkForUpdateAsync();
      
      if (update.isAvailable) {
        logger.info('Update found!', { manifest: update.manifest });
        setManifest(update.manifest);
        setStatus('downloading');
        logger.info('Downloading update...');
        await Updates.fetchUpdateAsync();
        setStatus('ready');
        logger.info('Update ready to apply');
        
        Alert.alert(
          'Actualización disponible',
          'Se ha descargado una nueva versión. ¿Deseas reiniciar la aplicación ahora?',
          [
            { text: 'Más tarde', style: 'cancel' },
            { text: 'Reiniciar', onPress: () => Updates.reloadAsync() },
          ]
        );
      } else {
        logger.info('No updates available');
        setStatus('idle');
      }
    } catch (e: any) {
      logger.error('OTA Error', { error: e.message });
      setError(e.message);
      setStatus('error');
    }
  };

  useEffect(() => {
    checkUpdates();
  }, []);

  return {
    status,
    error,
    manifest,
    checkUpdates,
    reload: Updates.reloadAsync,
    isUpdateAvailable: status === 'ready',
    runtimeVersion: Updates.runtimeVersion,
    updateId: Updates.updateId,
  };
};
