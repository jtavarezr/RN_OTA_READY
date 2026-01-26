import { useQuery } from '@tanstack/react-query';
import walletService from '../services/walletService';
import { dbService } from '../services/dbService';
import NetInfo from '@react-native-community/netinfo';

export const walletKeys = {
  all: ['wallet'] as const,
  balance: (userId: string) => [...walletKeys.all, 'balance', userId] as const,
  transactions: (userId: string) => [...walletKeys.all, 'transactions', userId] as const,
  prices: () => [...walletKeys.all, 'prices'] as const,
};

export const useWalletBalance = (userId: string) => {
  return useQuery({
    queryKey: walletKeys.balance(userId),
    queryFn: async () => {
      const cached = await dbService.getById('wallet', userId);
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        try {
          const remote = await walletService.getBalance(userId);
          if (remote) {
            // Explicitly map server response to what we store and return
            const walletData = { userId, balance: remote.balance };
            await dbService.upsert('wallet', userId, walletData);
            return remote; // Server object: { balance: X, ... }
          }
        } catch (e) {
          console.error('Fetch wallet balance failed:', e);
        }
      }
      return cached || { balance: 0 };
    },
    enabled: !!userId,
  });
};

export const useWalletTransactions = (userId: string) => {
  return useQuery({
    queryKey: walletKeys.transactions(userId),
    queryFn: () => walletService.getTransactions(userId),
    enabled: !!userId,
  });
};

export const useWalletPrices = () => {
  return useQuery({
    queryKey: walletKeys.prices(),
    queryFn: () => walletService.getPrices(),
  });
};

