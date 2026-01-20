import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  autoUpdate: boolean;
  toggleAutoUpdate: () => void;
  setAutoUpdate: (enabled: boolean) => void;

  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  buttonColor: string;
  setButtonColor: (color: string) => void;
  fontColor: string | null;
  setFontColor: (color: string | null) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      autoUpdate: false,
      toggleAutoUpdate: () => set((state) => ({ autoUpdate: !state.autoUpdate })),
      setAutoUpdate: (enabled) => set({ autoUpdate: enabled }),

      primaryColor: '#6366f1',
      setPrimaryColor: (color) => set({ primaryColor: color }),
      buttonColor: '#6366f1',
      setButtonColor: (color) => set({ buttonColor: color }),
      fontColor: null,
      setFontColor: (color) => set({ fontColor: color }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
