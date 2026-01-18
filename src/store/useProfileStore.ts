import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

interface ProfileState {
  profile: any | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchProfile: (userId: string, force?: boolean) => Promise<void>;
  setProfile: (data: any) => void;
  updateProfile: (userId: string, data: any) => Promise<void>;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      loading: false,
      error: null,
      lastFetched: null,

      fetchProfile: async (userId: string, force = false) => {
        const { lastFetched, profile } = get();
        const now = Date.now();
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

        // Return cached if valid and not forcing
        if (!force && profile && lastFetched && (now - lastFetched < CACHE_DURATION)) {
          return;
        }

        set({ loading: true, error: null });
        try {
          const { data } = await api.get(`/api/profile/${userId}`);
          set({ profile: data, loading: false, lastFetched: now });
        } catch (error: any) {
          console.error('Fetch Profile Error:', error);
          set({ error: error.message || 'Failed to fetch profile', loading: false });
        }
      },

      setProfile: (data: any) => set({ profile: data, lastFetched: Date.now() }),

      updateProfile: async (userId: string, data: any) => {
        set({ loading: true, error: null });
        try {
            const cleanData = { ...data, userId }; 
            const res = await api.patch(`/api/profile/${userId}`, cleanData);
            set({ profile: res.data, loading: false, lastFetched: Date.now() });
        } catch (error: any) {
            console.error('Update Profile Error:', error);
            set({ error: error.message || 'Failed to update profile', loading: false });
            throw error;
        }
      },

      clearProfile: () => set({ profile: null, lastFetched: null, error: null }),
    }),
    {
      name: 'profile-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
