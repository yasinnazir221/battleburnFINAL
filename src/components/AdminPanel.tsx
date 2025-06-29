import React, { useState, useEffect } from 'react';
import { Plus, Edit, Users, Coins, Trophy, Settings, Play, Award, Clock, Trash2, Eye, EyeOff, Save, X, Check, AlertTriangle, DollarSign, Calendar, MapPin, Crown, Target, Zap, Activity, Database } from 'lucide-react';
import { Tournament, Player } from '../types';
import { getUserActivityLogs, getTokenTransactions } from '../firebase/firestore';

interface AdminPanelProps {
  tournaments: Tournament[];
  players: Player[];
  onCreateTournament: (tournament: Omit<Tournament, 'id'>) => void;
  onUpdateTournament: (id: string, updates: Partial<Tournament>) => void;
  onAddTokens: (playerId: string, amount: number, reason: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  tournaments,
  players,
  onCreateTournament,
  onUpdateTournament,
  onAddTokens
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tournaments' | 'players' | 'matches' | 'tokens' | 'analytics' | 'settings'>('dashboard');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [bulkTokenAmount, setBulkTokenAmount] = useState(0);
  const [bulkTokenReason, setBulkTokenReason] = useState('');
  const [userActivity, setUserActivity] = useState<any[]>([]);
  const [tokenTransactions, setTokenTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
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

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      if (activeTab === 'analytics') {
        setLoading(true);
        try {
          const [activity, transactions] = await Promise.all([
            getUserActivityLogs(100),
            getTokenTransactions(100)
          ]);
          setUserActivity(activity);
          setTokenTransactions(transactions);
        } catch (error) {
          console.error('Error loading analytics:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadAnalytics();
  }, [activeTab]);

  const handleCreateTournament = () => {
    if (newTournament.title && newTournament.dateTime) {
      onCreateTournament({
        ...newTournament,
        status: 'upcoming',
        participants: [],
        matches: [],
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

  const stats = {
    totalTournaments: tournaments.length,
    activeTournaments: tournaments.filter(t => t.status === 'active').length,
    totalPlayers: players.length,
    totalTokensDistributed: tokenTransactions.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0)
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
            <p className="text-slate-400 mt-2">Manage tournaments, players, and system settings</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-slate-800/50 p-2 rounded-xl backdrop-blur-sm">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Activity },
            { id: 'tournaments', label: 'Tournaments', icon: Trophy },
            { id: 'players', label: 'Players', icon: Users },
            { id: 'tokens', label: 'Tokens', icon: Coins },
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
                    <p className="text-slate-400 text-sm">Total Players</p>
                    <p className="text-2xl font-bold text-white">{stats.totalPlayers}</p>
                  </div>
                  <Users className="text-blue-400" size={24} />
                </div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Tokens Distributed</p>
                    <p className="text-2xl font-bold text-white">{stats.totalTokensDistributed}</p>
                  </div>
                  <Coins className="text-yellow-400" size={24} />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="text-purple-400" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {tournaments.slice(0, 5).map(tournament => (
                  <div key={tournament.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Trophy className="text-purple-400" size={16} />
                      <div>
                        <p className="text-white font-medium">{tournament.title}</p>
                        <p className="text-slate-400 text-sm">Status: {tournament.status}</p>
                      </div>
                    </div>
                    <span className="text-slate-400 text-sm">
                      {tournament.participants.length}/{tournament.maxPlayers} players
                    </span>
                  </div>
                ))}
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
                    type="datetime-local"
                    value={newTournament.dateTime}
                    onChange={(e) => setNewTournament({...newTournament, dateTime: e.target.value})}
                    className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white"
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
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{tournament.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tournament.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          tournament.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {tournament.status}
                        </span>
                      </div>
                      <p className="text-slate-400 mb-3">{tournament.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="text-slate-300 flex items-center gap-1">
                          <Users size={14} />
                          {tournament.participants.length}/{tournament.maxPlayers}
                        </span>
                        <span className="text-slate-300 flex items-center gap-1">
                          <Coins size={14} />
                          {tournament.entryFee} tokens
                        </span>
                        <span className="text-slate-300 flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(tournament.dateTime).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingTournament(tournament)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onUpdateTournament(tournament.id, { 
                          status: tournament.status === 'active' ? 'completed' : 'active' 
                        })}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                      >
                        {tournament.status === 'active' ? <Eye size={16} /> : <Play size={16} />}
                      </button>
                    </div>
                  </div>
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

        {/* Tokens Tab */}
        {activeTab === 'tokens' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Token Management</h2>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <DollarSign className="text-yellow-400" />
                Recent Token Transactions
              </h3>
              <div className="space-y-3">
                {tokenTransactions.slice(0, 10).map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.amount > 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        {transaction.amount > 0 ? 
                          <Plus className="text-green-400" size={14} /> : 
                          <Trash2 className="text-red-400" size={14} />
                        }
                      </div>
                      <div>
                        <p className="text-white font-medium">{transaction.reason}</p>
                        <p className="text-slate-400 text-sm">
                          {new Date(transaction.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className={`font-bold ${
                      transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Analytics & Reports</h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
              </div>
            ) : (
              <div className="grid gap-6">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Activity className="text-purple-400" />
                    User Activity Logs
                  </h3>
                  <div className="space-y-3">
                    {userActivity.slice(0, 10).map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                            <Activity className="text-purple-400" size={14} />
                          </div>
                          <div>
                            <p className="text-white font-medium">{activity.action}</p>
                            <p className="text-slate-400 text-sm">{activity.userId}</p>
                          </div>
                        </div>
                        <span className="text-slate-400 text-sm">
                          {new Date(activity.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;