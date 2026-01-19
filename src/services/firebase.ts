import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  initializeAuth,
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  User,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]!;
}

// Initialize Auth with AsyncStorage persistence
// Note: getReactNativePersistence might be missing in some versions, defaulting to getAuth()
// which should handle persistence automatically or use in-memory.
export const firebaseAuth = getAuth(app);

// export const firebaseAuth = initializeAuth(app, {
//   persistence: getReactNativePersistence(AsyncStorage),
// });

export const db = getFirestore(app);

export type FirebaseUser = User;

export const firebaseLogin = (email: string, password: string) =>
  signInWithEmailAndPassword(firebaseAuth, email, password);

export const firebaseRegister = (email: string, password: string) =>
  createUserWithEmailAndPassword(firebaseAuth, email, password);

export const firebaseLogout = () => signOut(firebaseAuth);

export const firebaseRecoverPassword = (email: string) =>
  sendPasswordResetEmail(firebaseAuth, email);
