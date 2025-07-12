// Mock Firebase configuration for testing
// This provides all the same interfaces as real Firebase but with mock implementations

// Mock Firebase App
const mockApp = {
  name: '[DEFAULT]',
  options: {},
  automaticDataCollectionEnabled: false
};

// Mock Auth
export const auth = {
  currentUser: null,
  onAuthStateChanged: (callback: (user: any) => void) => {
    // Return unsubscribe function
    return () => {};
  },
  signInWithEmailAndPassword: async (email: string, password: string) => {
    // Mock successful login
    return {
      user: {
        uid: 'mock-user-id',
        email: email,
        displayName: email.split('@')[0]
      }
    };
  },
  createUserWithEmailAndPassword: async (email: string, password: string) => {
    // Mock successful signup
    return {
      user: {
        uid: 'mock-user-id-' + Date.now(),
        email: email,
        displayName: email.split('@')[0]
      }
    };
  },
  signOut: async () => {
    // Mock successful logout
    return Promise.resolve();
  },
  updateProfile: async (user: any, profile: any) => {
    // Mock profile update
    return Promise.resolve();
  }
};

// Mock Firestore
export const db = {
  collection: (path: string) => ({
    doc: (id?: string) => ({
      set: async (data: any, options?: any) => Promise.resolve(),
      get: async () => ({
        exists: () => true,
        data: () => ({
          id: id || 'mock-doc-id',
          username: 'MockUser',
          role: 'player',
          tokens: 100,
          playerId: 'MOCK123',
          uid: 'MOCK456',
          registeredTournaments: [],
          matchHistory: [],
          createdAt: new Date(),
          lastLogin: new Date()
        }),
        id: id || 'mock-doc-id'
      }),
      update: async (data: any) => Promise.resolve(),
      delete: async () => Promise.resolve()
    }),
    add: async (data: any) => ({
      id: 'mock-doc-id-' + Date.now()
    }),
    getDocs: async () => ({
      forEach: (callback: (doc: any) => void) => {
        // Mock some sample data
        const mockDocs = [
          {
            id: 'user1',
            data: () => ({
              username: 'TestPlayer1',
              email: 'player1@test.com',
              role: 'player',
              tokens: 150,
              playerId: 'TEST001',
              uid: 'FF001',
              registeredTournaments: [],
              matchHistory: [],
              createdAt: new Date()
            })
          },
          {
            id: 'user2',
            data: () => ({
              username: 'TestPlayer2',
              email: 'player2@test.com',
              role: 'player',
              tokens: 75,
              playerId: 'TEST002',
              uid: 'FF002',
              registeredTournaments: [],
              matchHistory: [],
              createdAt: new Date()
            })
          }
        ];
        mockDocs.forEach(callback);
      }
    }),
    onSnapshot: (callback: (snapshot: any) => void) => {
      // Mock real-time updates
      const mockSnapshot = {
        forEach: (docCallback: (doc: any) => void) => {
          const mockDocs = [
            {
              id: 'user1',
              data: () => ({
                username: 'TestPlayer1',
                email: 'player1@test.com',
                role: 'player',
                tokens: 150,
                playerId: 'TEST001',
                uid: 'FF001',
                registeredTournaments: [],
                matchHistory: [],
                createdAt: new Date()
              })
            }
          ];
          mockDocs.forEach(docCallback);
        }
      };
      
      // Call immediately and then periodically
      callback(mockSnapshot);
      
      // Return unsubscribe function
      return () => {};
    },
    where: (field: string, operator: string, value: any) => ({
      getDocs: async () => ({
        forEach: (callback: (doc: any) => void) => {
          // Return empty results for mock
        }
      })
    }),
    orderBy: (field: string, direction?: string) => ({
      limit: (count: number) => ({
        getDocs: async () => ({
          forEach: (callback: (doc: any) => void) => {
            // Return empty results for mock
          }
        })
      })
    })
  })
};

// Mock Storage
export const storage = {
  ref: (path: string) => ({
    uploadBytes: async (file: File, metadata?: any) => ({
      ref: {
        fullPath: path,
        name: file.name
      },
      metadata: {
        size: file.size,
        contentType: file.type
      }
    }),
    getDownloadURL: async () => {
      // Return a mock URL
      return `https://mock-storage.com/${path}`;
    },
    delete: async () => Promise.resolve()
  })
};

// Mock server timestamp
export const serverTimestamp = () => new Date();

export default mockApp;