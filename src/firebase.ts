import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  update, 
  onValue, 
  off, 
  push,
  child,
  DatabaseReference
} from 'firebase/database';

export const firebaseConfig = {
  apiKey: "AIzaSyAchwLPs1OIWNHYDDrkjod5G3EH8UQiot0",
  authDomain: "aalay-soap.firebaseapp.com",
  databaseURL: "https://aalay-soap-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "aalay-soap",
  storageBucket: "aalay-soap.firebasestorage.app",
  messagingSenderId: "382296012010",
  appId: "1:382296012010:web:73e199a0e0016a926f9393"
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize RTDB (Realtime Database) - Explicitly passing databaseURL to guarantee correct region connection
export const rtdb = getDatabase(app, firebaseConfig.databaseURL);

// Helper for mobile phone to synthetic email mapping for Firebase Auth
export const phoneToEmail = (phone: string): string => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return `user_${cleanPhone || '9510006797'}@aalay-soap.firebaseapp.com`;
};

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  ref,
  set,
  get,
  update,
  onValue,
  off,
  push,
  child
};
export type { FirebaseUser, DatabaseReference };
