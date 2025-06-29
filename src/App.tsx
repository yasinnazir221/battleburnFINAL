import React, { useState, useEffect } from 'react';
import { Shield, Trophy, Users, Coins } from 'lucide-react';
import SplashScreen from './components/SplashScreen';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import { User, Tournament, Player } from './types';
import { onAuthStateChange, signOutUser } from './firebase/auth';
import { 
  getAllPlayers, 
  getAllTournaments, 
  createTournament as createTournamentInDB, 
  updateTournament as updateTournamentInDB,
  updatePlayerTokens,
  listenToPlayers,
  listenToTournaments
} from './firebase/firestore';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'admin'>('dashboard');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    // Listen to authentication state changes
    const unsubscribeAuth = onAuthStateChange((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => {
      clearTimeout(timer);
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      // Set up real-time listeners for tournaments and players
      const unsubscribeTournaments = listenToTournaments((tournaments) => {
        setTournaments(tournaments);
      });

      const unsubscribePlayers = listenToPlayers((players) => {
        setPlayers(players);
      });

      return () => {
        unsubscribeTournaments();
        unsubscribePlayers();
      };
    }
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      setCurrentUser(null);
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const addTokensToPlayer = async (playerId: string, amount: number, reason: string) => {
    try {
      await updatePlayerTokens(playerId, amount, reason, currentUser?.id);
      // The real-time listener will update the state automatically
    } catch (error) {
      console.error('Error updating tokens:', error);
      alert('Failed to update tokens. Please try again.');
    }
  };

  const createTournament = async (tournament: Omit<Tournament, 'id'>) => {
    try {
      await createTournamentInDB(tournament);
      // The real-time listener will update the state automatically
    } catch (error) {
      console.error('Error creating tournament:', error);
      alert('Failed to create tournament. Please try again.');
    }
  };

  const updateTournament = async (id: string, updates: Partial<Tournament>) => {
    try {
      await updateTournamentInDB(id, updates);
      // The real-time listener will update the state automatically
    } catch (error) {
      console.error('Error updating tournament:', error);
      alert('Failed to update tournament. Please try again.');
    }
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Battle Burn FF...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Navigation Header */}
      <header className="bg-black/80 backdrop-blur-md border-b border-orange-500/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 p-0.5 shadow-lg">
                <div className="w-full h-full rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                  <img 
                    src="/logo.png.png" 
                    alt="Battle Burn FF Challenge" 
                    className="w-10 h-10 object-contain"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent font-orbitron">
                  BATTLE BURN FF
                </h1>
                <p className="text-xs text-gray-400">Ultimate Tournament Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    currentView === 'dashboard' 
                      ? 'bg-orange-500 text-black' 
                      : 'text-gray-300 hover:text-orange-400'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  <span className="font-semibold">Dashboard</span>
                </button>
                
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => setCurrentView('admin')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      currentView === 'admin' 
                        ? 'bg-orange-500 text-black' 
                        : 'text-gray-300 hover:text-orange-400'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span className="font-semibold">Admin</span>
                  </button>
                )}
              </div>
              
              <div className="flex items-center space-x-3 bg-gray-800/50 rounded-lg px-4 py-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-bold">
                  {currentUser.role === 'admin' ? '∞' : players.find(p => p.email === currentUser.email)?.tokens || 0}
                </span>
                <span className="text-gray-400 text-sm">tokens</span>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-300">
                <Users className="w-4 h-4" />
                <span className="text-sm">{currentUser.username}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-gray-800/50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentView === 'dashboard' ? (
          <Dashboard 
            tournaments={tournaments}
            currentUser={currentUser}
            players={players}
            onJoinTournament={(tournamentId) => {
              // Handle tournament joining logic
              const tournament = tournaments.find(t => t.id === tournamentId);
              if (tournament && currentUser.role !== 'admin') {
                const player = players.find(p => p.email === currentUser.email);
                if (player && player.tokens >= tournament.entryFee) {
                  addTokensToPlayer(player.id, -tournament.entryFee, 'Tournament Entry');
                  updateTournament(tournamentId, { 
                    currentPlayers: tournament.currentPlayers + 1 
                  });
                }
              }
            }}
          />
        ) : (
          <AdminPanel
            tournaments={tournaments}
            players={players}
            onCreateTournament={createTournament}
            onUpdateTournament={updateTournament}
            onAddTokens={addTokensToPlayer}
          />
        )}
      </main>
    </div>
  );
}

export default App;