import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Demo Firebase configuration - Replace with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyDemo_Replace_With_Your_Actual_API_Key",
  authDomain: "battleburn-ff-demo.firebaseapp.com",
  projectId: "battleburn-ff-demo",
  storageBucket: "battleburn-ff-demo.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789012345678"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;