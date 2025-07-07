import React, { useState, useEffect } from 'react';
import { Calendar, Users, Trophy, Coins, Play, Clock, MapPin, Award, Copy, CheckCircle, CreditCard, Smartphone, Zap, ArrowRight, Plus, DollarSign, ArrowUpDown, Send, Instagram, Youtube, Twitter, Facebook, Globe, Link } from 'lucide-react';
import { Tournament, User, Player } from '../types';
import PaymentModal from './PaymentModal';
import WithdrawalModal from './WithdrawalModal';

interface DashboardProps {
  tournaments: Tournament[];
  currentUser: User;
  players: Player[];
  onJoinTournament: (tournamentId: string) => void;
  onAddTokens: (playerId: string, amount: number, reason: string) => void;
  onPaymentSubmit: (amount: number, screenshot: File) => void;
}

interface SocialMediaBanner {
  instagram?: string;
  youtube?: string;
  twitter?: string;
  facebook?: string;
  website?: string;
  discord?: string;
  enabled: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  tournaments, 
  currentUser, 
  players, 
  onJoinTournament,
  onAddTokens,
  onPaymentSubmit
}) => {
  const [activeTab, setActiveTab] = useState<'tournaments' | 'matches' | 'wallet' | 'exchange' | 'results'>('tournaments');
  const [copiedText, setCopiedText] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [socialBanner, setSocialBanner] = useState<SocialMediaBanner>({
    instagram: '',
    youtube: '',
    twitter: '',
    facebook: '',
    website: '',
    discord: '',
    enabled: false
  });
  
  const currentPlayer = players.find(p => p.email === currentUser.email);
  const userTournaments = tournaments.filter(t => 
    t.participants.includes(currentPlayer?.id || '')
  );

  // Load social banner data
  useEffect(() => {
    const savedBanner = localStorage.getItem('socialBanner');
    if (savedBanner) {
      setSocialBanner(JSON.parse(savedBanner));
    }
  }, []);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const handlePaymentSubmit = async (amount: number, screenshot: File) => {
    if (!currentPlayer) return;
    
    try {
      // Submit payment for admin verification (NO AUTO TOKENS)
      await onPaymentSubmit(amount, screenshot);
      
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  };

  // Get current player tokens (infinite for admin)
  const getCurrentPlayerTokens = () => {
    if (currentUser.role === 'admin') {
      return Infinity; // Admin has infinite tokens
    }
    return currentPlayer?.tokens || 0;
  };

  // Display tokens for UI (show ∞ for admin)
  const getDisplayTokens = () => {
    if (currentUser.role === 'admin') {
      return '∞';
    }
    return getCurrentPlayerTokens();
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
      {/* Social Media Banner */}
      {socialBanner.enabled && (socialBanner.instagram || socialBanner.youtube || socialBanner.twitter || socialBanner.facebook || socialBanner.website || socialBanner.discord) && (
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-6">
          <div className="text-center mb-4">
            <h3 className="text-white font-bold text-lg">🔥 Follow Us on Social Media! 🔥</h3>
            <p className="text-gray-300 text-sm">Stay updated with latest tournaments, tips, and exclusive content</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {socialBanner.instagram && (
              <a
                href={socialBanner.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 px-4 py-2 rounded-lg transition-all transform hover:scale-105"
              >
                <Instagram size={18} />
                Instagram
              </a>
            )}
            {socialBanner.youtube && (
              <a
                href={socialBanner.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-all transform hover:scale-105"
              >
                <Youtube size={18} />
                YouTube
              </a>
            )}
            {socialBanner.twitter && (
              <a
                href={socialBanner.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg transition-all transform hover:scale-105"
              >
                <Twitter size={18} />
                Twitter
              </a>
            )}
            {socialBanner.facebook && (
              <a
                href={socialBanner.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-500 px-4 py-2 rounded-lg transition-all transform hover:scale-105"
              >
                <Facebook size={18} />
                Facebook
              </a>
            )}
            {socialBanner.website && (
              <a
                href={socialBanner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg transition-all transform hover:scale-105"
              >
                <Globe size={18} />
                Website
              </a>
            )}
            {socialBanner.discord && (
              <a
                href={socialBanner.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 px-4 py-2 rounded-lg transition-all transform hover:scale-105"
              >
                <Link size={18} />
                Discord
              </a>
            )}
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-2xl border border-orange-500/20 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Welcome back, {currentUser.username}!
              {currentUser.role === 'admin' && (
                <span className="text-purple-400 text-lg ml-2">(Admin)</span>
              )}
            </h2>
            <p className="text-gray-300">
              {currentUser.role === 'admin' 
                ? "You have unlimited tokens and full admin access to manage the platform."
                : getCurrentPlayerTokens() === 0 
                ? "Get started by purchasing tokens to join tournaments!" 
                : "Ready for your next tournament? Check out the latest battles below."
              }
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <Coins className="w-6 h-6 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-400">
                {getDisplayTokens()}
              </span>
            </div>
            <p className="text-sm text-gray-400">
              {currentUser.role === 'admin' ? 'Unlimited Tokens' : 'Available Tokens'}
            </p>
            {currentUser.role !== 'admin' && (
              <>
                {getCurrentPlayerTokens() === 0 && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-xs font-semibold mb-2">⚠️ No Tokens Available</p>
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white text-xs font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2"
                    >
                      <Plus className="w-3 h-3" />
                      Buy Tokens Now
                    </button>
                  </div>
                )}
                {getCurrentPlayerTokens() > 0 && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white text-xs font-bold py-1 px-3 rounded-full transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Buy
                    </button>
                    <button
                      onClick={() => setShowWithdrawalModal(true)}
                      className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white text-xs font-bold py-1 px-3 rounded-full transition-all flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      Withdraw
                    </button>
                  </div>
                )}
              </>
            )}
            {currentUser.role === 'admin' && (
              <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <p className="text-purple-400 text-xs font-semibold">🔥 Admin Power Mode</p>
                <p className="text-gray-400 text-xs">Infinite tokens & full access</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <TabButton id="tournaments" icon={Trophy} label="Tournaments" />
        <TabButton id="matches" icon={Play} label="My Matches" />
        <TabButton id="wallet" icon={Coins} label="Wallet" />
        <TabButton id="exchange" icon={ArrowUpDown} label="Exchange" />
        <TabButton id="results" icon={Award} label="Results" />
      </div>

      {/* Content Sections */}
      {activeTab === 'tournaments' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white">Available Tournaments</h3>
          
          {/* No tokens warning - only for regular players */}
          {currentUser.role !== 'admin' && getCurrentPlayerTokens() === 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <Coins className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-yellow-400 font-bold mb-1">Purchase Tokens to Join Tournaments</h4>
                  <p className="text-gray-300 text-sm">You need tokens to participate in tournaments. Buy tokens using JazzCash.</p>
                </div>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  Buy Tokens
                </button>
              </div>
            </div>
          )}

          {tournaments.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tournaments.map(tournament => {
              const isJoined = tournament.participants.includes(currentPlayer?.id || '');
              const hasEnoughTokens = currentUser.role === 'admin' || getCurrentPlayerTokens() >= tournament.entryFee;
              const canJoin = tournament.status === 'waiting' && 
                            hasEnoughTokens &&
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
                    onClick={() => {
                      if (currentUser.role !== 'admin' && getCurrentPlayerTokens() === 0) {
                        setShowPaymentModal(true);
                      } else {
                        onJoinTournament(tournament.id);
                      }
                    }}
                    disabled={isJoined || (tournament.status !== 'waiting') || (tournament.participants.length >= tournament.maxPlayers)}
                    className={`w-full font-bold py-3 px-4 rounded-lg transition-all ${
                      isJoined 
                        ? 'bg-green-600 text-white cursor-default' 
                        : currentUser.role !== 'admin' && getCurrentPlayerTokens() === 0
                        ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white'
                        : canJoin
                        ? 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isJoined ? 'Joined ✓' :
                     currentUser.role !== 'admin' && getCurrentPlayerTokens() === 0 ? 'Buy Tokens to Join' :
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
          ) : (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No tournaments available yet.</p>
              {currentUser.role === 'admin' && (
                <p className="text-gray-500 text-sm mt-2">Create your first tournament in the admin panel.</p>
              )}
            </div>
          )}
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
              {tournaments.length > 0 && (
                <button 
                  onClick={() => setActiveTab('tournaments')}
                  className="mt-4 text-orange-400 hover:text-orange-300 font-semibold"
                >
                  Browse Tournaments
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'wallet' && (
        <div className="space-y-8">
          <h3 className="text-2xl font-bold text-white">Token Wallet</h3>
          
          {/* Current Balance Card */}
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl border border-yellow-500/30 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center">
                  <Coins className="w-8 h-8 text-yellow-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg">Current Balance</h4>
                  <p className="text-yellow-400 text-4xl font-bold">{getDisplayTokens()}</p>
                  <p className="text-gray-300 text-sm">
                    {currentUser.role === 'admin' ? 'Unlimited Admin Tokens' : '1 Token = 1 PKR'}
                  </p>
                </div>
              </div>
              {currentUser.role !== 'admin' && (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Plus className="w-5 h-5" />
                    Buy Tokens
                  </button>
                  <button
                    onClick={() => setShowWithdrawalModal(true)}
                    disabled={getCurrentPlayerTokens() < 50}
                    className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                    Withdraw
                  </button>
                </div>
              )}
              {currentUser.role === 'admin' && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Zap className="w-6 h-6 text-purple-400" />
                    </div>
                    <p className="text-purple-400 font-bold">Admin Mode</p>
                    <p className="text-gray-400 text-xs">Unlimited Access</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method Section - Only for regular players */}
          {currentUser.role !== 'admin' && (
            <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl border border-red-500/30 p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-10 h-10 text-red-400" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">Buy Tokens with JazzCash</h4>
                <p className="text-gray-300">Manual admin verification • Secure payments • 24/7 available</p>
              </div>

              {/* JazzCash Payment Method */}
              <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-6 mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h5 className="text-white font-bold">JazzCash</h5>
                    <p className="text-gray-400 text-sm">Mobile wallet payment</p>
                  </div>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-red-400 font-mono font-bold">03092198628</span>
                    <button
                      onClick={() => copyToClipboard('03092198628', 'jazzcash')}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      {copiedText === 'jazzcash' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Pay with JazzCash
                </button>
              </div>

              {/* How it Works */}
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-red-400 font-bold text-lg">1</span>
                  </div>
                  <h5 className="text-white font-semibold mb-2">Send Money</h5>
                  <p className="text-gray-400 text-sm">Transfer PKR to our JazzCash number</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-red-400 font-bold text-lg">2</span>
                  </div>
                  <h5 className="text-white font-semibold mb-2">Screenshot</h5>
                  <p className="text-gray-400 text-sm">Take photo of payment confirmation</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-red-400 font-bold text-lg">3</span>
                  </div>
                  <h5 className="text-white font-semibold mb-2">Upload</h5>
                  <p className="text-gray-400 text-sm">Submit via our secure form</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="text-red-400" size={20} />
                  </div>
                  <h5 className="text-white font-semibold mb-2">Admin Verify</h5>
                  <p className="text-gray-400 text-sm">Manual token credit</p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-4 px-8 rounded-xl transition-all flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <CreditCard className="w-5 h-5" />
                  Start Token Purchase
                  <ArrowRight className="w-5 h-5" />
                </button>
                <p className="text-gray-400 text-sm mt-3">
                  🔒 Admin verified • 🔒 Secure & encrypted
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'exchange' && (
        <div className="space-y-8">
          <h3 className="text-2xl font-bold text-white">Token Exchange</h3>
          
          {/* Exchange Overview */}
          <div className="bg-gradient-to-br from-blue-500/10 to-green-500/10 rounded-2xl border border-blue-500/30 p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowUpDown className="w-10 h-10 text-blue-400" />
              </div>
              <h4 className="text-2xl font-bold text-white mb-2">Exchange Your Tokens</h4>
              <p className="text-gray-300">Convert your tokens back to PKR and withdraw to your mobile wallet</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Current Balance */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                <h5 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  Your Token Balance
                </h5>
                <div className="text-center">
                  <p className="text-4xl font-bold text-yellow-400 mb-2">{getDisplayTokens()}</p>
                  <p className="text-gray-400 text-sm">Available Tokens</p>
                  <p className="text-white font-semibold mt-2">
                    {currentUser.role === 'admin' ? 'Unlimited' : `= ${getCurrentPlayerTokens()} PKR`}
                  </p>
                </div>
              </div>

              {/* Withdrawal Options */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                <h5 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Send className="w-5 h-5 text-green-400" />
                  Withdrawal Options
                </h5>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Minimum Withdrawal:</span>
                    <span className="text-white">50 tokens</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Processing Time:</span>
                    <span className="text-white">24-48 hours</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Service Fee:</span>
                    <span className="text-white">2% (min 5 tokens)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Exchange Rate:</span>
                    <span className="text-white">1 Token = 1 PKR</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Withdrawal Methods - Only for regular players */}
            {currentUser.role !== 'admin' && (
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                {/* JazzCash Withdrawal */}
                <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <h6 className="text-white font-bold">JazzCash Withdrawal</h6>
                      <p className="text-gray-400 text-sm">Withdraw to your JazzCash account</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowWithdrawalModal(true)}
                    disabled={getCurrentPlayerTokens() < 50}
                    className="w-full bg-red-500/20 hover:bg-red-500/30 disabled:bg-gray-600/20 disabled:text-gray-500 text-red-400 font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    {getCurrentPlayerTokens() < 50 ? 'Insufficient Balance' : 'Withdraw to JazzCash'}
                  </button>
                </div>

                {/* EasyPaisa Withdrawal */}
                <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h6 className="text-white font-bold">EasyPaisa Withdrawal</h6>
                      <p className="text-gray-400 text-sm">Withdraw to your EasyPaisa account</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowWithdrawalModal(true)}
                    disabled={getCurrentPlayerTokens() < 50}
                    className="w-full bg-green-500/20 hover:bg-green-500/30 disabled:bg-gray-600/20 disabled:text-gray-500 text-green-400 font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    {getCurrentPlayerTokens() < 50 ? 'Insufficient Balance' : 'Withdraw to EasyPaisa'}
                  </button>
                </div>
              </div>
            )}

            {/* Admin Notice */}
            {currentUser.role === 'admin' && (
              <div className="mt-8 bg-purple-500/10 border border-purple-500/30 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-purple-400" />
                </div>
                <h5 className="text-purple-400 font-bold mb-2">Admin Account</h5>
                <p className="text-gray-400 text-sm">
                  You have unlimited tokens and don't need to withdraw. Use the admin panel to manage player tokens and payments.
                </p>
              </div>
            )}

            {/* Exchange Process */}
            <div className="mt-8 bg-slate-800/30 rounded-xl p-6">
              <h5 className="text-white font-bold mb-4">How Token Exchange Works</h5>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-400 font-bold text-lg">1</span>
                  </div>
                  <h6 className="text-white font-semibold mb-2">Request</h6>
                  <p className="text-gray-400 text-sm">Submit withdrawal request with your mobile number</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-400 font-bold text-lg">2</span>
                  </div>
                  <h6 className="text-white font-semibold mb-2">Review</h6>
                  <p className="text-gray-400 text-sm">Admin reviews and approves your request</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-400 font-bold text-lg">3</span>
                  </div>
                  <h6 className="text-white font-semibold mb-2">Process</h6>
                  <p className="text-gray-400 text-sm">Money is sent to your mobile wallet</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="text-blue-400" size={20} />
                  </div>
                  <h6 className="text-white font-semibold mb-2">Complete</h6>
                  <p className="text-gray-400 text-sm">Receive confirmation and funds</p>
                </div>
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

      {/* Payment Modal - Only for regular players */}
      {currentUser.role !== 'admin' && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSubmit={handlePaymentSubmit}
        />
      )}

      {/* Withdrawal Modal - Only for regular players */}
      {currentUser.role !== 'admin' && (
        <WithdrawalModal
          isOpen={showWithdrawalModal}
          onClose={() => setShowWithdrawalModal(false)}
          currentTokens={getCurrentPlayerTokens()}
        />
      )}
    </div>
  );
};

export default Dashboard;