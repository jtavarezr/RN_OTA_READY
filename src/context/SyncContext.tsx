import React, { createContext, useContext, useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { eduService } from '../services/eduService';
import walletService from '../services/walletService';
import { dbService } from '../services/dbService';
import api from '../services/api';
import { useQueryClient } from '@tanstack/react-query';
import { eduKeys } from '../hooks/useEduQueries';
import { walletKeys } from '../hooks/useWalletQueries';
import { profileKeys } from '../hooks/useProfileQueries';




interface SyncContextType {
  isOnline: boolean;
  isServerReachable: boolean;
  pendingCount: number;
}


const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = React.useState(true);
  const [isServerReachable, setIsServerReachable] = React.useState(true);
  const [pendingCount, setPendingCount] = React.useState(0);
  const queryClient = useQueryClient();


  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // Server Heartbeat
  useEffect(() => {
     let heartbeat: any;
     const checkReachability = async () => {
        if (!isOnline) {
            setIsServerReachable(false);
            return;
        }
        try {
            // Ping a lightweight endpoint
            await api.get('/api/courses', { timeout: 5000 });
            setIsServerReachable(true);
        } catch (e) {
            setIsServerReachable(false);
        }
     };

     checkReachability();
     heartbeat = setInterval(checkReachability, 120000); // Pulse every 60s
     return () => clearInterval(heartbeat);
  }, [isOnline]);


  const processAction = useCallback(async (action: any) => {

    try {
      await dbService.updateActionStatus(action.id, 'syncing');
      
      let success = false;
      switch (action.type) {
        case 'UPDATE_PROGRESS': {
          const { courseId, userId, percentage, completedLessons, resumePoint } = action.payload;
          const result = await eduService.updateProgress(courseId, userId, percentage, completedLessons, resumePoint);
          if (result) {
            success = true;
            queryClient.invalidateQueries({ queryKey: eduKeys.progress(courseId, userId) });
          }
          break;
        }
        case 'EARN_CREDITS': {
          const { userId, adToken } = action.payload;
          const result = await walletService.addCredits(userId, adToken);
          if (result && result.success) {
            success = true;
            queryClient.invalidateQueries({ queryKey: walletKeys.balance(userId) });
          }
          break;
        }
        case 'SPEND_CREDITS': {
          const { userId, amount, reason } = action.payload;
          const result = await walletService.deductCredits(userId, amount, reason);
          if (result && result.success) {
            success = true;
            queryClient.invalidateQueries({ queryKey: walletKeys.balance(userId) });
          }
          break;
        }
        case 'UPDATE_PROFILE': {
          const { userId, data } = action.payload;
          const cleanData = { ...data, userId };
          const res = await api.patch(`/api/profile/${userId}`, cleanData);
          if (res.data) {
            success = true;
            // Update local SQLite with authoritative server data
            await dbService.upsert('profiles', userId, res.data);
            queryClient.invalidateQueries({ queryKey: profileKeys.item(userId) });
          }
          break;
        }
        default:

          console.warn(`Unknown action type: ${action.type}`);
          success = true;
      }

      if (success) {
        await dbService.deleteAction(action.id);
      } else {
        await dbService.updateActionStatus(action.id, 'failed', action.attempts + 1);
      }
    } catch (error: any) {
      console.error(`Error processing action ${action.id}:`, error);
      await dbService.updateActionStatus(action.id, 'failed', (action.attempts || 0) + 1);
    }
  }, [queryClient]);

  // Sync loop
  useEffect(() => {
    let interval: any;
    
    const checkSync = async () => {
      const pending = await dbService.getPendingActions();
      setPendingCount(pending.length);
      
      if (isOnline && pending.length > 0) {
        // Process one at a time for safety
        await processAction(pending[0]);
      }
    };

    checkSync();
    interval = setInterval(checkSync, 10000); // Check every 10s
    
    return () => clearInterval(interval);
  }, [isOnline, processAction]);

  return (
    <SyncContext.Provider value={{ isOnline, isServerReachable, pendingCount }}>
      {children}
    </SyncContext.Provider>
  );

};


export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) throw new Error('useSync must be used within a SyncProvider');
  return context;
};
