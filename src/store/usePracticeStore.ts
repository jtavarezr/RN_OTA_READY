import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface QuizAttempt {
  id: string;
  category: string;
  score: number;
  totalQuestions: number;
  timestamp: number;
}

interface PracticeState {
  attempts: QuizAttempt[];
  addAttempt: (attempt: Omit<QuizAttempt, 'id' | 'timestamp'>) => void;
  getStats: () => {
    totalQuizzes: number;
    averageScore: number;
    topCategory: string;
    totalQuestionsAnswered: number;
  };
}

export const usePracticeStore = create<PracticeState>()(
  persist(
    (set, get) => ({
      attempts: [],

      addAttempt: (data) => {
        const newAttempt: QuizAttempt = {
          ...data,
          id: Math.random().toString(36).substring(7),
          timestamp: Date.now(),
        };
        set((state) => ({
          attempts: [newAttempt, ...state.attempts].slice(0, 50), // Keep last 50
        }));
      },

      getStats: () => {
        const { attempts } = get();
        if (attempts.length === 0) {
          return { totalQuizzes: 0, averageScore: 0, topCategory: 'N/A', totalQuestionsAnswered: 0 };
        }

        const totalQuizzes = attempts.length;
        const totalScore = attempts.reduce((acc, a) => acc + (a.score / a.totalQuestions), 0);
        const totalQuestionsAnswered = attempts.reduce((acc, a) => acc + a.totalQuestions, 0);
        
        // Find top category
        const catMap: Record<string, number> = {};
        attempts.forEach(a => {
          catMap[a.category] = (catMap[a.category] || 0) + 1;
        });
        const topCategory = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0][0];

        return {
          totalQuizzes,
          averageScore: Math.round((totalScore / totalQuizzes) * 100),
          topCategory,
          totalQuestionsAnswered
        };
      },
    }),
    {
      name: 'practice-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
