import { api } from './api';

export interface Course {
  $id: string;
  title: string;
  provider: string;
  category: string;
  url: string;
  thumbnail: string;
  description: string;
  type: 'videocurso' | 'guided';
  status: 'active' | 'inactive';
}

export interface Question {
  $id: string;
  text: string;
  options: string; // JSON string
  correctAnswer: string;
  explanation: string;
  category: string;
  difficulty: string;
}

export const eduService = {
  async getCourses(category?: string): Promise<Course[]> {
    try {
      const response = await api.get('/api/courses', {
        params: { category }
      });
      const data = response.data;
      const courses = Array.isArray(data) ? data : data.documents;
      console.log(`[EduSync] Courses received: ${courses.length}`);
      return courses;

    } catch (error) {
      console.error('EduService getCourses error:', error);
      return [];
    }
  },

  async getCourse(id: string): Promise<Course | null> {
    try {
      const response = await api.get(`/api/courses/${id}`);
      return response.data;
    } catch (error) {
      console.error('EduService getCourse error:', error);
      return null;
    }
  },

  async getQuestions(category?: string, difficulty?: string): Promise<Question[]> {
    try {
       const response = await api.get('/api/questions', {
         params: { category, difficulty }
       });
       const data = response.data;
       return Array.isArray(data) ? data : data.documents;
    } catch (error) {
       console.error('EduService getQuestions error:', error);
       return [];
    }
  },

  async updateProgress(courseId: string, userId: string, percentage: number, completedLessons: string[] = [], resumePoint: string = '') {
    try {
      const response = await api.post(`/api/courses/${courseId}/progress`, {
          userId,
          percentage,
          completedLessons,
          resumePoint
      });
      return response.data;
    } catch (error) {
      console.error('EduService updateProgress error:', error);
      return null;
    }
  },

  async getProgress(courseId: string, userId: string) {
    try {
      const response = await api.get(`/api/courses/${courseId}/progress`, {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      console.error('EduService getProgress error:', error);
      return { percentage: 0 };
    }
  },

  async getCategories(): Promise<string[]> {
    try {
      const response = await api.get('/api/questions/categories');
      console.log(`[EduSync] Categories received: ${response.data.length}`);
      return response.data;

    } catch (error) {
      console.error('EduService getCategories error:', error);
      return [];
    }
  }
};

