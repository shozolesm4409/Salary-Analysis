import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAPplby4kVfu0s7IPJXdS-xZlfi_m1nJpM",
  authDomain: "money-managements-d8f54.firebaseapp.com",
  projectId: "money-managements-d8f54",
  storageBucket: "money-managements-d8f54.firebasestorage.app",
  messagingSenderId: "246568918050",
  appId: "1:246568918050:web:d0162d2ad335ef39557e7b",
  measurementId: "G-8HLFQ95E3G"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics conditionally
export const analytics = typeof window !== 'undefined' 
  ? isSupported().then(yes => yes ? getAnalytics(app) : null).catch(() => null)
  : null;
