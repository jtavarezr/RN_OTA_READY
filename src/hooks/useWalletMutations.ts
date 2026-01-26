import { useMutation, useQueryClient } from '@tanstack/react-query';
import walletService from '../services/walletService';
import { dbService } from '../services/dbService';
import { walletKeys } from './useWalletQueries';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

export const useWalletMutations = () => {
  const queryClient = useQueryClient();

  const earnCreditsMutation = useMutation({
    mutationFn: async (params: { userId: string; adToken: string }) => {
      const netInfo = await NetInfo.fetch();

      if (!netInfo.isConnected) {
        Alert.alert('Offline', 'Debe estar en línea para ganar créditos.');
        throw new Error('Offline: Cannot earn credits');
      }

      try {
        const result = await walletService.addCredits(params.userId, params.adToken);
        if (result && result.success) return result;
        throw new Error('Failed to earn credits');
      } catch (e: any) {
        console.error('Earn credits failed:', e);
        throw e;
      }
    },
    onSuccess: (data: any, variables) => {
      queryClient.invalidateQueries({ queryKey: walletKeys.balance(variables.userId) });
    },
  });

  const spendCreditsMutation = useMutation({
    mutationFn: async (params: { userId: string; amount: number; reason: string }) => {
      const netInfo = await NetInfo.fetch();

      // OPTIMISTIC UPDATE
      queryClient.setQueryData(walletKeys.balance(params.userId), (old: any) => ({
        ...old,
        balance: (old?.balance || 0) - params.amount,
      }));

      if (netInfo.isConnected) {
        try {
          const result = await walletService.deductCredits(params.userId, params.amount, params.reason);
          if (result && result.success) return result;
        } catch (e) {
          console.error('Online spend credits failed, queuing...', e);
        }
      }

      // OFFLINE or FAILED: Queue Spend action
      await dbService.addAction('SPEND_CREDITS', params);
      return { success: true, status: 'queued_offline' };
    },
    onSuccess: (data: any, variables) => {
      if (data?.status !== 'queued_offline') {
        queryClient.invalidateQueries({ queryKey: walletKeys.balance(variables.userId) });
      }
    },
  });

  return {
    earnCredits: earnCreditsMutation.mutateAsync,
    spendCredits: spendCreditsMutation.mutateAsync,
    isEarning: earnCreditsMutation.isPending,
    isSpending: spendCreditsMutation.isPending,
  };
};

