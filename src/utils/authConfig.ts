export const getAuthProvider = () => {
  return (process.env.EXPO_PUBLIC_AUTH_PROVIDER as 'appwrite' | 'supabase' | 'firebase' | undefined) ?? 'appwrite';
};
