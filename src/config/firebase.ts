/**
 * Firebase Configuration for FlashMind
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyATktKyen201usqUBOqpCa33rzakCTwKBA",
  authDomain: "flashmind-a3da0.firebaseapp.com",
  projectId: "flashmind-a3da0",
  storageBucket: "flashmind-a3da0.firebasestorage.app",
  messagingSenderId: "159716395079",
  appId: "1:159716395079:web:f760a8a920d0692ef4c962"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore
export const db = getFirestore(app);

// Enable offline persistence for Firestore
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Firestore persistence failed: multiple tabs open');
  } else if (err.code === 'unimplemented') {
    console.warn('Firestore persistence not supported in this browser');
  }
});

export default app;
