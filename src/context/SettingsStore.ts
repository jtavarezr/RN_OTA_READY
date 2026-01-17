import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  autoUpdate: boolean;
  toggleAutoUpdate: () => void;
  setAutoUpdate: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      autoUpdate: false,
      toggleAutoUpdate: () => set((state) => ({ autoUpdate: !state.autoUpdate })),
      setAutoUpdate: (enabled) => set({ autoUpdate: enabled }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
