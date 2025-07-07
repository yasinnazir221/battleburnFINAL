import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Trophy, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar, 
  Clock, 
  Coins, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  ExternalLink,
  Image as ImageIcon,
  Loader,
  Copy,
  Settings,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Globe,
  Link as LinkIcon,
  Save
} from 'lucide-react';
import { Tournament, Player, PaymentRequest, User } from '../types';
import { getScreenshotURL } from '../utils/imageStorage';

interface AdminPanelProps {
  tournaments: Tournament[];
  players: Player[];
  paymentRequests: PaymentRequest[];
  onCreateTournament: (tournament: Omit<Tournament, 'id'>) => void;
  onUpdateTournament: (id: string, updates: Partial<Tournament>) => void;
  onAddTokens: (playerId: string, amount: number, reason: string) => void;
  onApprovePayment: (requestId: string) => void;
  onRejectPayment: (requestId: string, reason?: string) => void;
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

const AdminPanel: React.FC<AdminPanelProps> = ({
  tournaments,
  players,
  paymentRequests,
  onCreateTournament,
  onUpdateTournament,
  onAddTokens,
  onApprovePayment,
  onRejectPayment
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tournaments' | 'players' | 'payments' | 'settings'>('overview');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRequest | null>(null);
  const [screenshotUrls, setScreenshotUrls] = useState<Record<string, string>>({});
  const [loadingScreenshots, setLoadingScreenshots] = useState<Record<string, boolean>>({});
  const [socialBanner, setSocialBanner] = useState<SocialMediaBanner>({
    instagram: '',
    youtube: '',
    twitter: '',
    facebook: '',
    website: '',
    discord: '',
    enabled: false
  });

  // Load social banner settings
  useEffect(() => {
    const savedBanner = localStorage.getItem('socialBanner');
    if (savedBanner) {
      setSocialBanner(JSON.parse(savedBanner));
    }
  }, []);

  // Load screenshot URLs for payment requests
  useEffect(() => {
    const loadScreenshots = async () => {
      for (const request of paymentRequests) {
        if (request.screenshotURL && !screenshotUrls[request.id] && !loadingScreenshots[request.id]) {
          setLoadingScreenshots(prev => ({ ...prev, [request.id]: true }));
          
          try {
            // If we have a direct URL, use it
            if (request.screenshotURL.startsWith('http')) {
              setScreenshotUrls(prev => ({ ...prev, [request.id]: request.screenshotURL! }));
            } else if (request.screenshotPath) {
              // If we have a storage path, get the URL
              const url = await getScreenshotURL(request.screenshotPath);
              setScreenshotUrls(prev => ({ ...prev, [request.id]: url }));
            }
          } catch (error) {
            console.error('Failed to load screenshot for request:', request.id, error);
            // Create a placeholder for failed loads
            setScreenshotUrls(prev => ({ ...prev, [request.id]: 'error' }));
          } finally {
            setLoadingScreenshots(prev => ({ ...prev, [request.id]: false }));
          }
        }
      }
    };

    loadScreenshots();
  }, [paymentRequests, screenshotUrls, loadingScreenshots]);

  const [newTournament, setNewTournament] = useState({
    title: '',
    description: '',
    mode: '1v1' as '1v1' | 'squad',
    entryFee: 20,
    killReward: 5,
    booyahReward: 100,
    dateTime: '',
    maxPlayers: 40,
    roomId: '',
    roomPassword: '',
    rules: ['No cheating allowed', 'Use registered UID only']
  });

  const handleCreateTournament = () => {
    if (!newTournament.title || !newTournament.dateTime) return;
    
    onCreateTournament({
      ...newTournament,
      status: 'waiting',
      currentPlayers: 0,
      participants: [],
      matches: [],
      createdAt: new Date().toISOString()
    });
    
    setShowCreateForm(false);
    setNewTournament({
      title: '',
      description: '',
      mode: '1v1',
      entryFee: 20,
      killReward: 5,
      booyahReward: 100,
      dateTime: '',
      maxPlayers: 40,
      roomId: '',
      roomPassword: '',
      rules: ['No cheating allowed', 'Use registered UID only']
    });
  };

  const handleUpdateTournament = (tournament: Tournament, updates: Partial<Tournament>) => {
    onUpdateTournament(tournament.id, updates);
    setEditingTournament(null);
  };

  const handleApprovePayment = (request: PaymentRequest) => {
    onApprovePayment(request.id);
    setSelectedPayment(null);
  };

  const handleRejectPayment = (request: PaymentRequest) => {
    const reason = prompt('Enter rejection reason (optional):');
    onRejectPayment(request.id, reason || undefined);
    setSelectedPayment(null);
  };

  const saveSocialBanner = () => {
    localStorage.setItem('socialBanner', JSON.stringify(socialBanner));
    alert('Social media banner settings saved!');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const pendingPayments = paymentRequests.filter(r => r.status === 'pending');
  const totalTokensInCirculation = players.reduce((sum, player) => sum + player.tokens, 0);
  const totalRevenue = paymentRequests
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + r.amount, 0);

  const TabButton = ({ id, icon: Icon, label, badge }: { id: string; icon: any; label: string; badge?: number }) => (
    <button
      onClick={() => setActiveTab(id as any)}
      className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all relative ${
        activeTab === id
          ? 'bg-orange-500 text-black font-semibold'
          : 'text-gray-400 hover:text-orange-400 hover:bg-gray-800/50'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
      {badge && badge > 0 && (
        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-1">
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-purple-500/10 to-orange-500/10 rounded-2xl border border-purple-500/20 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Shield className="text-purple-400" />
              Admin Control Panel
            </h2>
            <p className="text-gray-300">Manage tournaments, players, and payments</p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-400 text-2xl font-bold">{players.length}</p>
              <p className="text-gray-400 text-sm">Players</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-400 text-2xl font-bold">{tournaments.length}</p>
              <p className="text-gray-400 text-sm">Tournaments</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-400 text-2xl font-bold">{totalTokensInCirculation}</p>
              <p className="text-gray-400 text-sm">Total Tokens</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <TabButton id="overview" icon={Shield} label="Overview" />
        <TabButton id="tournaments" icon={Trophy} label="Tournaments" />
        <TabButton id="players" icon={Users} label="Players" />
        <TabButton id="payments" icon={Coins} label="Payments" badge={pendingPayments.length} />
        <TabButton id="settings" icon={Settings} label="Settings" />
      </div>

      {/* Content Sections */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white">Dashboard Overview</h3>
          
          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Players</p>
                  <p className="text-white text-2xl font-bold">{players.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Tournaments</p>
                  <p className="text-white text-2xl font-bold">
                    {tournaments.filter(t => t.status === 'waiting' || t.status === 'live').length}
                  </p>
                </div>
                <Trophy className="w-8 h-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Pending Payments</p>
                  <p className="text-white text-2xl font-bold">{pendingPayments.length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Revenue</p>
                  <p className="text-white text-2xl font-bold">{totalRevenue} PKR</p>
                </div>
                <Coins className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
            <h4 className="text-white font-bold mb-4">Recent Payment Requests</h4>
            {pendingPayments.length > 0 ? (
              <div className="space-y-3">
                {pendingPayments.slice(0, 5).map(request => (
                  <div key={request.id} className="flex items-center justify-between bg-gray-700/50 rounded-lg p-4">
                    <div>
                      <p className="text-white font-semibold">{request.username}</p>
                      <p className="text-gray-400 text-sm">{request.amount} PKR • {new Date(request.submittedAt).toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPayment(request);
                        setActiveTab('payments');
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-black font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No pending payment requests</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">Payment Management</h3>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400">Pending: {pendingPayments.length}</span>
            </div>
          </div>

          {/* Payment Requests */}
          <div className="space-y-4">
            {paymentRequests.length > 0 ? (
              paymentRequests.map(request => (
                <div key={request.id} className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className="text-white font-bold">{request.username}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                          request.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {request.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-gray-400 text-sm">Amount</p>
                          <p className="text-white font-semibold">{request.amount} PKR → {request.amount} Tokens</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Submitted</p>
                          <p className="text-white">{new Date(request.submittedAt).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Email</p>
                          <p className="text-white">{request.userEmail}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Method</p>
                          <p className="text-white capitalize">{request.method}</p>
                        </div>
                      </div>

                      {/* Screenshot Section */}
                      <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-white font-semibold flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" />
                            Payment Screenshot
                          </h5>
                          {request.screenshotURL && (
                            <a
                              href={screenshotUrls[request.id] || request.screenshotURL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Open Full Size
                            </a>
                          )}
                        </div>
                        
                        {loadingScreenshots[request.id] ? (
                          <div className="flex items-center justify-center h-32 bg-gray-600/50 rounded-lg">
                            <Loader className="w-6 h-6 text-gray-400 animate-spin" />
                            <span className="text-gray-400 ml-2">Loading screenshot...</span>
                          </div>
                        ) : screenshotUrls[request.id] && screenshotUrls[request.id] !== 'error' ? (
                          <div className="relative">
                            <img
                              src={screenshotUrls[request.id]}
                              alt="Payment screenshot"
                              className="w-full max-w-md h-48 object-contain bg-gray-600/50 rounded-lg"
                              onError={() => {
                                console.error('Failed to load screenshot:', request.id);
                                setScreenshotUrls(prev => ({ ...prev, [request.id]: 'error' }));
                              }}
                            />
                          </div>
                        ) : request.screenshotURL ? (
                          <div className="flex items-center justify-center h-32 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <div className="text-center">
                              <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                              <p className="text-red-400 text-sm">Failed to load screenshot</p>
                              <button
                                onClick={() => {
                                  // Retry loading
                                  setScreenshotUrls(prev => {
                                    const newUrls = { ...prev };
                                    delete newUrls[request.id];
                                    return newUrls;
                                  });
                                }}
                                className="text-blue-400 hover:text-blue-300 text-xs mt-1"
                              >
                                Retry
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-32 bg-gray-600/50 rounded-lg">
                            <div className="text-center">
                              <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-400 text-sm">No screenshot available</p>
                            </div>
                          </div>
                        )}
                        
                        {request.screenshotName && (
                          <div className="mt-3 text-xs text-gray-400">
                            <p>File: {request.screenshotName}</p>
                            {request.screenshotSize && (
                              <p>Size: {(request.screenshotSize / 1024).toFixed(1)} KB</p>
                            )}
                          </div>
                        )}
                      </div>

                      {request.status === 'rejected' && request.rejectionReason && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                          <p className="text-red-400 text-sm">
                            <strong>Rejection Reason:</strong> {request.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {request.status === 'pending' && (
                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => handleApprovePayment(request)}
                          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectPayment(request)}
                          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Coins className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No payment requests yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'tournaments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">Tournament Management</h3>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Tournament
            </button>
          </div>

          {/* Create Tournament Form */}
          {showCreateForm && (
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
              <h4 className="text-white font-bold mb-4">Create New Tournament</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Title</label>
                  <input
                    type="text"
                    value={newTournament.title}
                    onChange={(e) => setNewTournament(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    placeholder="Tournament title"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Mode</label>
                  <select
                    value={newTournament.mode}
                    onChange={(e) => setNewTournament(prev => ({ ...prev, mode: e.target.value as '1v1' | 'squad' }))}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="1v1">1v1</option>
                    <option value="squad">Squad</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Entry Fee (Tokens)</label>
                  <input
                    type="number"
                    value={newTournament.entryFee}
                    onChange={(e) => setNewTournament(prev => ({ ...prev, entryFee: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Max Players</label>
                  <input
                    type="number"
                    value={newTournament.maxPlayers}
                    onChange={(e) => setNewTournament(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Kill Reward</label>
                  <input
                    type="number"
                    value={newTournament.killReward}
                    onChange={(e) => setNewTournament(prev => ({ ...prev, killReward: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Booyah Reward</label>
                  <input
                    type="number"
                    value={newTournament.booyahReward}
                    onChange={(e) => setNewTournament(prev => ({ ...prev, booyahReward: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-300 text-sm mb-2">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newTournament.dateTime}
                    onChange={(e) => setNewTournament(prev => ({ ...prev, dateTime: e.target.value }))}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-300 text-sm mb-2">Description</label>
                  <textarea
                    value={newTournament.description}
                    onChange={(e) => setNewTournament(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    rows={3}
                    placeholder="Tournament description"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTournament}
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black font-bold py-2 px-4 rounded-lg transition-all"
                >
                  Create Tournament
                </button>
              </div>
            </div>
          )}

          {/* Tournaments List */}
          <div className="space-y-4">
            {tournaments.map(tournament => (
              <div key={tournament.id} className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-white font-bold text-lg">{tournament.title}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        tournament.status === 'waiting' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        tournament.status === 'live' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        tournament.status === 'completed' ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {tournament.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-gray-400 mb-4">{tournament.description}</p>
                    
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Mode</p>
                        <p className="text-white font-semibold">{tournament.mode.toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Entry Fee</p>
                        <p className="text-white font-semibold">{tournament.entryFee} tokens</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Players</p>
                        <p className="text-white font-semibold">{tournament.participants.length}/{tournament.maxPlayers}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Date</p>
                        <p className="text-white font-semibold">{new Date(tournament.dateTime).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Room Details - Enhanced */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-white font-bold flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-green-400" />
                          Room Configuration
                        </h5>
                        <span className={`px-2 py-1 rounded text-xs ${
                          tournament.roomId && tournament.roomPassword 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {tournament.roomId && tournament.roomPassword ? 'Configured' : 'Pending Setup'}
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm mb-2 font-semibold">Room ID</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={tournament.roomId}
                            onChange={(e) => handleUpdateTournament(tournament, { roomId: e.target.value })}
                            className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Enter room ID"
                          />
                          {tournament.roomId && (
                            <button
                              onClick={() => copyToClipboard(tournament.roomId)}
                              className="p-2 text-gray-400 hover:text-green-400 transition-colors bg-gray-700/50 rounded-lg"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-2 font-semibold">Room Password</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={tournament.roomPassword}
                            onChange={(e) => handleUpdateTournament(tournament, { roomPassword: e.target.value })}
                            className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Enter password"
                          />
                          {tournament.roomPassword && (
                            <button
                              onClick={() => copyToClipboard(tournament.roomPassword)}
                              className="p-2 text-gray-400 hover:text-green-400 transition-colors bg-gray-700/50 rounded-lg"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      </div>
                      
                      {/* Room Status Info */}
                      <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-blue-400" />
                          <span className="text-blue-400 font-semibold text-sm">Room Access</span>
                        </div>
                        <p className="text-gray-400 text-xs">
                          {tournament.roomId && tournament.roomPassword ? (
                            <>
                              ✅ Room details are configured and will be automatically shown to {tournament.participants.length} registered players.
                              {tournament.participants.length === 0 && " No players have joined yet."}
                            </>
                          ) : (
                            "⚠️ Set room ID and password above. Only registered players who paid tokens will see these details."
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 ml-4">
                    {/* Status Selector */}
                    <select
                      value={tournament.status}
                      onChange={(e) => handleUpdateTournament(tournament, { status: e.target.value as any })}
                      className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm"
                    >
                      <option value="waiting">Waiting</option>
                      <option value="live">Live</option>
                      <option value="completed">Completed</option>
                    </select>
                    
                    {/* Quick Actions */}
                    {tournament.participants.length > 0 && (
                      <div className="text-center mt-2">
                        <p className="text-gray-400 text-xs mb-1">{tournament.participants.length} players joined</p>
                        {tournament.roomId && tournament.roomPassword && (
                          <span className="text-green-400 text-xs">✅ Room ready</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'players' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white">Player Management</h3>
          
          <div className="space-y-4">
            {players.map(player => (
              <div key={player.id} className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-white font-bold">{player.username}</h4>
                      <span className="text-gray-400 text-sm">({player.email})</span>
                    </div>
                    
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Tokens</p>
                        <p className="text-yellow-400 font-bold">{player.tokens}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Player ID</p>
                        <p className="text-white">{player.playerId}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Free Fire UID</p>
                        <p className="text-white">{player.gameUid}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Tournaments</p>
                        <p className="text-white">{player.registeredTournaments.length}</p>
                      </div>
                    </div>
                  </div>

                  {/* Token Management */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => {
                        const amount = prompt('Enter token amount to add (negative to subtract):');
                        if (amount) {
                          const tokenAmount = parseInt(amount);
                          const reason = prompt('Enter reason:') || 'Admin adjustment';
                          onAddTokens(player.id, tokenAmount, reason);
                        }
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Coins className="w-4 h-4" />
                      Adjust Tokens
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white">Platform Settings</h3>
          
          {/* Social Media Banner Settings */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-white font-bold text-lg">Social Media Banner</h4>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={socialBanner.enabled}
                    onChange={(e) => setSocialBanner(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-gray-300 text-sm">Enable Banner</span>
                </label>
                <button
                  onClick={saveSocialBanner}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Settings
                </button>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-400" />
                  Instagram URL
                </label>
                <input
                  type="url"
                  value={socialBanner.instagram || ''}
                  onChange={(e) => setSocialBanner(prev => ({ ...prev, instagram: e.target.value }))}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  placeholder="https://instagram.com/yourpage"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <Youtube className="w-4 h-4 text-red-400" />
                  YouTube URL
                </label>
                <input
                  type="url"
                  value={socialBanner.youtube || ''}
                  onChange={(e) => setSocialBanner(prev => ({ ...prev, youtube: e.target.value }))}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  placeholder="https://youtube.com/yourchannel"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <Twitter className="w-4 h-4 text-blue-400" />
                  Twitter URL
                </label>
                <input
                  type="url"
                  value={socialBanner.twitter || ''}
                  onChange={(e) => setSocialBanner(prev => ({ ...prev, twitter: e.target.value }))}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <Facebook className="w-4 h-4 text-blue-500" />
                  Facebook URL
                </label>
                <input
                  type="url"
                  value={socialBanner.facebook || ''}
                  onChange={(e) => setSocialBanner(prev => ({ ...prev, facebook: e.target.value }))}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-green-400" />
                  Website URL
                </label>
                <input
                  type="url"
                  value={socialBanner.website || ''}
                  onChange={(e) => setSocialBanner(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  placeholder="https://yourwebsite.com"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-indigo-400" />
                  Discord URL
                </label>
                <input
                  type="url"
                  value={socialBanner.discord || ''}
                  onChange={(e) => setSocialBanner(prev => ({ ...prev, discord: e.target.value }))}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  placeholder="https://discord.gg/yourinvite"
                />
              </div>
            </div>
            
            {/* Preview */}
            {socialBanner.enabled && (socialBanner.instagram || socialBanner.youtube || socialBanner.twitter || socialBanner.facebook || socialBanner.website || socialBanner.discord) && (
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl">
                <h5 className="text-white font-semibold mb-3">Preview:</h5>
                <div className="text-center mb-4">
                  <h6 className="text-white font-bold">🔥 Follow Us on Social Media! 🔥</h6>
                  <p className="text-gray-300 text-sm">Stay updated with latest tournaments, tips, and exclusive content</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {socialBanner.instagram && (
                    <div className="flex items-center gap-2 bg-pink-500/20 text-pink-400 px-3 py-1 rounded-lg text-sm">
                      <Instagram size={16} />
                      Instagram
                    </div>
                  )}
                  {socialBanner.youtube && (
                    <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-lg text-sm">
                      <Youtube size={16} />
                      YouTube
                    </div>
                  )}
                  {socialBanner.twitter && (
                    <div className="flex items-center gap-2 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-sm">
                      <Twitter size={16} />
                      Twitter
                    </div>
                  )}
                  {socialBanner.facebook && (
                    <div className="flex items-center gap-2 bg-blue-600/20 text-blue-500 px-3 py-1 rounded-lg text-sm">
                      <Facebook size={16} />
                      Facebook
                    </div>
                  )}
                  {socialBanner.website && (
                    <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-sm">
                      <Globe size={16} />
                      Website
                    </div>
                  )}
                  {socialBanner.discord && (
                    <div className="flex items-center gap-2 bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-lg text-sm">
                      <LinkIcon size={16} />
                      Discord
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;