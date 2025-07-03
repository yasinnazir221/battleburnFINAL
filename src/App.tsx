import React, { useState, useEffect } from 'react';
import { Shield, Trophy, Users, Coins } from 'lucide-react';
import SplashScreen from './components/SplashScreen';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import { User, Tournament, Player } from './types';

// Mock data for testing
const mockTournaments: Tournament[] = [
  {
    id: '1',
    title: 'Friday Night Battle',
    description: 'Epic 1v1 tournament with amazing rewards',
    mode: '1v1',
    entryFee: 20,
    killReward: 5,
    booyahReward: 100,
    dateTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    status: 'waiting',
    maxPlayers: 40,
    currentPlayers: 12,
    participants: [],
    matches: [],
    roomId: '',
    roomPassword: '',
    rules: ['No cheating allowed', 'Use registered UID only'],
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Squad Championship',
    description: 'Team up and dominate in squad mode',
    mode: 'squad',
    entryFee: 50,
    killReward: 10,
    booyahReward: 200,
    dateTime: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    status: 'waiting',
    maxPlayers: 16,
    currentPlayers: 8,
    participants: [],
    matches: [],
    roomId: '',
    roomPassword: '',
    rules: ['Squad of 4 players', 'No solo players allowed'],
    createdAt: new Date().toISOString()
  }
];

const mockPlayers: Player[] = [
  {
    id: 'player1',
    email: 'player@test.com',
    username: 'TestPlayer',
    displayName: 'Test Player',
    tokens: 150,
    playerId: 'TEST123',
    gameUid: '123456789',
    uid: '123456789',
    registeredTournaments: [],
    matchHistory: [],
    createdAt: new Date().toISOString()
  }
];

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'admin'>('dashboard');
  const [tournaments, setTournaments] = useState<Tournament[]>(mockTournaments);
  const [players, setPlayers] = useState<Player[]>(mockPlayers);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      setLoading(false);
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    
    // Add mock player if doesn't exist
    if (!players.find(p => p.email === user.email)) {
      const newPlayer: Player = {
        id: `player_${Date.now()}`,
        email: user.email,
        username: user.username,
        displayName: user.username,
        tokens: 100, // Starting tokens
        playerId: `PID${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        gameUid: `${Math.floor(Math.random() * 1000000000)}`,
        uid: `${Math.floor(Math.random() * 1000000000)}`,
        registeredTournaments: [],
        matchHistory: [],
        createdAt: new Date().toISOString()
      };
      setPlayers(prev => [...prev, newPlayer]);
    }
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    setCurrentView('dashboard');
  };

  const addTokensToPlayer = async (playerId: string, amount: number, reason: string) => {
    setPlayers(prev => prev.map(player => 
      player.id === playerId 
        ? { ...player, tokens: player.tokens + amount }
        : player
    ));
  };

  const createTournament = async (tournament: Omit<Tournament, 'id'>) => {
    const newTournament: Tournament = {
      ...tournament,
      id: `tournament_${Date.now()}`,
      participants: [],
      matches: [],
      currentPlayers: 0
    };
    setTournaments(prev => [...prev, newTournament]);
  };

  const updateTournament = async (id: string, updates: Partial<Tournament>) => {
    setTournaments(prev => prev.map(tournament => 
      tournament.id === id 
        ? { ...tournament, ...updates }
        : tournament
    ));
  };

  const handleJoinTournament = async (tournamentId: string) => {
    if (!currentUser || currentUser.role === 'admin') return;
    
    const tournament = tournaments.find(t => t.id === tournamentId);
    const player = players.find(p => p.email === currentUser.email);
    
    if (!tournament || !player) return;
    
    // Check if player already joined
    if (tournament.participants.includes(player.id)) {
      alert('You have already joined this tournament!');
      return;
    }
    
    // Check if tournament is full
    if (tournament.participants.length >= tournament.maxPlayers) {
      alert('Tournament is full!');
      return;
    }
    
    // Check if player has enough tokens
    if (player.tokens < tournament.entryFee) {
      alert('Insufficient tokens to join this tournament!');
      return;
    }
    
    // Deduct tokens from player
    await addTokensToPlayer(player.id, -tournament.entryFee, `Tournament Entry: ${tournament.title}`);
    
    // Add player to tournament participants
    const updatedParticipants = [...tournament.participants, player.id];
    await updateTournament(tournamentId, { 
      participants: updatedParticipants,
      currentPlayers: updatedParticipants.length,
      status: updatedParticipants.length >= tournament.maxPlayers ? 'full' : tournament.status
    });
    
    alert('Successfully joined the tournament!');
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
            onJoinTournament={handleJoinTournament}
            onAddTokens={addTokensToPlayer}
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