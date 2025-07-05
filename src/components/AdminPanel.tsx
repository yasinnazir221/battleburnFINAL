import React, { useState, useEffect } from 'react';
import { Plus, Edit, Save, X, Users, Trophy, Calendar, Coins, Settings, Shield, Clock, MapPin, Award, Trash2, Eye, EyeOff, Instagram, Youtube, Twitter, Facebook, Globe, Link, CheckCircle, XCircle, AlertTriangle, DollarSign, CreditCard, FileImage, ZoomIn, Download } from 'lucide-react';
import { Tournament, Player, PaymentRequest } from '../types';

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
  const [activeTab, setActiveTab] = useState<'tournaments' | 'players' | 'create' | 'banner' | 'payments'>('payments');
  const [editingTournament, setEditingTournament] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Tournament>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [socialBanner, setSocialBanner] = useState<SocialMediaBanner>({
    instagram: '',
    youtube: '',
    twitter: '',
    facebook: '',
    website: '',
    discord: '',
    enabled: false
  });
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

  // Load social banner data
  useEffect(() => {
    const savedBanner = localStorage.getItem('socialBanner');
    if (savedBanner) {
      setSocialBanner(JSON.parse(savedBanner));
    }
  }, []);

  const pendingPayments = paymentRequests.filter(r => r.status === 'pending');
  const processedPayments = paymentRequests.filter(r => r.status !== 'pending');

  const handleCreateTournament = () => {
    if (!newTournament.title || !newTournament.description || !newTournament.dateTime) {
      alert('Please fill in all required fields');
      return;
    }

    const tournament: Omit<Tournament, 'id'> = {
      ...newTournament,
      status: 'waiting',
      currentPlayers: 0,
      participants: [],
      matches: [],
      createdAt: new Date().toISOString()
    };

    onCreateTournament(tournament);
    
    // Reset form
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
    
    setShowCreateForm(false);
    setActiveTab('tournaments');
    alert('Tournament created successfully!');
  };

  const handleEditTournament = (tournament: Tournament) => {
    setEditingTournament(tournament.id);
    setEditForm(tournament);
  };

  const handleSaveEdit = () => {
    if (!editingTournament) return;
    
    onUpdateTournament(editingTournament, editForm);
    setEditingTournament(null);
    setEditForm({});
  };

  const handleCancelEdit = () => {
    setEditingTournament(null);
    setEditForm({});
  };

  const handleSaveBanner = () => {
    localStorage.setItem('socialBanner', JSON.stringify(socialBanner));
    alert('Social media banner settings saved!');
  };

  const handleApprovePayment = (requestId: string) => {
    if (confirm('Are you sure you want to approve this payment? Tokens will be added to the player\'s account.')) {
      onApprovePayment(requestId);
    }
  };

  const handleRejectPayment = (requestId: string) => {
    const reason = prompt('Enter rejection reason (optional):');
    if (confirm('Are you sure you want to reject this payment?')) {
      onRejectPayment(requestId, reason || undefined);
    }
  };

  // Generate a mock screenshot URL for demo purposes
  const generateMockScreenshot = (requestId: string) => {
    // In a real app, this would be the actual uploaded screenshot URL
    // For demo, we'll create a placeholder image with payment details
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Background
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, 400, 600);
      
      // Header
      ctx.fillStyle = '#f97316';
      ctx.fillRect(0, 0, 400, 80);
      
      // JazzCash logo area
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('JazzCash', 200, 50);
      
      // Payment details
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'left';
      
      const request = paymentRequests.find(r => r.id === requestId);
      if (request) {
        ctx.fillText('Payment Confirmation', 20, 120);
        ctx.fillText(`Amount: Rs. ${request.amount}`, 20, 160);
        ctx.fillText('To: 03092198628', 20, 180);
        ctx.fillText(`From: ${request.userEmail}`, 20, 200);
        ctx.fillText('Status: Successful', 20, 220);
        ctx.fillText(`Date: ${new Date(request.submittedAt).toLocaleDateString()}`, 20, 240);
        ctx.fillText(`Time: ${new Date(request.submittedAt).toLocaleTimeString()}`, 20, 260);
        ctx.fillText('Transaction ID: JC' + requestId.slice(-8).toUpperCase(), 20, 280);
      }
      
      // Success indicator
      ctx.fillStyle = '#10b981';
      ctx.fillRect(20, 320, 360, 60);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('✓ PAYMENT SUCCESSFUL', 200, 355);
      
      // Footer
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px Arial';
      ctx.fillText('This is a demo screenshot for testing purposes', 200, 550);
    }
    
    return canvas.toDataURL('image/png');
  };

  const handleViewScreenshot = (requestId: string) => {
    const screenshotUrl = generateMockScreenshot(requestId);
    setSelectedScreenshot(screenshotUrl);
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

  const getPaymentStatusColor = (status: PaymentRequest['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

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
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-2xl border border-red-500/20 p-8">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Admin Control Panel</h2>
            <p className="text-gray-300">Manage tournaments, players, payments, and platform settings</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <TabButton id="payments" icon={CreditCard} label="Payment Requests" badge={pendingPayments.length} />
        <TabButton id="tournaments" icon={Trophy} label="Tournaments" />
        <TabButton id="players" icon={Users} label="Players" />
        <TabButton id="create" icon={Plus} label="Create Tournament" />
        <TabButton id="banner" icon={Settings} label="Social Banner" />
      </div>

      {/* Content Sections */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">Payment Management</h3>
            <div className="flex items-center gap-4">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-2">
                <span className="text-yellow-400 font-bold">{pendingPayments.length}</span>
                <span className="text-gray-400 text-sm ml-2">Pending</span>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2">
                <span className="text-green-400 font-bold">{paymentRequests.filter(r => r.status === 'approved').length}</span>
                <span className="text-gray-400 text-sm ml-2">Approved</span>
              </div>
            </div>
          </div>

          {/* Pending Payments */}
          {pendingPayments.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Pending Payment Requests ({pendingPayments.length})
              </h4>
              
              {pendingPayments.map(request => (
                <div key={request.id} className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div>
                        <h5 className="text-white font-bold">{request.username}</h5>
                        <p className="text-gray-400 text-sm">{request.userEmail}</p>
                        <p className="text-yellow-400 font-semibold">{request.amount} PKR → {request.amount} Tokens</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${getPaymentStatusColor(request.status)}`}>
                      {request.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <p className="text-gray-400 text-sm">Payment Method</p>
                      <p className="text-white font-semibold capitalize">{request.method}</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <p className="text-gray-400 text-sm">Submitted</p>
                      <p className="text-white font-semibold">{new Date(request.submittedAt).toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <p className="text-gray-400 text-sm">Screenshot</p>
                      <div className="flex items-center gap-2">
                        <FileImage className="w-4 h-4 text-blue-400" />
                        <span className="text-white text-sm">{request.screenshotName}</span>
                        <button
                          onClick={() => handleViewScreenshot(request.id)}
                          className="ml-2 p-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition-colors"
                          title="View Screenshot"
                        >
                          <ZoomIn className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-gray-500 text-xs">{(request.screenshotSize / 1024).toFixed(1)} KB</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <p className="text-gray-400 text-sm">User ID</p>
                      <p className="text-white font-mono text-sm">{request.userId}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleViewScreenshot(request.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Screenshot
                    </button>
                    <button
                      onClick={() => handleApprovePayment(request.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve & Add {request.amount} Tokens
                    </button>
                    <button
                      onClick={() => handleRejectPayment(request.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Processed Payments */}
          {processedPayments.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-gray-300">Payment History ({processedPayments.length})</h4>
              
              <div className="grid gap-4">
                {processedPayments.slice(0, 10).map(request => (
                  <div key={request.id} className={`rounded-xl p-4 border ${
                    request.status === 'approved' 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          request.status === 'approved' ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}>
                          {request.status === 'approved' ? 
                            <CheckCircle className="w-4 h-4 text-green-400" /> : 
                            <XCircle className="w-4 h-4 text-red-400" />
                          }
                        </div>
                        <div>
                          <p className="text-white font-semibold">{request.username}</p>
                          <p className="text-gray-400 text-sm">{request.amount} PKR</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewScreenshot(request.id)}
                          className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition-colors"
                          title="View Screenshot"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getPaymentStatusColor(request.status)}`}>
                            {request.status.toUpperCase()}
                          </span>
                          <p className="text-gray-400 text-xs mt-1">
                            {request.processedAt ? new Date(request.processedAt).toLocaleDateString() : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                    {request.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-500/10 rounded border border-red-500/30">
                        <p className="text-red-400 text-sm">Reason: {request.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {paymentRequests.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No payment requests yet.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'tournaments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">Tournament Management</h3>
            <button
              onClick={() => setActiveTab('create')}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Tournament
            </button>
          </div>
          
          <div className="grid gap-6">
            {tournaments.map(tournament => (
              <div key={tournament.id} className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
                {editingTournament === tournament.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Title</label>
                        <input
                          type="text"
                          value={editForm.title || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Entry Fee</label>
                        <input
                          type="number"
                          value={editForm.entryFee || 0}
                          onChange={(e) => setEditForm(prev => ({ ...prev, entryFee: parseInt(e.target.value) }))}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Description</label>
                      <textarea
                        value={editForm.description || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        rows={2}
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Date & Time</label>
                        <input
                          type="datetime-local"
                          value={editForm.dateTime ? new Date(editForm.dateTime).toISOString().slice(0, 16) : ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, dateTime: new Date(e.target.value).toISOString() }))}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Max Players</label>
                        <input
                          type="number"
                          value={editForm.maxPlayers || 0}
                          onChange={(e) => setEditForm(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) }))}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Status</label>
                        <select
                          value={editForm.status || 'waiting'}
                          onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as Tournament['status'] }))}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        >
                          <option value="waiting">Waiting</option>
                          <option value="full">Full</option>
                          <option value="live">Live</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Kill Reward</label>
                        <input
                          type="number"
                          value={editForm.killReward || 0}
                          onChange={(e) => setEditForm(prev => ({ ...prev, killReward: parseInt(e.target.value) }))}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Booyah Reward</label>
                        <input
                          type="number"
                          value={editForm.booyahReward || 0}
                          onChange={(e) => setEditForm(prev => ({ ...prev, booyahReward: parseInt(e.target.value) }))}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Room ID</label>
                        <input
                          type="text"
                          value={editForm.roomId || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, roomId: e.target.value }))}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Room Password</label>
                        <input
                          type="text"
                          value={editForm.roomPassword || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, roomPassword: e.target.value }))}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleSaveEdit}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-white mb-1">{tournament.title}</h4>
                        <p className="text-gray-400 text-sm">{tournament.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${getStatusColor(tournament.status)}`}>
                          {tournament.status.toUpperCase()}
                        </span>
                        <button
                          onClick={() => handleEditTournament(tournament)}
                          className="p-2 text-gray-400 hover:text-orange-400 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <span className="text-blue-400 text-sm font-semibold">Date</span>
                        </div>
                        <p className="text-white text-sm">{new Date(tournament.dateTime).toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <Users className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 text-sm font-semibold">Players</span>
                        </div>
                        <p className="text-white text-sm">{tournament.participants.length}/{tournament.maxPlayers}</p>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <Coins className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-400 text-sm font-semibold">Entry Fee</span>
                        </div>
                        <p className="text-white text-sm">{tournament.entryFee} tokens</p>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <Award className="w-4 h-4 text-purple-400" />
                          <span className="text-purple-400 text-sm font-semibold">Rewards</span>
                        </div>
                        <p className="text-white text-sm">{tournament.killReward}K | {tournament.booyahReward}B</p>
                      </div>
                    </div>

                    {tournament.roomId && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 font-semibold">Room Details</span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-400 text-xs">Room ID</p>
                            <p className="text-white font-mono">{tournament.roomId}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Password</p>
                            <p className="text-white font-mono">{tournament.roomPassword}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'players' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white">Player Management</h3>
          
          <div className="grid gap-4">
            {players.map(player => (
              <div key={player.id} className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold">{player.username}</h4>
                      <p className="text-gray-400 text-sm">{player.email}</p>
                      <p className="text-gray-500 text-xs">UID: {player.gameUid}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <Coins className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-400 font-bold text-lg">{player.tokens}</span>
                      </div>
                      <p className="text-gray-400 text-sm">tokens</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const amount = prompt('Enter token amount to add:');
                          if (amount && !isNaN(Number(amount))) {
                            onAddTokens(player.id, Number(amount), 'Admin manual credit');
                          }
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Add Tokens
                      </button>
                      <button
                        onClick={() => {
                          const amount = prompt('Enter token amount to deduct:');
                          if (amount && !isNaN(Number(amount))) {
                            onAddTokens(player.id, -Number(amount), 'Admin manual deduction');
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Deduct
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white">Create New Tournament</h3>
          
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Tournament Title *</label>
                  <input
                    type="text"
                    value={newTournament.title}
                    onChange={(e) => setNewTournament(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
                    placeholder="Enter tournament title"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Mode</label>
                  <select
                    value={newTournament.mode}
                    onChange={(e) => setNewTournament(prev => ({ ...prev, mode: e.target.value as '1v1' | 'squad' }))}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white"
                  >
                    <option value="1v1">1v1</option>
                    <option value="squad">Squad</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Description *</label>
                <textarea
                  value={newTournament.description}
                  onChange={(e) => setNewTournament(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
                  placeholder="Enter tournament description"
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={newTournament.dateTime}
                    onChange={(e) => setNewTournament(prev => ({ ...prev, dateTime: e.target.value }))}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Entry Fee (tokens)</label>
                  <input
                    type="number"
                    value={newTournament.entryFee}
                    onChange={(e) => setNewTournament(prev => ({ ...prev, entryFee: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Max Players</label>
                  <input
                    type="number"
                    value={newTournament.maxPlayers}
                    onChange={(e) => setNewTournament(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Kill Reward (tokens)</label>
                  <input
                    type="number"
                    value={newTournament.killReward}
                    onChange={(e) => setNewTournament(prev => ({ ...prev, killReward: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Booyah Reward (tokens)</label>
                  <input
                    type="number"
                    value={newTournament.booyahReward}
                    onChange={(e) => setNewTournament(prev => ({ ...prev, booyahReward: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Room ID</label>
                  <input
                    type="text"
                    value={newTournament.roomId}
                    onChange={(e) => setNewTournament(prev => ({ ...prev, roomId: e.target.value }))}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
                    placeholder="Enter room ID"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Room Password</label>
                  <input
                    type="text"
                    value={newTournament.roomPassword}
                    onChange={(e) => setNewTournament(prev => ({ ...prev, roomPassword: e.target.value }))}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
                    placeholder="Enter room password"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleCreateTournament}
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition-all flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Tournament
                </button>
                <button
                  onClick={() => setActiveTab('tournaments')}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'banner' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white">Social Media Banner</h3>
          
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-bold mb-1">Banner Settings</h4>
                  <p className="text-gray-400 text-sm">Configure social media links for the player dashboard banner</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">Enable Banner</span>
                  <button
                    onClick={() => setSocialBanner(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      socialBanner.enabled ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      socialBanner.enabled ? 'translate-x-7' : 'translate-x-1'
                    }`} />
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
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
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
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
                    placeholder="https://youtube.com/yourchannel"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2 flex items-center gap-2">
                    <Twitter className="w-4 h-4 text-blue-400" />
                    Twitter/X URL
                  </label>
                  <input
                    type="url"
                    value={socialBanner.twitter || ''}
                    onChange={(e) => setSocialBanner(prev => ({ ...prev, twitter: e.target.value }))}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
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
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
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
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2 flex items-center gap-2">
                    <Link className="w-4 h-4 text-indigo-400" />
                    Discord URL
                  </label>
                  <input
                    type="url"
                    value={socialBanner.discord || ''}
                    onChange={(e) => setSocialBanner(prev => ({ ...prev, discord: e.target.value }))}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
                    placeholder="https://discord.gg/yourinvite"
                  />
                </div>
              </div>

              {/* Preview */}
              {socialBanner.enabled && (socialBanner.instagram || socialBanner.youtube || socialBanner.twitter || socialBanner.facebook || socialBanner.website || socialBanner.discord) && (
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h5 className="text-white font-semibold mb-3">Preview:</h5>
                  <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-4">
                    <div className="text-center mb-3">
                      <h6 className="text-white font-bold">🔥 Follow Us on Social Media! 🔥</h6>
                      <p className="text-gray-300 text-sm">Stay updated with latest tournaments, tips, and exclusive content</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {socialBanner.instagram && (
                        <div className="flex items-center gap-2 bg-pink-500/20 text-pink-400 px-3 py-1 rounded-lg text-sm">
                          <Instagram size={14} />
                          Instagram
                        </div>
                      )}
                      {socialBanner.youtube && (
                        <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-lg text-sm">
                          <Youtube size={14} />
                          YouTube
                        </div>
                      )}
                      {socialBanner.twitter && (
                        <div className="flex items-center gap-2 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-sm">
                          <Twitter size={14} />
                          Twitter
                        </div>
                      )}
                      {socialBanner.facebook && (
                        <div className="flex items-center gap-2 bg-blue-600/20 text-blue-500 px-3 py-1 rounded-lg text-sm">
                          <Facebook size={14} />
                          Facebook
                        </div>
                      )}
                      {socialBanner.website && (
                        <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-sm">
                          <Globe size={14} />
                          Website
                        </div>
                      )}
                      {socialBanner.discord && (
                        <div className="flex items-center gap-2 bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-lg text-sm">
                          <Link size={14} />
                          Discord
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleSaveBanner}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Banner Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Modal */}
      {selectedScreenshot && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-orange-500/30 max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileImage className="text-blue-400" />
                Payment Screenshot
              </h2>
              <button
                onClick={() => setSelectedScreenshot(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                <img
                  src={selectedScreenshot}
                  alt="Payment Screenshot"
                  className="w-full max-h-96 object-contain rounded-lg"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = selectedScreenshot;
                    link.download = 'payment-screenshot.png';
                    link.click();
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => setSelectedScreenshot(null)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;