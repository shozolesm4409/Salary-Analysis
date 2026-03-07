import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBcaHXDUz7pM_QgOy4E9jk6R6LwCctXPuM",
  authDomain: "salaryanalysis-247a1.firebaseapp.com",
  projectId: "salaryanalysis-247a1",
  storageBucket: "salaryanalysis-247a1.firebasestorage.app",
  messagingSenderId: "549040846814",
  appId: "1:549040846814:web:0771b2e86041407effcf4f",
  measurementId: "G-PVSK2YMGSH"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics conditionally
export const analytics = typeof window !== 'undefined' 
  ? isSupported().then(yes => yes ? getAnalytics(app) : null).catch(() => null)
  : null;
