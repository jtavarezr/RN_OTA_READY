import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Course {
  id: string;
  title: string;
  provider: string;
  category: string;
  url: string;
  thumbnail?: string;
}

export interface CourseProgress {
  courseId: string;
  progress: number; // 0 to 100
  lastAccessed: number;
}

interface LearningState {
  coursesProgress: Record<string, CourseProgress>;
  streak: number;
  totalHours: number;
  updateProgress: (courseId: string, progress: number) => void;
  getCourseProgress: (courseId: string) => number;
  getOverallProgress: () => number[];
  getStats: () => { inProgress: number; completed: number; totalHours: number; streak: number };
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      coursesProgress: {},
      streak: 14, // Mock initial value or handle logic
      totalHours: 127, // Mock initial value

      updateProgress: (courseId, progress) => {
        set((state) => ({
          coursesProgress: {
            ...state.coursesProgress,
            [courseId]: {
              courseId,
              progress: Math.min(100, Math.max(0, progress)),
              lastAccessed: Date.now(),
            },
          },
        }));
      },

      getCourseProgress: (courseId) => {
        return get().coursesProgress[courseId]?.progress || 0;
      },

      getOverallProgress: () => {
        const progresses = Object.values(get().coursesProgress)
          .sort((a, b) => b.lastAccessed - a.lastAccessed)
          .slice(0, 5)
          .map((p) => p.progress);
        
        // Return at least some data for the chart if empty
        return progresses.length > 0 ? progresses : [0, 0, 0, 0, 0];
      },

      getStats: () => {
        const progresses = Object.values(get().coursesProgress);
        const inProgress = progresses.filter(p => p.progress > 0 && p.progress < 100).length;
        const completed = progresses.filter(p => p.progress === 100).length;
        return {
          inProgress: inProgress || 0,
          completed: completed || 0,
          totalHours: get().totalHours,
          streak: get().streak,
        };
      },
    }),
    {
      name: 'learning-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
