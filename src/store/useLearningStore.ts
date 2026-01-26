import { create } from 'zustand';
import { dbService } from '../services/dbService';

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
  init: () => Promise<void>;
  updateProgress: (courseId: string, progress: number, userId: string) => void;
  getCourseProgress: (courseId: string) => number;

  getOverallProgress: () => number[];
  getStats: () => { inProgress: number; completed: number; totalHours: number; streak: number };
  incrementTotalHours: (hours: number) => void;
}

export const useLearningStore = create<LearningState>()((set, get) => ({
  coursesProgress: {},
  streak: 0,
  totalHours: 0,

  init: async () => {
    const streak = await dbService.getStat('streak', 0);
    const totalHours = await dbService.getStat('totalHours', 0);
    const progresses = await dbService.getAll('progress');
    
    const progressMap: Record<string, CourseProgress> = {};
    progresses.forEach((p: any) => {
      progressMap[p.courseId] = {
        courseId: p.courseId,
        progress: p.percentage,
        lastAccessed: p.lastSync
      };
    });

    set({ streak, totalHours, coursesProgress: progressMap });
  },

  updateProgress: (courseId, progress, userId) => {
    const now = Date.now();
    const today = new Date().toDateString();
    
    set((state) => {
      const prevProgress = state.coursesProgress[courseId]?.progress || 0;
      
      const lastActivityDate = state.coursesProgress && Object.values(state.coursesProgress).length > 0 
        ? new Date(Math.max(...Object.values(state.coursesProgress).map(p => p.lastAccessed))).toDateString()
        : null;
      
      let newStreak = state.streak;
      if (lastActivityDate !== today) {
         newStreak = state.streak === 0 ? 1 : state.streak + 1; 
         dbService.setStat('streak', newStreak);
      }

      const updatedProgress = {
        courseId,
        progress: Math.min(100, Math.max(0, progress)),
        lastAccessed: now,
      };

      // Background SQLite update
      dbService.upsert('progress', `${courseId}:${userId}`, {
         courseId: courseId,
         userId: userId,
         percentage: updatedProgress.progress,
         lastSync: now
      });



      return {
        streak: newStreak,
        coursesProgress: {
          ...state.coursesProgress,
          [courseId]: updatedProgress,
        },
      };
    });
  },

  incrementTotalHours: (hours: number) => {
    set((state) => {
      const newTotal = state.totalHours + hours;
      dbService.setStat('totalHours', newTotal);
      return { totalHours: newTotal };
    });
  },

  getCourseProgress: (courseId) => {
    return get().coursesProgress[courseId]?.progress || 0;
  },

  getOverallProgress: () => {
    const progresses = Object.values(get().coursesProgress)
      .sort((a, b) => b.lastAccessed - a.lastAccessed)
      .slice(0, 5)
      .map((p) => p.progress);
    
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
}));

