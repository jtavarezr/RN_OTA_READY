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
  incrementTotalHours: (hours: number) => void;
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      coursesProgress: {},
      streak: 0,
      totalHours: 0,

      updateProgress: (courseId, progress) => {
        const now = Date.now();
        const today = new Date().toDateString();
        
        set((state) => {
          const prevProgress = state.coursesProgress[courseId]?.progress || 0;
          const isCompleting = prevProgress < 100 && progress === 100;
          
          // Basic streak logic: if they did something today
          // This should ideally be more robust (checking consecutive days)
          // For MVP, we'll increment streak if last activity was yesterday
          const lastActivityDate = state.coursesProgress && Object.values(state.coursesProgress).length > 0 
            ? new Date(Math.max(...Object.values(state.coursesProgress).map(p => p.lastAccessed))).toDateString()
            : null;
          
          let newStreak = state.streak;
          if (lastActivityDate !== today) {
             // If last activity was yesterday, increment. If older, reset to 1.
             // Simplified: just set to 1 if first today or increment if yesterday.
             newStreak = state.streak === 0 ? 1 : state.streak + 1; 
          }

          return {
            streak: newStreak,
            coursesProgress: {
              ...state.coursesProgress,
              [courseId]: {
                courseId,
                progress: Math.min(100, Math.max(0, progress)),
                lastAccessed: now,
              },
            },
          };
        });
      },

      incrementTotalHours: (hours: number) => {
        set((state) => ({ totalHours: state.totalHours + hours }));
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
