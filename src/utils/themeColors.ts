export interface ThemeColors {
  primary: string;
  primaryMuted: string;
  background: string;
  card: string;
  cardBorder: string;
  textMain: string;
  textSecondary: string;
  success: string;
  warning: string;
  error: string;
  reputation: string;
}

export const getThemeColors = (theme: 'light' | 'dark'): ThemeColors => ({
  primary: '#6366f1',
  primaryMuted: 'rgba(99,102,241,0.1)',
  background: theme === 'dark' ? '#111827' : '#f9fafb',
  card: theme === 'dark' ? '#1f2937' : '#ffffff',
  cardBorder: theme === 'dark' ? '#374151' : '#e5e7eb',
  textMain: theme === 'dark' ? '#f9fafb' : '#1f2937',
  textSecondary: theme === 'dark' ? '#9ca3af' : '#6b7280',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  reputation: '#ec4899',
});
