import { useQuery } from '@tanstack/react-query';
import { eduService, Course, Question } from '../services/eduService';
import { dbService } from '../services/dbService';
import NetInfo from '@react-native-community/netinfo';

export const eduKeys = {
  all: ['edu'] as const,
  courses: (category?: string) => [...eduKeys.all, 'courses', { category }] as const,
  course: (id: string) => [...eduKeys.all, 'course', id] as const,
  questions: (category?: string, difficulty?: string) => [...eduKeys.all, 'questions', { category, difficulty }] as const,
  categories: () => [...eduKeys.all, 'categories'] as const,
  progress: (courseId: string, userId: string) => [...eduKeys.all, 'progress', { courseId, userId }] as const,
};

export const useCourses = (category?: string) => {
  return useQuery({
    queryKey: eduKeys.courses(category),
    queryFn: async () => {
      const cached = await dbService.getAll('courses', category ? 'category = ?' : undefined, category ? [category] : []);
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        try {
          const remote = await eduService.getCourses(category);
          if (remote && remote.length > 0) {
            for (const course of remote) {
              await dbService.upsert('courses', course.$id, course);
            }
            return remote;
          }
        } catch (e) {
          console.error('useCourses fetch failed, using cache', e);
        }
      }
      return cached;

    },
  });
};

export const useCourse = (id: string) => {
  return useQuery({
    queryKey: eduKeys.course(id),
    queryFn: async () => {
      const cached = await dbService.getById('courses', id);
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        try {
          const remote = await eduService.getCourse(id);
          if (remote) {
            await dbService.upsert('courses', id, remote);
            return remote;
          }
        } catch (e) {
          console.error('useCourse fetch failed, using cache', e);
        }
      }
      return cached;

    },
    enabled: !!id,
  });
};

export const useQuestions = (category?: string, difficulty?: string) => {
  return useQuery({
    queryKey: eduKeys.questions(category, difficulty),
    queryFn: async () => {
      let filter = '';
      let params: any[] = [];
      if (category) { filter += 'category = ?'; params.push(category); }
      if (difficulty) { 
        if (filter) filter += ' AND ';
        filter += 'difficulty = ?'; 
        params.push(difficulty); 
      }
      
      const cached = await dbService.getAll('questions', filter || undefined, params);
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        try {
          const remote = await eduService.getQuestions(category, difficulty);
          if (remote && remote.length > 0) {
            for (const q of remote) {
              await dbService.upsert('questions', q.$id, q);
            }
            return remote;
          }
        } catch (e) {
          console.error('useQuestions fetch failed, using cache', e);
        }
      }
      return cached;

    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: eduKeys.categories(),
    queryFn: () => eduService.getCategories(),
  });
};

export const useProgress = (courseId: string, userId: string) => {
  return useQuery({
    queryKey: eduKeys.progress(courseId, userId),
    queryFn: async () => {
      const cached = await dbService.getById('progress', `${courseId}:${userId}`);
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        try {
          const remote = await eduService.getProgress(courseId, userId);
          if (remote) {
            await dbService.upsert('progress', `${courseId}:${userId}`, { ...remote, courseId, userId });
            return remote;
          }
        } catch (e) {
          console.error('useProgress fetch failed, using cache', e);
        }
      }
      return cached || { percentage: 0 };

    },
    enabled: !!courseId && !!userId,
  });
};

