import { create } from 'zustand';
import { dbService } from '../services/dbService';

export interface QuizAttempt {
  id: string;
  category: string;
  score: number;
  totalQuestions: number;
  timestamp: number;
}

interface PracticeState {
  attempts: QuizAttempt[];
  init: () => Promise<void>;
  addAttempt: (attempt: Omit<QuizAttempt, 'id' | 'timestamp'>) => Promise<void>;
  getStats: () => {
    totalQuizzes: number;
    averageScore: number;
    topCategory: string;
    totalQuestionsAnswered: number;
  };
}

export const usePracticeStore = create<PracticeState>()((set, get) => ({
  attempts: [],

  init: async () => {
    // We'll store quiz attempts in a generic table or specialized one. 
    // For simplicity, let's assume 'questions' table isn't it, 
    // and we use system_stats for small collections or create a specific table.
    // IMPROVEMENT: Use system_stats for now or a dedicated table if we want to be strict.
    // To match 'todo SQLite', let's use a dedicated table or JSON in system_stats.
    const attempts = await dbService.getStat('quiz_attempts', []);
    set({ attempts });
  },

  addAttempt: async (data) => {
    const newAttempt: QuizAttempt = {
      ...data,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
    };
    
    set((state) => {
      const newAttempts = [newAttempt, ...state.attempts].slice(0, 50);
      dbService.setStat('quiz_attempts', newAttempts);
      return { attempts: newAttempts };
    });
  },

  getStats: () => {
    const { attempts } = get();
    if (attempts.length === 0) {
      return { totalQuizzes: 0, averageScore: 0, topCategory: 'N/A', totalQuestionsAnswered: 0 };
    }

    const totalQuizzes = attempts.length;
    const totalScore = attempts.reduce((acc, a) => acc + (a.score / a.totalQuestions), 0);
    const totalQuestionsAnswered = attempts.reduce((acc, a) => acc + a.totalQuestions, 0);
    
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
}));

