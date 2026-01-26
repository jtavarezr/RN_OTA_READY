import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { dbService } from '../services/dbService';
import NetInfo from '@react-native-community/netinfo';

export const profileKeys = {
  all: ['profile'] as const,
  item: (userId: string) => [...profileKeys.all, userId] as const,
};

export const useProfile = (userId: string) => {
  return useQuery({
    queryKey: profileKeys.item(userId),
    queryFn: async () => {
      // 1. Try to get from SQLite first
      const cached = await dbService.getById('profiles', userId);
      
      // 2. Fetch from server in background if online
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        try {
          const { data } = await api.get(`/api/profile/${userId}`);
          if (data && !data.error) {
            await dbService.upsert('profiles', userId, data);
            return data;
          }
        } catch (e: any) {
          console.error('Fetch profile failed:', e?.message || e);
        }

      }
      
      return cached || null;

    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 0,
  });
};


export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { userId: string; data: any }) => {
      const netInfo = await NetInfo.fetch();

      // OPTIMISTIC UPDATE: Update SQLite immediately
      await dbService.upsert('profiles', params.userId, params.data);
      queryClient.setQueryData(profileKeys.item(params.userId), params.data);

      if (netInfo.isConnected) {
        try {
          const cleanData = { ...params.data, userId: params.userId };
          const res = await api.patch(`/api/profile/${params.userId}`, cleanData);
          return res.data;
        } catch (e) {
          console.error('Online profile update failed, queuing...', e);
        }
      }

      // OFFLINE or FAILED: Add to SQLite outbox
      await dbService.addAction('UPDATE_PROFILE', params);
      return { status: 'queued_offline' };
    },
    onSuccess: (data, variables) => {
      if ((data as any)?.status !== 'queued_offline') {
        queryClient.invalidateQueries({ queryKey: profileKeys.item(variables.userId) });
      }
    },
  });
};
