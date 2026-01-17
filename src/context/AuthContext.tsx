import React, { createContext, useContext, useEffect, useState } from 'react';
import { account, ID } from '../services/appwrite';
import { Models } from 'appwrite';
import { firebaseAuth, firebaseLogin, firebaseLogout, firebaseRecoverPassword, firebaseRegister, FirebaseUser } from '../services/firebase';
import { supabase, SupabaseUser } from '../services/supabase';
import { getAuthProvider } from '../utils/authConfig';

type AuthUser = Models.User<Models.Preferences> | FirebaseUser | SupabaseUser | null;

interface AuthContextType {
  user: AuthUser;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  recoverPassword: (email: string) => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  recoverPassword: async () => {},
  checkSession: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    setLoading(true);
    try {
      const provider = getAuthProvider();
      if (provider === 'firebase') {
        const current = firebaseAuth.currentUser;
        setUser(current as FirebaseUser | null);
      } else if (provider === 'supabase') {
        const { data } = await supabase.auth.getUser();
        setUser(data.user as SupabaseUser | null);
      } else {
        const session = await account.get();
        setUser(session);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const provider = getAuthProvider();
      if (provider === 'firebase') {
        const credentials = await firebaseLogin(email, password);
        setUser(credentials.user as FirebaseUser);
      } else if (provider === 'supabase') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          throw error;
        }
        setUser(data.user as SupabaseUser | null);
      } else {
        await account.createEmailPasswordSession(email, password);
        const session = await account.get();
        setUser(session);
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
      const provider = getAuthProvider();
      if (provider === 'firebase') {
        const credentials = await firebaseRegister(email, password);
        setUser(credentials.user as FirebaseUser);
      } else if (provider === 'supabase') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          throw error;
        }
        setUser(data.user as SupabaseUser | null);
      } else {
        await account.create(ID.unique(), email, password);
        await login(email, password);
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
      const provider = getAuthProvider();
      if (provider === 'firebase') {
        await firebaseLogout();
        setUser(null);
      } else if (provider === 'supabase') {
        await supabase.auth.signOut();
        setUser(null);
      } else {
        await account.deleteSession('current');
        setUser(null);
      }
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const recoverPassword = async (email: string) => {
    const provider = getAuthProvider();
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
    <AuthContext.Provider value={{ user, loading, login, register, logout, recoverPassword, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
