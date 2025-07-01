import React, { useState } from 'react';
import { Calendar, Users, Trophy, Coins, Play, Clock, MapPin, Award, Copy, CheckCircle, CreditCard } from 'lucide-react';
import { Tournament, User, Player } from '../types';
import PaymentModal from './PaymentModal';

interface DashboardProps {
  tournaments: Tournament[];
  currentUser: User;
  players: Player[];
  onJoinTournament: (tournamentId: string) => void;
  onAddTokens: (playerId: string, amount: number, reason: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  tournaments, 
  currentUser, 
  players, 
  onJoinTournament,
  onAddTokens
}) => {
  const [activeTab, setActiveTab] = useState<'tournaments' | 'matches' | 'wallet' | 'results'>('tournaments');
  const [copiedText, setCopiedText] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const currentPlayer = players.find(p => p.email === currentUser.email);
  const userTournaments = tournaments.filter(t => 
    t.participants.includes(currentPlayer?.id || '')
  );

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const handlePaymentSubmit = async (amount: number, screenshot: File) => {
    if (!currentPlayer) return;
    
    try {
      // Simulate AI processing and verification
      // In a real app, you would upload the screenshot to your backend
      // and use AI/ML services to verify the payment amount
      
      // For demo purposes, we'll automatically credit the tokens
      await onAddTokens(currentPlayer.id, amount, `JazzCash Payment Verification - ${amount} PKR`);
      
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  };

  const getStatusColor = (status: Tournament['status']) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'full': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'live': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const TabButton = ({ id, icon: Icon, label }: { id: string; icon: any; label: string }) => (
    <button
      onClick={() => setActiveTab(id as any)}
      className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${
        activeTab === id
          ? 'bg-orange-500 text-black font-semibold'
          : 'text-gray-400 hover:text-orange-400 hover:bg-gray-800/50'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-2xl border border-orange-500/20 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Welcome back, {currentUser.username}!
            </h2>
            <p className="text-gray-300">
              Ready for your next tournament? Check out the latest battles below.
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <Coins className="w-6 h-6 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-400">
                {currentPlayer?.tokens || 0}
              </span>
            </div>
            <p className="text-sm text-gray-400">Available Tokens</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <TabButton id="tournaments" icon={Trophy} label="Tournaments" />
        <TabButton id="matches" icon={Play} label="My Matches" />
        <TabButton id="wallet" icon={Coins} label="Wallet" />
        <TabButton id="results" icon={Award} label="Results" />
      </div>

      {/* Content Sections */}
      {activeTab === 'tournaments' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white">Available Tournaments</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tournaments.map(tournament => {
              const isJoined = tournament.participants.includes(currentPlayer?.id || '');
              const canJoin = tournament.status === 'waiting' && 
                            (currentPlayer?.tokens || 0) >= tournament.entryFee &&
                            tournament.participants.length < tournament.maxPlayers;
              
              return (
                <div key={tournament.id} className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 hover:border-orange-500/50 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-white mb-1">{tournament.title}</h4>
                      <p className="text-gray-400 text-sm">{tournament.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${getStatusColor(tournament.status)}`}>
                      {tournament.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(tournament.dateTime).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <Users className="w-4 h-4" />
                      <span>{tournament.participants.length}/{tournament.maxPlayers} players</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <Coins className="w-4 h-4" />
                      <span>Entry: {tournament.entryFee} tokens</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                      <p className="text-yellow-400 font-bold">{tournament.killReward}</p>
                      <p className="text-xs text-gray-400">Per Kill</p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                      <p className="text-green-400 font-bold">{tournament.booyahReward}</p>
                      <p className="text-xs text-gray-400">Booyah</p>
                    </div>
                  </div>
                  
                  {/* Room Details - Show only to joined players */}
                  {isJoined && tournament.roomId && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <MapPin className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-semibold">Room Details</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-gray-800/50 rounded p-2">
                          <div>
                            <p className="text-gray-400 text-xs">Room ID</p>
                            <p className="text-white font-mono text-sm">{tournament.roomId}</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(tournament.roomId, 'roomId')}
                            className="p-1 text-gray-400 hover:text-white transition-colors"
                          >
                            {copiedText === 'roomId' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                        <div className="flex items-center justify-between bg-gray-800/50 rounded p-2">
                          <div>
                            <p className="text-gray-400 text-xs">Password</p>
                            <p className="text-white font-mono text-sm">{tournament.roomPassword}</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(tournament.roomPassword, 'roomPassword')}
                            className="p-1 text-gray-400 hover:text-white transition-colors"
                          >
                            {copiedText === 'roomPassword' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => onJoinTournament(tournament.id)}
                    disabled={!canJoin || isJoined}
                    className={`w-full font-bold py-3 px-4 rounded-lg transition-all ${
                      isJoined 
                        ? 'bg-green-600 text-white cursor-default' 
                        : canJoin
                        ? 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isJoined ? 'Joined ✓' :
                     canJoin ? 'Join Tournament' : 
                     tournament.status === 'live' ? 'Live Now' : 
                     tournament.status === 'full' ? 'Full' : 
                     tournament.participants.length >= tournament.maxPlayers ? 'Full' :
                     'Insufficient Tokens'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'matches' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white">My Tournament Matches</h3>
          {userTournaments.length > 0 ? (
            <div className="space-y-4">
              {userTournaments.map(tournament => (
                <div key={tournament.id} className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-bold text-white">{tournament.title}</h4>
                    <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${getStatusColor(tournament.status)}`}>
                      {tournament.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-300">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(tournament.dateTime).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-300">
                        <Users className="w-4 h-4" />
                        <span>{tournament.mode.toUpperCase()} Mode</span>
                      </div>
                    </div>
                    
                    {tournament.roomId && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                        <p className="text-green-400 font-semibold mb-1">Room Details:</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-mono text-sm">ID: {tournament.roomId}</p>
                            <p className="text-white font-mono text-sm">Pass: {tournament.roomPassword}</p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => copyToClipboard(tournament.roomId, 'matchRoomId')}
                              className="p-1 text-gray-400 hover:text-white transition-colors"
                            >
                              {copiedText === 'matchRoomId' ? <CheckCircle className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={() => copyToClipboard(tournament.roomPassword, 'matchRoomPass')}
                              className="p-1 text-gray-400 hover:text-white transition-colors"
                            >
                              {copiedText === 'matchRoomPass' ? <CheckCircle className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">You haven't joined any tournaments yet.</p>
              <button 
                onClick={() => setActiveTab('tournaments')}
                className="mt-4 text-orange-400 hover:text-orange-300 font-semibold"
              >
                Browse Tournaments
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'wallet' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white">Token Wallet</h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Coins className="w-8 h-8 text-yellow-400" />
                <div>
                  <h4 className="text-white font-bold">Current Balance</h4>
                  <p className="text-yellow-400 text-2xl font-bold">{currentPlayer?.tokens || 0}</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm">1 Token = 1 PKR</p>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
              <h4 className="text-white font-bold mb-4">Buy Tokens</h4>
              <div className="space-y-3">
                <p className="text-gray-400 text-sm">
                  Purchase tokens via JazzCash:
                </p>
                <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded p-3">
                  <span className="text-green-400 font-mono font-bold">03092198628</span>
                  <button
                    onClick={() => copyToClipboard('03092198628', 'jazzcash')}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedText === 'jazzcash' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Buy Tokens
                </button>
                <p className="text-gray-400 text-xs">
                  AI-powered instant verification
                </p>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
              <h4 className="text-white font-bold mb-4">Withdraw</h4>
              <p className="text-gray-400 text-sm mb-4">
                Minimum withdrawal: 50 tokens
              </p>
              <button className="w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                Request Withdrawal
              </button>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
            <h4 className="text-blue-400 font-bold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              How to Buy Tokens
            </h4>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-400 font-bold">1</span>
                </div>
                <p className="text-gray-300">Send money to JazzCash number</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-400 font-bold">2</span>
                </div>
                <p className="text-gray-300">Take screenshot of confirmation</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-400 font-bold">3</span>
                </div>
                <p className="text-gray-300">Upload via "Buy Tokens" button</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-400 font-bold">4</span>
                </div>
                <p className="text-gray-300">AI verifies & credits tokens</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'results' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white">Match Results</h3>
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No completed matches yet.</p>
            <p className="text-gray-500 text-sm mt-2">Your match history will appear here after tournaments.</p>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSubmit={handlePaymentSubmit}
      />
    </div>
  );
};

export default Dashboard;