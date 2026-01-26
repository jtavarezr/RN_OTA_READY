// src/services/eduService.ts
// const API_URL = 'http://localhost:3030/api'; // Localhost for simulator might need 10.0.2.2 or machine IP
// For now, let's assume localhost works (e.g. iOS simulator) or user sets valid IP.
// Better to use a relative path if proxied, but React Native needs absolute.
const API_URL = `${process.env.EXPO_PUBLIC_API_BASE_URL}/api`; // Ensure /api prefix

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
      const url = new URL(`${API_URL}/courses`);
      if (category) url.searchParams.append('category', category);
      
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch courses');
      const data = await response.json();
      return Array.isArray(data) ? data : data.documents;
    } catch (error) {
      console.error('EduService getCourses error:', error);
      return [];
    }
  },

  async getCourse(id: string): Promise<Course | null> {
    try {
      const response = await fetch(`${API_URL}/courses/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch course: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('EduService getCourse error:', error);
      return null;
    }
  },

  async getQuestions(category?: string, difficulty?: string): Promise<Question[]> {
    try {
       const url = new URL(`${API_URL}/questions`);
       if (category) url.searchParams.append('category', category);
       if (difficulty) url.searchParams.append('difficulty', difficulty);

       const response = await fetch(url.toString());
       if (!response.ok) throw new Error('Failed to fetch questions');
       const data = await response.json();
       return Array.isArray(data) ? data : data.documents;
    } catch (error) {
       console.error('EduService getQuestions error:', error);
       return [];
    }
  },

  async updateProgress(courseId: string, userId: string, percentage: number, completedLessons: string[] = [], resumePoint: string = '') {
    try {
      const response = await fetch(`${API_URL}/courses/${courseId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          percentage,
          completedLessons,
          resumePoint
        })
      });
      if (!response.ok) throw new Error('Failed to update progress');
      return await response.json();
    } catch (error) {
      console.error('EduService updateProgress error:', error);
      return null;
    }
  },

  async getProgress(courseId: string, userId: string) {
    try {
      const response = await fetch(`${API_URL}/courses/${courseId}/progress?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch progress');
      return await response.json();
    } catch (error) {
      console.error('EduService getProgress error:', error);
      return { percentage: 0 };
    }
  },

  async getCategories(): Promise<string[]> {
    try {
      const response = await fetch(`${API_URL}/questions/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      return await response.json();
    } catch (error) {
      console.error('EduService getCategories error:', error);
      return [];
    }
  }
};
