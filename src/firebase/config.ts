import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDw3JkPokn-Vr87Z885CAKjvrmajfFNLts",
  authDomain: "battleburn-a6fe0.firebaseapp.com",
  projectId: "battleburn-a6fe0",
  storageBucket: "battleburn-a6fe0.firebasestorage.app",
  messagingSenderId: "647937146440",
  appId: "1:647937146440:web:4c9ddfdf12d4eddedae27d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

export default app;