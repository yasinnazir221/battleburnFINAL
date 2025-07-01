// Mock Firebase configuration for testing
// This will be replaced with real Firebase config when ready

// Mock Firebase app object
const mockApp = {
  name: 'mock-app',
  options: {}
};

// Mock auth object
export const auth = {
  currentUser: null,
  onAuthStateChanged: (callback: any) => {
    // Return a mock unsubscribe function
    return () => {};
  }
};

// Mock firestore object
export const db = {
  collection: () => ({}),
  doc: () => ({})
};

export default mockApp;