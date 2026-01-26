import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eduService } from '../services/eduService';
import { dbService } from '../services/dbService';
import { eduKeys } from './useEduQueries';
import NetInfo from '@react-native-community/netinfo';

export const useEduMutations = () => {
  const queryClient = useQueryClient();

  const updateProgressMutation = useMutation({
    mutationFn: async (params: {
      courseId: string;
      userId: string;
      percentage: number;
      completedLessons?: string[];
      resumePoint?: string;
    }) => {
      const netInfo = await NetInfo.fetch();
      
      // OPTIMISTIC UPDATE: Local SQLite first
      await dbService.upsert('progress', `${params.courseId}:${params.userId}`, {
        courseId: params.courseId,
        userId: params.userId,
        percentage: params.percentage,
        completedLessons: params.completedLessons,
        resumePoint: params.resumePoint
      });


      queryClient.setQueryData(
        eduKeys.progress(params.courseId, params.userId),
        (old: any) => ({ ...old, percentage: params.percentage })
      );

      if (netInfo.isConnected) {
        const result = await eduService.updateProgress(
          params.courseId,
          params.userId,
          params.percentage,
          params.completedLessons,
          params.resumePoint
        );
        if (result) return result;
      }

      // OFFLINE or FAILED: Add to SQLite outbox
      await dbService.addAction('UPDATE_PROGRESS', params);
      return { status: 'queued_offline' };
    },
    onSuccess: (data: any, variables) => {
      if (data?.status !== 'queued_offline') {
        queryClient.invalidateQueries({
          queryKey: eduKeys.progress(variables.courseId, variables.userId),
        });
      }
    },
  });

  return {
    updateProgress: updateProgressMutation.mutateAsync,
    isUpdating: updateProgressMutation.isPending,
  };
};

