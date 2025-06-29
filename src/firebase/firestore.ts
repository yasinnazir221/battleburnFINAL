import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  where,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from './config';
import { Tournament, Player, TokenTransaction } from '../types';

// Get all users/players
export const getAllPlayers = async (): Promise<Player[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const players: Player[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.role === 'player') {
        players.push({
          id: doc.id,
          email: data.email,
          username: data.username,
          displayName: data.displayName || data.username,
          tokens: data.tokens || 0,
          playerId: data.playerId || '',
          gameUid: data.uid || '',
          uid: data.uid || '',
          registeredTournaments: data.registeredTournaments || [],
          matchHistory: data.matchHistory || [],
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        });
      }
    });
    
    return players;
  } catch (error) {
    console.error('Error getting players:', error);
    return [];
  }
};

// Get all tournaments
export const getAllTournaments = async (): Promise<Tournament[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'tournaments'));
    const tournaments: Tournament[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      tournaments.push({
        id: doc.id,
        title: data.title,
        description: data.description,
        mode: data.mode,
        entryFee: data.entryFee,
        killReward: data.killReward,
        booyahReward: data.booyahReward,
        dateTime: data.dateTime,
        status: data.status,
        maxPlayers: data.maxPlayers,
        currentPlayers: data.currentPlayers || 0,
        participants: data.participants || [],
        matches: data.matches || [],
        roomId: data.roomId || '',
        roomPassword: data.roomPassword || '',
        rules: data.rules || [],
        winner: data.winner,
        results: data.results || [],
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      });
    });
    
    return tournaments;
  } catch (error) {
    console.error('Error getting tournaments:', error);
    return [];
  }
};

// Create tournament
export const createTournament = async (tournament: Omit<Tournament, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'tournaments'), {
      ...tournament,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating tournament:', error);
    throw error;
  }
};

// Update tournament
export const updateTournament = async (id: string, updates: Partial<Tournament>) => {
  try {
    await updateDoc(doc(db, 'tournaments', id), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating tournament:', error);
    throw error;
  }
};

// Delete tournament
export const deleteTournament = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'tournaments', id));
  } catch (error) {
    console.error('Error deleting tournament:', error);
    throw error;
  }
};

// Update player tokens
export const updatePlayerTokens = async (playerId: string, amount: number, reason: string, adminId?: string) => {
  try {
    const playerRef = doc(db, 'users', playerId);
    const playerDoc = await getDoc(playerRef);
    
    if (!playerDoc.exists()) {
      throw new Error('Player not found');
    }
    
    const currentTokens = playerDoc.data().tokens || 0;
    const newTokens = currentTokens + amount;
    
    // Update player tokens
    await updateDoc(playerRef, {
      tokens: newTokens,
      updatedAt: serverTimestamp()
    });
    
    // Log transaction
    const transaction: Omit<TokenTransaction, 'id'> = {
      playerId,
      amount,
      type: amount > 0 ? 'deposit' : 'withdrawal',
      reason,
      date: new Date().toISOString(),
      adminId
    };
    
    await addDoc(collection(db, 'tokenTransactions'), {
      ...transaction,
      timestamp: serverTimestamp()
    });
    
  } catch (error) {
    console.error('Error updating player tokens:', error);
    throw error;
  }
};

// Get user activity logs (for admin)
export const getUserActivityLogs = async (limitCount: number = 50) => {
  try {
    const q = query(
      collection(db, 'userActivity'), 
      orderBy('timestamp', 'desc'), 
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const activities: any[] = [];
    
    querySnapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return activities;
  } catch (error) {
    console.error('Error getting user activity:', error);
    return [];
  }
};

// Get token transaction logs
export const getTokenTransactions = async (limitCount: number = 50) => {
  try {
    const q = query(
      collection(db, 'tokenTransactions'), 
      orderBy('timestamp', 'desc'), 
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const transactions: any[] = [];
    
    querySnapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return transactions;
  } catch (error) {
    console.error('Error getting token transactions:', error);
    return [];
  }
};

// Real-time listeners
export const listenToPlayers = (callback: (players: Player[]) => void) => {
  return onSnapshot(collection(db, 'users'), (snapshot) => {
    const players: Player[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.role === 'player') {
        players.push({
          id: doc.id,
          email: data.email,
          username: data.username,
          displayName: data.displayName || data.username,
          tokens: data.tokens || 0,
          playerId: data.playerId || '',
          gameUid: data.uid || '',
          uid: data.uid || '',
          registeredTournaments: data.registeredTournaments || [],
          matchHistory: data.matchHistory || [],
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        });
      }
    });
    callback(players);
  });
};

export const listenToTournaments = (callback: (tournaments: Tournament[]) => void) => {
  return onSnapshot(collection(db, 'tournaments'), (snapshot) => {
    const tournaments: Tournament[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      tournaments.push({
        id: doc.id,
        title: data.title,
        description: data.description,
        mode: data.mode,
        entryFee: data.entryFee,
        killReward: data.killReward,
        booyahReward: data.booyahReward,
        dateTime: data.dateTime,
        status: data.status,
        maxPlayers: data.maxPlayers,
        currentPlayers: data.currentPlayers || 0,
        participants: data.participants || [],
        matches: data.matches || [],
        roomId: data.roomId || '',
        roomPassword: data.roomPassword || '',
        rules: data.rules || [],
        winner: data.winner,
        results: data.results || [],
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      });
    });
    callback(tournaments);
  });
};