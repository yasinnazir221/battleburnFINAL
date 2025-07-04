import React, { useState, useEffect } from 'react';
import { Plus, Edit, Users, Coins, Trophy, Settings, Play, Award, Clock, Trash2, Eye, EyeOff, Save, X, Check, AlertTriangle, DollarSign, Calendar, MapPin, Crown, Target, Zap, Activity, Database, Image, Download, ExternalLink, ArrowUpDown, Instagram, Youtube, Twitter, Facebook, Globe, Link } from 'lucide-react';
import { Tournament, Player } from '../types';

interface AdminPanelProps {
  tournaments: Tournament[];
  players: Player[];
  onCreateTournament: (tournament: Omit<Tournament, 'id'>) => void;
  onUpdateTournament: (id: string, updates: Partial<Tournament>) => void;
  onAddTokens: (playerId: string, amount: number, reason: string) => void;
}

interface PaymentSubmission {
  id: string;
  playerId: string;
  playerEmail: string;
  playerName: string;
  amount: number;
  paymentMethod: 'jazzcash' | 'easypaisa';
  screenshot: string; // Base64 or URL
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
}

interface WithdrawalRequest {
  id: string;
  playerId: string;
  playerEmail: string;
  playerName: string;
  amount: number;
  paymentMethod: 'jazzcash' | 'easypaisa';
  accountNumber: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
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
  onCreateTournament,
  onUpdateTournament,
  onAddTokens
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tournaments' | 'players' | 'payments' | 'withdrawals' | 'analytics' | 'banner'>('dashboard');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [bulkTokenAmount, setBulkTokenAmount] = useState(0);
  const [bulkTokenReason, setBulkTokenReason] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Social Media Banner State
  const [socialBanner, setSocialBanner] = useState<SocialMediaBanner>({
    instagram: '',
    youtube: '',
    twitter: '',
    facebook: '',
    website: '',
    discord: '',
    enabled: true
  });
  
  // Mock data for payment submissions and withdrawals
  const [paymentSubmissions, setPaymentSubmissions] = useState<PaymentSubmission[]>([
    {
      id: 'pay_1',
      playerId: 'player1',
      playerEmail: 'player@test.com',
      playerName: 'Test Player',
      amount: 500,
      paymentMethod: 'jazzcash',
      screenshot: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      timestamp: new Date().toISOString(),
      status: 'pending'
    }
  ]);

  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([
    {
      id: 'with_1',
      playerId: 'player1',
      playerEmail: 'player@test.com',
      playerName: 'Test Player',
      amount: 200,
      paymentMethod: 'jazzcash',
      accountNumber: '03001234567',
      timestamp: new Date().toISOString(),
      status: 'pending'
    }
  ]);
  
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
    if (newTournament.title && newTournament.dateTime) {
      onCreateTournament({
        ...newTournament,
        status: 'waiting',
        participants: [],
        matches: [],
        currentPlayers: 0,
        createdAt: new Date().toISOString()
      });
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
    }
  };

  const handleUpdateTournament = (tournament: Tournament, updates: Partial<Tournament>) => {
    onUpdateTournament(tournament.id, updates);
    setEditingTournament(null);
  };

  const handleBulkTokens = () => {
    if (selectedPlayers.length > 0 && bulkTokenAmount > 0) {
      selectedPlayers.forEach(playerId => {
        onAddTokens(playerId, bulkTokenAmount, bulkTokenReason || 'Bulk token distribution');
      });
      setSelectedPlayers([]);
      setBulkTokenAmount(0);
      setBulkTokenReason('');
    }
  };

  const handlePaymentAction = (paymentId: string, action: 'approve' | 'reject', notes?: string) => {
    setPaymentSubmissions(prev => prev.map(payment => {
      if (payment.id === paymentId) {
        if (action === 'approve') {
          // Credit tokens to player
          onAddTokens(payment.playerId, payment.amount, `Payment approved: ${payment.paymentMethod} - ${payment.amount} PKR`);
        }
        return {
          ...payment,
          status: action === 'approve' ? 'approved' : 'rejected',
          adminNotes: notes
        };
      }
      return payment;
    }));
  };

  const handleWithdrawalAction = (withdrawalId: string, action: 'approve' | 'reject', notes?: string) => {
    setWithdrawalRequests(prev => prev.map(withdrawal => {
      if (withdrawal.id === withdrawalId) {
        if (action === 'approve') {
          // Deduct tokens from player (already deducted when request was made)
          // In real app, you would process the actual payment here
        }
        return {
          ...withdrawal,
          status: action === 'approve' ? 'approved' : 'rejected',
          adminNotes: notes
        };
      }
      return withdrawal;
    }));
  };

  const handleSaveBanner = () => {
    // In a real app, you would save this to your backend/database
    localStorage.setItem('socialBanner', JSON.stringify(socialBanner));
    alert('Social media banner saved successfully!');
  };

  // Load banner data on component mount
  useEffect(() => {
    const savedBanner = localStorage.getItem('socialBanner');
    if (savedBanner) {
      setSocialBanner(JSON.parse(savedBanner));
    }
  }, []);

  const stats = {
    totalTournaments: tournaments.length,
    activeTournaments: tournaments.filter(t => t.status === 'live' || t.status === 'waiting').length,
    totalPlayers: players.length,
    pendingPayments: paymentSubmissions.filter(p => p.status === 'pending').length,
    pendingWithdrawals: withdrawalRequests.filter(w => w.status === 'pending').length,
    totalSlots: tournaments.reduce((sum, t) => sum + t.maxPlayers, 0),
    filledSlots: tournaments.reduce((sum, t) => sum + t.participants.length, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Settings className="text-purple-400" />
              Admin Panel
            </h1>
            <p className="text-slate-400 mt-2">Manage tournaments, players, payments and system settings</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-slate-800/50 p-2 rounded-xl backdrop-blur-sm">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Activity },
            { id: 'tournaments', label: 'Tournaments', icon: Trophy },
            { id: 'players', label: 'Players', icon: Users },
            { id: 'payments', label: `Payments (${stats.pendingPayments})`, icon: Image },
            { id: 'withdrawals', label: `Withdrawals (${stats.pendingWithdrawals})`, icon: ArrowUpDown },
            { id: 'banner', label: 'Social Banner', icon: Globe },
            { id: 'analytics', label: 'Analytics', icon: Database }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Tournaments</p>
                    <p className="text-2xl font-bold text-white">{stats.totalTournaments}</p>
                  </div>
                  <Trophy className="text-purple-400" size={24} />
                </div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Active Tournaments</p>
                    <p className="text-2xl font-bold text-white">{stats.activeTournaments}</p>
                  </div>
                  <Play className="text-green-400" size={24} />
                </div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Pending Payments</p>
                    <p className="text-2xl font-bold text-white">{stats.pendingPayments}</p>
                  </div>
                  <Image className="text-orange-400" size={24} />
                </div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Pending Withdrawals</p>
                    <p className="text-2xl font-bold text-white">{stats.pendingWithdrawals}</p>
                  </div>
                  <ArrowUpDown className="text-blue-400" size={24} />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Image className="text-orange-400" />
                  Recent Payment Submissions
                </h3>
                <div className="space-y-3">
                  {paymentSubmissions.slice(0, 3).map(payment => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                          <DollarSign className="text-orange-400" size={14} />
                        </div>
                        <div>
                          <p className="text-white font-medium">{payment.playerName}</p>
                          <p className="text-slate-400 text-sm">{payment.amount} PKR via {payment.paymentMethod}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        payment.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  ))}
                </div>
                {stats.pendingPayments > 0 && (
                  <button
                    onClick={() => setActiveTab('payments')}
                    className="w-full mt-4 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 py-2 rounded-lg transition-colors"
                  >
                    Review All Payments
                  </button>
                )}
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <ArrowUpDown className="text-blue-400" />
                  Recent Withdrawal Requests
                </h3>
                <div className="space-y-3">
                  {withdrawalRequests.slice(0, 3).map(withdrawal => (
                    <div key={withdrawal.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <ArrowUpDown className="text-blue-400" size={14} />
                        </div>
                        <div>
                          <p className="text-white font-medium">{withdrawal.playerName}</p>
                          <p className="text-slate-400 text-sm">{withdrawal.amount} tokens to {withdrawal.paymentMethod}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        withdrawal.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        withdrawal.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {withdrawal.status}
                      </span>
                    </div>
                  ))}
                </div>
                {stats.pendingWithdrawals > 0 && (
                  <button
                    onClick={() => setActiveTab('withdrawals')}
                    className="w-full mt-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-2 rounded-lg transition-colors"
                  >
                    Review All Withdrawals
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tournaments Tab */}
        {activeTab === 'tournaments' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Tournament Management</h2>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus size={18} />
                Create Tournament
              </button>
            </div>

            {/* Create Tournament Form */}
            {showCreateForm && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">Create New Tournament</h3>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Tournament Title"
                    value={newTournament.title}
                    onChange={(e) => setNewTournament({...newTournament, title: e.target.value})}
                    className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                  />
                  <select
                    value={newTournament.mode}
                    onChange={(e) => setNewTournament({...newTournament, mode: e.target.value as '1v1' | 'squad'})}
                    className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="1v1">1v1 Mode</option>
                    <option value="squad">Squad Mode</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Entry Fee"
                    value={newTournament.entryFee}
                    onChange={(e) => setNewTournament({...newTournament, entryFee: parseInt(e.target.value)})}
                    className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                  />
                  <input
                    type="number"
                    placeholder="Max Players"
                    value={newTournament.maxPlayers}
                    onChange={(e) => setNewTournament({...newTournament, maxPlayers: parseInt(e.target.value)})}
                    className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                  />
                  <input
                    type="datetime-local"
                    value={newTournament.dateTime}
                    onChange={(e) => setNewTournament({...newTournament, dateTime: e.target.value})}
                    className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Kill Reward"
                      value={newTournament.killReward}
                      onChange={(e) => setNewTournament({...newTournament, killReward: parseInt(e.target.value)})}
                      className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                    />
                    <input
                      type="number"
                      placeholder="Booyah Reward"
                      value={newTournament.booyahReward}
                      onChange={(e) => setNewTournament({...newTournament, booyahReward: parseInt(e.target.value)})}
                      className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Room ID"
                    value={newTournament.roomId}
                    onChange={(e) => setNewTournament({...newTournament, roomId: e.target.value})}
                    className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Room Password"
                    value={newTournament.roomPassword}
                    onChange={(e) => setNewTournament({...newTournament, roomPassword: e.target.value})}
                    className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                  />
                  <textarea
                    placeholder="Description"
                    value={newTournament.description}
                    onChange={(e) => setNewTournament({...newTournament, description: e.target.value})}
                    className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 md:col-span-2"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateTournament}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Create Tournament
                  </button>
                </div>
              </div>
            )}

            {/* Tournaments List */}
            <div className="grid gap-4">
              {tournaments.map(tournament => (
                <div key={tournament.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                  {editingTournament?.id === tournament.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <input
                          type="text"
                          value={editingTournament.title}
                          onChange={(e) => setEditingTournament({...editingTournament, title: e.target.value})}
                          placeholder="Tournament Title"
                          className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white"
                        />
                        <input
                          type="number"
                          value={editingTournament.entryFee}
                          onChange={(e) => setEditingTournament({...editingTournament, entryFee: parseInt(e.target.value)})}
                          placeholder="Entry Fee"
                          className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white"
                        />
                        <input
                          type="number"
                          value={editingTournament.maxPlayers}
                          onChange={(e) => setEditingTournament({...editingTournament, maxPlayers: parseInt(e.target.value)})}
                          placeholder="Max Players"
                          className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white"
                        />
                        <input
                          type="datetime-local"
                          value={editingTournament.dateTime}
                          onChange={(e) => setEditingTournament({...editingTournament, dateTime: e.target.value})}
                          className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white"
                        />
                        <input
                          type="number"
                          value={editingTournament.killReward}
                          onChange={(e) => setEditingTournament({...editingTournament, killReward: parseInt(e.target.value)})}
                          placeholder="Kill Reward"
                          className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white"
                        />
                        <input
                          type="number"
                          value={editingTournament.booyahReward}
                          onChange={(e) => setEditingTournament({...editingTournament, booyahReward: parseInt(e.target.value)})}
                          placeholder="Booyah Reward"
                          className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white"
                        />
                        <input
                          type="text"
                          value={editingTournament.roomId}
                          onChange={(e) => setEditingTournament({...editingTournament, roomId: e.target.value})}
                          placeholder="Room ID"
                          className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                        />
                        <input
                          type="text"
                          value={editingTournament.roomPassword}
                          onChange={(e) => setEditingTournament({...editingTournament, roomPassword: e.target.value})}
                          placeholder="Room Password"
                          className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                        />
                        <select
                          value={editingTournament.status}
                          onChange={(e) => setEditingTournament({...editingTournament, status: e.target.value as any})}
                          className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white"
                        >
                          <option value="waiting">Waiting</option>
                          <option value="live">Live</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      <textarea
                        value={editingTournament.description}
                        onChange={(e) => setEditingTournament({...editingTournament, description: e.target.value})}
                        placeholder="Description"
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                        rows={3}
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleUpdateTournament(tournament, editingTournament)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <Save size={16} />
                          Save Changes
                        </button>
                        <button
                          onClick={() => setEditingTournament(null)}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white">{tournament.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tournament.status === 'live' ? 'bg-green-500/20 text-green-400' :
                            tournament.status === 'waiting' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-slate-500/20 text-slate-400'
                          }`}>
                            {tournament.status}
                          </span>
                        </div>
                        <p className="text-slate-400 mb-3">{tournament.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <span className="text-slate-300 flex items-center gap-1">
                            <Users size={14} />
                            {tournament.participants.length}/{tournament.maxPlayers}
                          </span>
                          <span className="text-slate-300 flex items-center gap-1">
                            <Coins size={14} />
                            {tournament.entryFee} tokens
                          </span>
                          <span className="text-slate-300 flex items-center gap-1">
                            <Target size={14} />
                            {tournament.killReward} per kill
                          </span>
                          <span className="text-slate-300 flex items-center gap-1">
                            <Crown size={14} />
                            {tournament.booyahReward} booyah
                          </span>
                          <span className="text-slate-300 flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(tournament.dateTime).toLocaleDateString()}
                          </span>
                          {tournament.roomId && (
                            <span className="text-slate-300 flex items-center gap-1">
                              <MapPin size={14} />
                              Room: {tournament.roomId}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingTournament(tournament)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                          title="Edit Tournament"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Players Tab */}
        {activeTab === 'players' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Player Management</h2>
              <div className="flex gap-3">
                {selectedPlayers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Token amount"
                      value={bulkTokenAmount}
                      onChange={(e) => setBulkTokenAmount(parseInt(e.target.value))}
                      className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 w-32"
                    />
                    <input
                      type="text"
                      placeholder="Reason"
                      value={bulkTokenReason}
                      onChange={(e) => setBulkTokenReason(e.target.value)}
                      className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 w-40"
                    />
                    <button
                      onClick={handleBulkTokens}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Coins size={16} />
                      Add Tokens ({selectedPlayers.length})
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4">
              {players.map(player => (
                <div key={player.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedPlayers.includes(player.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPlayers([...selectedPlayers, player.id]);
                          } else {
                            setSelectedPlayers(selectedPlayers.filter(id => id !== player.id));
                          }
                        }}
                        className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                      />
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {player.displayName?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-bold">{player.displayName || 'Unknown Player'}</h3>
                        <p className="text-slate-400 text-sm">{player.email}</p>
                        <p className="text-slate-400 text-sm">UID: {player.gameUid || 'Not set'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-white font-bold flex items-center gap-1">
                          <Coins className="text-yellow-400" size={16} />
                          {player.tokens}
                        </p>
                        <p className="text-slate-400 text-sm">
                          Joined {new Date(player.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const amount = prompt('Enter token amount to add:');
                          const reason = prompt('Enter reason:');
                          if (amount && reason) {
                            onAddTokens(player.id, parseInt(amount), reason);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Submissions Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Payment Screenshot Reviews</h2>
            
            <div className="grid gap-6">
              {paymentSubmissions.map(payment => (
                <div key={payment.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Payment Details */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white">{payment.playerName}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          payment.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {payment.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Player Email:</span>
                          <span className="text-white">{payment.playerEmail}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Amount:</span>
                          <span className="text-white font-bold">{payment.amount} PKR</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Payment Method:</span>
                          <span className="text-white capitalize">{payment.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Submitted:</span>
                          <span className="text-white">{new Date(payment.timestamp).toLocaleString()}</span>
                        </div>
                      </div>

                      {payment.status === 'pending' && (
                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={() => handlePaymentAction(payment.id, 'approve')}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <Check size={16} />
                            Approve & Credit Tokens
                          </button>
                          <button
                            onClick={() => {
                              const notes = prompt('Enter rejection reason:');
                              if (notes) handlePaymentAction(payment.id, 'reject', notes);
                            }}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <X size={16} />
                            Reject
                          </button>
                        </div>
                      )}

                      {payment.adminNotes && (
                        <div className="bg-slate-700/50 rounded-lg p-3">
                          <p className="text-slate-400 text-sm">Admin Notes:</p>
                          <p className="text-white text-sm">{payment.adminNotes}</p>
                        </div>
                      )}
                    </div>

                    {/* Screenshot Preview */}
                    <div className="space-y-4">
                      <h4 className="text-white font-semibold">Payment Screenshot</h4>
                      <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                        <img
                          src={payment.screenshot}
                          alt="Payment screenshot"
                          className="max-w-full h-64 object-contain mx-auto rounded-lg border border-slate-600"
                        />
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => window.open(payment.screenshot, '_blank')}
                            className="flex-1 bg-slate-600 hover:bg-slate-500 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <ExternalLink size={16} />
                            View Full Size
                          </button>
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = payment.screenshot;
                              link.download = `payment_${payment.id}_${payment.playerName}.png`;
                              link.click();
                            }}
                            className="flex-1 bg-slate-600 hover:bg-slate-500 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <Download size={16} />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Withdrawal Requests Tab */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Token Withdrawal Requests</h2>
            
            <div className="grid gap-6">
              {withdrawalRequests.map(withdrawal => (
                <div key={withdrawal.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{withdrawal.playerName}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      withdrawal.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      withdrawal.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {withdrawal.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Player Email:</span>
                        <span className="text-white">{withdrawal.playerEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Withdrawal Amount:</span>
                        <span className="text-white font-bold">{withdrawal.amount} tokens</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">PKR Amount:</span>
                        <span className="text-white font-bold">{withdrawal.amount} PKR</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Payment Method:</span>
                        <span className="text-white capitalize">{withdrawal.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Account Number:</span>
                        <span className="text-white font-mono">{withdrawal.accountNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Requested:</span>
                        <span className="text-white">{new Date(withdrawal.timestamp).toLocaleString()}</span>
                      </div>
                    </div>

                    {withdrawal.status === 'pending' && (
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={() => handleWithdrawalAction(withdrawal.id, 'approve')}
                          className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <Check size={16} />
                          Approve & Process Payment
                        </button>
                        <button
                          onClick={() => {
                            const notes = prompt('Enter rejection reason:');
                            if (notes) handleWithdrawalAction(withdrawal.id, 'reject', notes);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <X size={16} />
                          Reject Request
                        </button>
                      </div>
                    )}
                  </div>

                  {withdrawal.adminNotes && (
                    <div className="bg-slate-700/50 rounded-lg p-3 mt-4">
                      <p className="text-slate-400 text-sm">Admin Notes:</p>
                      <p className="text-white text-sm">{withdrawal.adminNotes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social Media Banner Tab */}
        {activeTab === 'banner' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Social Media Banner</h2>
              <button
                onClick={handleSaveBanner}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Save size={18} />
                Save Banner
              </button>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Banner Settings</h3>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={socialBanner.enabled}
                    onChange={(e) => setSocialBanner({...socialBanner, enabled: e.target.checked})}
                    className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-white">Enable Banner</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Instagram */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-white font-medium">
                    <Instagram className="text-pink-400" size={20} />
                    Instagram
                  </label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/yourusername"
                    value={socialBanner.instagram}
                    onChange={(e) => setSocialBanner({...socialBanner, instagram: e.target.value})}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                  />
                </div>

                {/* YouTube */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-white font-medium">
                    <Youtube className="text-red-400" size={20} />
                    YouTube
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/@yourchannel"
                    value={socialBanner.youtube}
                    onChange={(e) => setSocialBanner({...socialBanner, youtube: e.target.value})}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                  />
                </div>

                {/* Twitter */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-white font-medium">
                    <Twitter className="text-blue-400" size={20} />
                    Twitter/X
                  </label>
                  <input
                    type="url"
                    placeholder="https://twitter.com/yourusername"
                    value={socialBanner.twitter}
                    onChange={(e) => setSocialBanner({...socialBanner, twitter: e.target.value})}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                  />
                </div>

                {/* Facebook */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-white font-medium">
                    <Facebook className="text-blue-500" size={20} />
                    Facebook
                  </label>
                  <input
                    type="url"
                    placeholder="https://facebook.com/yourpage"
                    value={socialBanner.facebook}
                    onChange={(e) => setSocialBanner({...socialBanner, facebook: e.target.value})}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                  />
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-white font-medium">
                    <Globe className="text-green-400" size={20} />
                    Website
                  </label>
                  <input
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={socialBanner.website}
                    onChange={(e) => setSocialBanner({...socialBanner, website: e.target.value})}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                  />
                </div>

                {/* Discord */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-white font-medium">
                    <Link className="text-indigo-400" size={20} />
                    Discord
                  </label>
                  <input
                    type="url"
                    placeholder="https://discord.gg/yourinvite"
                    value={socialBanner.discord}
                    onChange={(e) => setSocialBanner({...socialBanner, discord: e.target.value})}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            {socialBanner.enabled && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-xl font-bold text-white mb-4">Banner Preview</h3>
                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6">
                  <div className="text-center mb-4">
                    <h4 className="text-white font-bold text-lg">Follow Us on Social Media!</h4>
                    <p className="text-slate-300 text-sm">Stay updated with latest tournaments and news</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4">
                    {socialBanner.instagram && (
                      <a
                        href={socialBanner.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 px-4 py-2 rounded-lg transition-colors"
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
                        className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors"
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
                        className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg transition-colors"
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
                        className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-500 px-4 py-2 rounded-lg transition-colors"
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
                        className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg transition-colors"
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
                        className="flex items-center gap-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 px-4 py-2 rounded-lg transition-colors"
                      >
                        <Link size={18} />
                        Discord
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Analytics & Reports</h2>
            
            <div className="grid gap-6">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Activity className="text-purple-400" />
                  System Overview
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-white">{stats.totalPlayers}</p>
                    <p className="text-slate-400 text-sm">Total Players</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-white">{stats.totalTournaments}</p>
                    <p className="text-slate-400 text-sm">Total Tournaments</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-white">{Math.round((stats.filledSlots / stats.totalSlots) * 100)}%</p>
                    <p className="text-slate-400 text-sm">Slot Fill Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;