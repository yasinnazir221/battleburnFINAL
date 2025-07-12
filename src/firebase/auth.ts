import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc 
} from 'firebase/firestore';
import { auth, db, serverTimestamp } from './config';
import { User } from '../types';

// Sign up new user
export const signUpUser = async (email: string, password: string, username: string, playerId: string, uid: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Update the user's display name
    await updateProfile(firebaseUser, {
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
      gameUid: uid, // Free Fire UID
      registeredTournaments: [],
      matchHistory: [],
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userData);

    // Log the signup event
    await addDoc(collection(db, 'userActivity'), {
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
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
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
    await addDoc(collection(db, 'userActivity'), {
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
      if (userDoc.exists()) {
        const userData = userDoc.data();
        await addDoc(collection(db, 'userActivity'), {
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
    
    await signOut(auth);
  } catch (error: any) {
    console.error('Error signing out:', error);
    throw new Error(error.message);
  }
};

// Listen to authentication state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          callback({
            id: firebaseUser.uid,
            email: firebaseUser.email!,
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