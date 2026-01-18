import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { account, ID } from '../services/appwrite';
import { Models } from 'appwrite';
import { firebaseAuth, firebaseLogin, firebaseLogout, firebaseRecoverPassword, firebaseRegister, FirebaseUser } from '../services/firebase';
import { supabase, SupabaseUser } from '../services/supabase';
import { getAuthProvider } from '../utils/authConfig';
import api from '../services/api';

type AuthProviderName = 'appwrite' | 'supabase' | 'firebase';

type AuthUser = Models.User<Models.Preferences> | FirebaseUser | SupabaseUser | null;

type CachedSession = {
  provider: AuthProviderName;
  user: any;
  updatedAt: number;
  expiresAt: number;
};

interface AuthContextType {
  user: AuthUser;
  loading: boolean;
  isOfflineSession: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  recoverPassword: (email: string) => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isOfflineSession: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  recoverPassword: async () => {},
  checkSession: async () => {},
});

const AUTH_SESSION_KEY = 'auth:session';

const getCacheTtlMs = () => {
  const fromEnv = process.env.EXPO_PUBLIC_AUTH_CACHE_TTL_HOURS;
  const hours = fromEnv ? Number(fromEnv) : 24;
  const safeHours = Number.isFinite(hours) && hours > 0 ? hours : 24;
  return safeHours * 60 * 60 * 1000;
};

const isNetworkError = (error: unknown) => {
  if (!error) {
    return false;
  }
  const anyError = error as any;
  const message = String(anyError.message ?? '').toLowerCase();
  const code = String(anyError.code ?? '').toLowerCase();
  const name = String(anyError.name ?? '').toLowerCase();
  const patterns = ['network', 'timeout', 'timed out', 'failed to fetch', 'ecconnrefused', 'econnreset', 'enotfound', 'socket', 'offline'];
  if (patterns.some((p) => message.includes(p))) {
    return true;
  }
  if (patterns.some((p) => code.includes(p))) {
    return true;
  }
  if (patterns.some((p) => name.includes(p))) {
    return true;
  }
  return false;
};

const serializeUser = (provider: AuthProviderName, user: AuthUser) => {
  if (!user) {
    return null;
  }
  const anyUser: any = user;
  const id = anyUser.$id || anyUser.uid || anyUser.id || '';
  const email = anyUser.email ?? null;
  const name = anyUser.name || anyUser.displayName || null;
  return {
    provider,
    $id: id || undefined,
    uid: anyUser.uid,
    id: anyUser.id,
    email,
    name,
  };
};

type AuthProviderProps = {
  children: React.ReactNode;
  skipInitialCheck?: boolean;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, skipInitialCheck }) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);
  const [isOfflineSession, setIsOfflineSession] = useState(false);

  useEffect(() => {
    if (!skipInitialCheck) {
      checkSession();
    }
  }, [skipInitialCheck]);

  const persistSession = async (provider: AuthProviderName, rawUser: AuthUser) => {
    if (!rawUser) {
      await AsyncStorage.removeItem(AUTH_SESSION_KEY);
      setIsOfflineSession(false);
      return;
    }
    const normalized = serializeUser(provider, rawUser);
    if (!normalized) {
      await AsyncStorage.removeItem(AUTH_SESSION_KEY);
      setIsOfflineSession(false);
      return;
    }
    const now = Date.now();
    const ttlMs = getCacheTtlMs();
    const cachedSession: CachedSession = {
      provider,
      user: normalized,
      updatedAt: now,
      expiresAt: now + ttlMs,
    };
    await AsyncStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(cachedSession));
    setIsOfflineSession(false);
  };

  const clearSession = async () => {
    await AsyncStorage.removeItem(AUTH_SESSION_KEY);
    setIsOfflineSession(false);
  };

  const tryLoadCachedSessionForCurrentProvider = async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_SESSION_KEY);
      if (!stored) {
        return false;
      }
      const parsed = JSON.parse(stored) as CachedSession;
      const currentProvider = getAuthProvider();
      if (!parsed || parsed.provider !== currentProvider) {
        return false;
      }
      if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
        await AsyncStorage.removeItem(AUTH_SESSION_KEY);
        return false;
      }
      if (!parsed.user) {
        return false;
      }
      setUser(parsed.user as AuthUser);
      setIsOfflineSession(true);
      return true;
    } catch {
      return false;
    }
  };

  const checkSession = async () => {
    setLoading(true);
    try {
      const provider = getAuthProvider() as AuthProviderName;
      if (provider === 'firebase') {
        const current = firebaseAuth.currentUser;
        setUser(current as FirebaseUser | null);
        await persistSession(provider, current as AuthUser);
      } else if (provider === 'supabase') {
        const { data } = await supabase.auth.getUser();
        setUser(data.user as SupabaseUser | null);
        await persistSession(provider, data.user as AuthUser);
      } else {
        const session = await account.get();
        setUser(session);
        await persistSession(provider, session as AuthUser);
      }
    } catch {
      const usedCache = await tryLoadCachedSessionForCurrentProvider();
      if (!usedCache) {
        setUser(null);
        setIsOfflineSession(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const provider = getAuthProvider() as AuthProviderName;
      let finalUser: AuthUser = null;
      if (provider === 'firebase') {
        const credentials = await firebaseLogin(email, password);
        finalUser = credentials.user as FirebaseUser;
      } else if (provider === 'supabase') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        finalUser = data.user as SupabaseUser | null;
      } else {
        await account.createEmailPasswordSession(email, password);
        finalUser = await account.get();
      }
      
      setUser(finalUser);
      await persistSession(provider, finalUser);

      // Ensure profile exists in Appwrite via bridge server
      if (finalUser) {
        const uid = (finalUser as any).$id || (finalUser as any).uid || (finalUser as any).id;
        if (uid) {
          // Trigger profile creation/fetch in background
          api.get(`/api/profile/${uid}`).catch(err => console.error("Error ensuring profile:", err));
        }
      }
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setLoading(true);
    try {
      const provider = getAuthProvider() as AuthProviderName;
      let finalUser: AuthUser = null;
      if (provider === 'firebase') {
        const credentials = await firebaseRegister(email, password);
        finalUser = credentials.user as FirebaseUser;
        setUser(finalUser);
        await persistSession(provider, finalUser);
      } else if (provider === 'supabase') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        finalUser = data.user as SupabaseUser | null;
        setUser(finalUser);
        await persistSession(provider, finalUser);
      } else {
        await account.create(ID.unique(), email, password);
        await login(email, password);
        return; // login already handles profile association
      }

      // Ensure profile exists in Appwrite via bridge server (for Firebase/Supabase)
      if (finalUser) {
        const uid = (finalUser as any).$id || (finalUser as any).uid || (finalUser as any).id;
        if (uid) {
          api.get(`/api/profile/${uid}`).catch(err => console.error("Error ensuring profile:", err));
        }
      }
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const provider = getAuthProvider() as AuthProviderName;
      if (provider === 'firebase') {
        await firebaseLogout();
      } else if (provider === 'supabase') {
        await supabase.auth.signOut();
      } else {
        await account.deleteSession('current');
      }
    } catch {
      // Ignore remote logout errors and proceed with local cleanup
    } finally {
      setUser(null);
      await clearSession();
      setLoading(false);
    }
  };

  const recoverPassword = async (email: string) => {
    const provider = getAuthProvider() as AuthProviderName;
    if (provider === 'firebase') {
      await firebaseRecoverPassword(email);
      return;
    }
    if (provider === 'supabase') {
      await supabase.auth.resetPasswordForEmail(email);
      return;
    }
    await account.createRecovery(email, 'https://dev.tavarez.app.jobsprepai/recovery');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isOfflineSession,
        login,
        register,
        logout,
        recoverPassword,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
