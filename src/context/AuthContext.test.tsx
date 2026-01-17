import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from './AuthContext';
import * as authConfig from '../utils/authConfig';

jest.mock('../services/appwrite', () => ({
  account: {
    createEmailPasswordSession: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    deleteSession: jest.fn(),
    createRecovery: jest.fn(),
  },
  ID: { unique: () => 'unique-id' },
}));

jest.mock('../services/firebase', () => ({
  firebaseAuth: { currentUser: null },
  firebaseLogin: jest.fn(),
  firebaseRegister: jest.fn(),
  firebaseLogout: jest.fn(),
  firebaseRecoverPassword: jest.fn(),
}));

jest.mock('../services/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      getUser: jest.fn(),
    },
  },
}));

jest.mock('../utils/authConfig', () => ({
  getAuthProvider: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Appwrite Provider (Default)', () => {
    let appwriteMock: any;

    beforeEach(() => {
      (authConfig.getAuthProvider as jest.Mock).mockReturnValue('appwrite');
      appwriteMock = require('../services/appwrite').account;
    });

    it('login calls Appwrite createEmailPasswordSession', async () => {
      appwriteMock.createEmailPasswordSession.mockResolvedValue({});
      appwriteMock.get.mockResolvedValue({ $id: 'user123', email: 'test@example.com' });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider skipInitialCheck>{children}</AuthProvider>
      );
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      expect(appwriteMock.createEmailPasswordSession).toHaveBeenCalledWith('test@example.com', 'password');
      expect(result.current.user).toEqual({ $id: 'user123', email: 'test@example.com' });
    });

    it('register calls Appwrite create and then login', async () => {
      appwriteMock.create.mockResolvedValue({});
      appwriteMock.createEmailPasswordSession.mockResolvedValue({});
      appwriteMock.get.mockResolvedValue({ $id: 'user123', email: 'test@example.com' });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider skipInitialCheck>{children}</AuthProvider>
      );
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.register('test@example.com', 'password');
      });

      expect(appwriteMock.create).toHaveBeenCalledWith('unique-id', 'test@example.com', 'password');
      expect(appwriteMock.createEmailPasswordSession).toHaveBeenCalledWith('test@example.com', 'password');
    });

    it('logout calls Appwrite deleteSession', async () => {
      appwriteMock.deleteSession.mockResolvedValue({});

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider skipInitialCheck>{children}</AuthProvider>
      );
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.logout();
      });

      expect(appwriteMock.deleteSession).toHaveBeenCalledWith('current');
      expect(result.current.user).toBeNull();
    });
  });

  describe('Firebase Provider', () => {
    let firebaseMock: any;

    beforeEach(() => {
      (authConfig.getAuthProvider as jest.Mock).mockReturnValue('firebase');
      firebaseMock = require('../services/firebase');
    });

    it('login calls Firebase login', async () => {
      const mockUser = { uid: 'user123', email: 'test@example.com' };
      firebaseMock.firebaseLogin.mockResolvedValue({ user: mockUser });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider skipInitialCheck>{children}</AuthProvider>
      );
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      expect(firebaseMock.firebaseLogin).toHaveBeenCalledWith('test@example.com', 'password');
      expect(result.current.user).toEqual(mockUser);
    });

    it('register calls Firebase register', async () => {
      const mockUser = { uid: 'user123', email: 'test@example.com' };
      firebaseMock.firebaseRegister.mockResolvedValue({ user: mockUser });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider skipInitialCheck>{children}</AuthProvider>
      );
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.register('test@example.com', 'password');
      });

      expect(firebaseMock.firebaseRegister).toHaveBeenCalledWith('test@example.com', 'password');
      expect(result.current.user).toEqual(mockUser);
    });

    it('logout calls Firebase logout', async () => {
      firebaseMock.firebaseLogout.mockResolvedValue({});

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider skipInitialCheck>{children}</AuthProvider>
      );
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.logout();
      });

      expect(firebaseMock.firebaseLogout).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
    });
  });

  describe('Supabase Provider', () => {
    let supabaseMock: any;

    beforeEach(() => {
      (authConfig.getAuthProvider as jest.Mock).mockReturnValue('supabase');
      supabaseMock = require('../services/supabase').supabase;
    });

    it('login calls Supabase signInWithPassword', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' };
      supabaseMock.auth.signInWithPassword.mockResolvedValue({ data: { user: mockUser }, error: null });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider skipInitialCheck>{children}</AuthProvider>
      );
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      expect(supabaseMock.auth.signInWithPassword).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password' });
      expect(result.current.user).toEqual(mockUser);
    });

    it('register calls Supabase signUp', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' };
      supabaseMock.auth.signUp.mockResolvedValue({ data: { user: mockUser }, error: null });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider skipInitialCheck>{children}</AuthProvider>
      );
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.register('test@example.com', 'password');
      });

      expect(supabaseMock.auth.signUp).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password' });
      expect(result.current.user).toEqual(mockUser);
    });

    it('logout calls Supabase signOut', async () => {
      supabaseMock.auth.signOut.mockResolvedValue({ error: null });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider skipInitialCheck>{children}</AuthProvider>
      );
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.logout();
      });

      expect(supabaseMock.auth.signOut).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
    });

    it('logout clears local session even if Supabase signOut fails', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      supabaseMock.auth.signOut.mockRejectedValue(new Error('Network error'));

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider skipInitialCheck>{children}</AuthProvider>
      );
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.logout();
      });

      expect(supabaseMock.auth.signOut).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('auth:session');
    });
  });

  describe('Offline session fallback', () => {
    it('uses cached session when checkSession fails with network error', async () => {
      (authConfig.getAuthProvider as jest.Mock).mockReturnValue('appwrite');
      const appwriteMock = require('../services/appwrite').account;
      const AsyncStorage = require('@react-native-async-storage/async-storage');

      appwriteMock.get.mockRejectedValue(new Error('Network request failed'));

      const cachedUser = {
        provider: 'appwrite',
        $id: 'cached-id',
        email: 'cached@example.com',
        name: 'Cached User',
      };

      const now = Date.now();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({
          provider: 'appwrite',
          user: cachedUser,
          updatedAt: now - 1000,
          expiresAt: now + 60_000,
        }),
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.checkSession();
      });

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('auth:session');
      expect(result.current.user).toEqual(cachedUser);
      expect(result.current.isOfflineSession).toBe(true);
    });

    it('uses cached session even for non-network errors', async () => {
      (authConfig.getAuthProvider as jest.Mock).mockReturnValue('appwrite');
      const appwriteMock = require('../services/appwrite').account;
      const AsyncStorage = require('@react-native-async-storage/async-storage');

      appwriteMock.get.mockRejectedValue({ message: 'invalid token', code: '401' });

      const cachedUser = {
        provider: 'appwrite',
        $id: 'cached-id',
        email: 'cached@example.com',
        name: 'Cached User',
      };

      const now = Date.now();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({
          provider: 'appwrite',
          user: cachedUser,
          updatedAt: now - 1000,
          expiresAt: now + 60_000,
        }),
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.checkSession();
      });

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('auth:session');
      expect(result.current.user).toEqual(cachedUser);
      expect(result.current.isOfflineSession).toBe(true);
    });

    it('ignores expired cached sessions', async () => {
      (authConfig.getAuthProvider as jest.Mock).mockReturnValue('appwrite');
      const appwriteMock = require('../services/appwrite').account;
      const AsyncStorage = require('@react-native-async-storage/async-storage');

      appwriteMock.get.mockRejectedValue(new Error('Network request failed'));

      const cachedUser = {
        provider: 'appwrite',
        $id: 'cached-id',
        email: 'cached@example.com',
        name: 'Cached User',
      };

      const now = Date.now();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({
          provider: 'appwrite',
          user: cachedUser,
          updatedAt: now - 60_000,
          expiresAt: now - 1,
        }),
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.checkSession();
      });

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('auth:session');
      expect(result.current.user).toBeNull();
      expect(result.current.isOfflineSession).toBe(false);
    });
  });
});
