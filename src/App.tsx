import React, { useState, useEffect } from 'react';
import { Shield, Trophy, Users, Coins } from 'lucide-react';
import SplashScreen from './components/SplashScreen';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import { User, Tournament, Player, PaymentRequest } from './types';
import { uploadPaymentScreenshot } from './services/storage';
import { onAuthStateChange, signOutUser } from './services/auth';
import { 
  getAllPlayers,
  getAllTournaments,
  createTournament as createTournamentDB,
  updateTournament as updateTournamentDB,
  updatePlayerTokens,
  listenToPlayers,
  listenToTournaments,
  getPaymentRequests,
  createPaymentRequest,
  updatePaymentRequest,
  listenToPaymentRequests
} from './services/database';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'admin'>('dashboard');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    // Listen to authentication state changes
    const unsubscribeAuth = onAuthStateChange((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      setLoading(false);
    });

    return () => {
      clearTimeout(timer);
      if (unsubscribeAuth?.subscription) {
        unsubscribeAuth.subscription.unsubscribe();
      }
    };
  }, []);

  // Load data when user is authenticated
  useEffect(() => {
    if (currentUser) {
      // Set up real-time listeners for tournaments and players
      const tournamentsSubscription = listenToTournaments(setTournaments);
      const playersSubscription = listenToPlayers(setPlayers);
      const paymentsSubscription = listenToPaymentRequests(setPaymentRequests);
      
      // Load initial data
      getAllTournaments().then(setTournaments);
      getAllPlayers().then(setPlayers);
      getPaymentRequests().then(setPaymentRequests);

      return () => {
        tournamentsSubscription.unsubscribe();
        playersSubscription.unsubscribe();
        paymentsSubscription.unsubscribe();
      };
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOutUser();
      setCurrentUser(null);
      setCurrentView('dashboard');
      setTournaments([]);
      setPlayers([]);
      setPaymentRequests([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const addTokensToPlayer = async (playerId: string, amount: number, reason: string) => {
    try {
      await updatePlayerTokens(playerId, amount, reason, currentUser?.id);
      // Real-time listener will update the state automatically
    } catch (error) {
      console.error('Error updating player tokens:', error);
      alert('Failed to update player tokens. Please try again.');
    }
  };

  const createTournament = async (tournament: Omit<Tournament, 'id'>) => {
    try {
      await createTournamentDB(tournament);
      // Real-time listener will update the state automatically
    } catch (error) {
      console.error('Error creating tournament:', error);
      alert('Failed to create tournament. Please try again.');
    }
  };

  const updateTournament = async (id: string, updates: Partial<Tournament>) => {
    try {
      await updateTournamentDB(id, updates);
      // Real-time listener will update the state automatically
    } catch (error) {
      console.error('Error updating tournament:', error);
      alert('Failed to update tournament. Please try again.');
    }
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
    
    try {
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
    } catch (error) {
      console.error('Error joining tournament:', error);
      alert('Failed to join tournament. Please try again.');
    }
  };

  // Handle payment submission - NO AUTO TOKENS, only admin verification
  const handlePaymentSubmit = async (amount: number, screenshot: File) => {
    if (!currentUser) return;

    try {
      // Generate unique payment ID
      const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Upload screenshot to Firebase Storage
      const uploadResult = await uploadPaymentScreenshot(screenshot, currentUser.id, paymentId);
      
      console.log('📸 Screenshot uploaded successfully:', uploadResult);
      
      // Create payment request for admin verification
      const paymentRequest: Omit<PaymentRequest, 'id'> = {
        userId: currentUser.id,
        userEmail: currentUser.email,
        username: currentUser.username,
        amount,
        screenshotURL: uploadResult.url,
        screenshotPath: uploadResult.path,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        method: 'jazzcash'
      };
      
      // Save to Supabase database
      await createPaymentRequest(paymentRequest);
      
      console.log('💰 Payment request created:', paymentRequest);
      
      alert('Payment screenshot uploaded successfully! Admin will review your request.');
      
    } catch (error) {
      console.error('❌ Payment submission error:', error);
      alert('Failed to upload screenshot. Please try again.');
      throw error;
    }
  };

  // Admin function to approve payment request
  const approvePaymentRequest = async (requestId: string) => {
    const request = paymentRequests.find(r => r.id === requestId);
    if (!request) return;

    // Find the player
    const player = players.find(p => p.email === request.userEmail);
    if (!player) return;

    try {
      // Add tokens to player
      await addTokensToPlayer(player.id, request.amount, `Payment Approved: ${request.amount} PKR via ${request.method}`);

      // Update request status
      await updatePaymentRequest(requestId, { status: 'approved' });

      alert(`Payment approved! ${request.amount} tokens added to ${request.username}'s account.`);
    } catch (error) {
      console.error('Error approving payment:', error);
      alert('Failed to approve payment. Please try again.');
    }
  };

  // Admin function to reject payment request
  const rejectPaymentRequest = async (requestId: string, reason?: string) => {
    try {
      await updatePaymentRequest(requestId, { 
        status: 'rejected', 
        rejectionReason: reason 
      });

      alert('Payment request rejected.');
    } catch (error) {
      console.error('Error rejecting payment:', error);
      alert('Failed to reject payment. Please try again.');
    }
  };

  // Get current player's tokens (infinite for admin)
  const getCurrentPlayerTokens = () => {
    if (currentUser?.role === 'admin') {
      return Infinity; // Admin has infinite tokens
    }
    const player = players.find(p => p.email === currentUser?.email);
    return player?.tokens || 0;
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  if (authLoading || loading) {
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
    return <AuthForm />;
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
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all relative ${
                      currentView === 'admin' 
                        ? 'bg-orange-500 text-black' 
                        : 'text-gray-300 hover:text-orange-400'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span className="font-semibold">Admin</span>
                    {paymentRequests.filter(r => r.status === 'pending').length > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-1">
                        {paymentRequests.filter(r => r.status === 'pending').length}
                      </span>
                    )}
                  </button>
                )}
              </div>
              
              <div className="flex items-center space-x-3 bg-gray-800/50 rounded-lg px-4 py-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-bold">
                  {currentUser.role === 'admin' ? '∞' : getCurrentPlayerTokens()}
                </span>
                <span className="text-gray-400 text-sm">tokens</span>
                {currentUser.role === 'admin' && (
                  <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded">
                    ADMIN
                  </span>
                )}
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
            onPaymentSubmit={handlePaymentSubmit}
          />
        ) : (
          <AdminPanel
            tournaments={tournaments}
            players={players}
            paymentRequests={paymentRequests}
            onCreateTournament={createTournament}
            onUpdateTournament={updateTournament}
            onAddTokens={addTokensToPlayer}
            onApprovePayment={approvePaymentRequest}
            onRejectPayment={rejectPaymentRequest}
          />
        )}
      </main>
    </div>
  );
}

export default App;