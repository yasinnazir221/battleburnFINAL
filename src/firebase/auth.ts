import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { auth, db, serverTimestamp } from './config';
import { User } from '../types';

// Mock Firestore functions for testing
const doc = (db: any, collection: string, id: string) => db.collection(collection).doc(id);
const setDoc = async (docRef: any, data: any, options?: any) => docRef.set(data, options);
const getDoc = async (docRef: any) => docRef.get();
const collection = (db: any, path: string) => db.collection(path);
const addDoc = async (collectionRef: any, data: any) => collectionRef.add(data);

// Sign up new user
export const signUpUser = async (email: string, password: string, username: string, playerId: string, uid: string) => {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const firebaseUser = userCredential.user;
    
    // Update the user's display name
    await auth.updateProfile(firebaseUser, {
      displayName: username
    });

    // Create user document in Firestore
    const userData = {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      username: username,
      role: 'player' as const,
      tokens: 50, // Starting tokens
      playerId: playerId, // Player ID
      uid: uid, // Free Fire UID
      registeredTournaments: [],
      matchHistory: [],
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userData);

    // Log the signup event
    await addDoc(db.collection('userActivity'), {
      userId: firebaseUser.uid,
      email: firebaseUser.email,
      username: username,
      action: 'signup',
      timestamp: serverTimestamp(),
      ipAddress: 'unknown', // You can implement IP tracking if needed
      userAgent: navigator.userAgent
    });

    return {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      username: username,
      role: 'player' as const
    };
  } catch (error: any) {
    console.error('Error signing up:', error);
    throw new Error(error.message);
  }
};

// Sign in existing user
export const signInUser = async (email: string, password: string) => {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const firebaseUser = userCredential.user;

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }

    const userData = userDoc.data();

    // Update last login
    await setDoc(doc(db, 'users', firebaseUser.uid), {
      ...userData,
      lastLogin: serverTimestamp()
    }, { merge: true });

    // Log the login event
    await addDoc(db.collection('userActivity'), {
      userId: firebaseUser.uid,
      email: firebaseUser.email,
      username: userData.username,
      action: 'login',
      timestamp: serverTimestamp(),
      ipAddress: 'unknown',
      userAgent: navigator.userAgent
    });

    return {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      username: userData.username,
      role: userData.role
    };
  } catch (error: any) {
    console.error('Error signing in:', error);
    throw new Error(error.message);
  }
};

// Sign out user
export const signOutUser = async () => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      // Log the logout event
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists && userDoc.exists()) {
        const userData = userDoc.data();
        await addDoc(db.collection('userActivity'), {
          userId: currentUser.uid,
          email: currentUser.email,
          username: userData.username,
          action: 'logout',
          timestamp: serverTimestamp(),
          ipAddress: 'unknown',
          userAgent: navigator.userAgent
        });
      }
    }
    
    await auth.signOut();
  } catch (error: any) {
    console.error('Error signing out:', error);
    throw new Error(error.message);
  }
};

// Listen to authentication state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return auth.onAuthStateChanged(async (firebaseUser: any) => {
    if (firebaseUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists && userDoc.exists()) {
          const userData = userDoc.data();
          callback({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            username: userData.username,
            role: userData.role
          });
        } else {
          callback(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};

// Admin function to check if user is admin
export const checkAdminStatus = async (email: string): Promise<boolean> => {
  // You can customize this logic
  const adminEmails = ['admin@battleburn.com', 'yasin@battleburn.com'];
  return adminEmails.includes(email.toLowerCase());
};