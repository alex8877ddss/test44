import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Save, Eye, EyeOff, LogOut, BarChart3, Users, Coins, TrendingUp, Shield } from 'lucide-react';
import { WhitelistToken } from '../types';
import { airdropService } from '../services/airdrop';
import { ethplorerService } from '../services/ethplorer';
import { databaseService } from '../services/database';
import { adminService, AdminUser } from '../services/admin';
import { useAuth } from '../hooks/useAuth';

const AdminPanel: React.FC = () => {
  const { signOut, adminUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'whitelist' | 'settings' | 'analytics' | 'users'>('whitelist');
  const [whitelist, setWhitelist] = useState<WhitelistToken[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [apiKey, setApiKey] = useState('freekey');
  const [showApiKey, setShowApiKey] = useState(false);
  const [statistics, setStatistics] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [newToken, setNewToken] = useState<Partial<WhitelistToken>>({
    address: '',
    name: '',
    symbol: '',
    airdrop_amount: 0,
    is_active: true,
  });

  const backgroundPattern = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [whitelistData, savedApiKey, stats, users] = await Promise.all([
        airdropService.getWhitelist(),
        databaseService.getSetting('ethplorer_api_key'),
        databaseService.getStatistics(),
        adminService.getAllAdminUsers(),
      ]);

      setWhitelist(whitelistData);
      if (savedApiKey) setApiKey(savedApiKey);
      setStatistics(stats);
      setAdminUsers(users);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToken = async () => {
    if (newToken.address && newToken.name && newToken.symbol && newToken.airdrop_amount) {
      const success = await airdropService.addToWhitelist({
        address: newToken.address,
        name: newToken.name,
        symbol: newToken.symbol,
        airdrop_amount: newToken.airdrop_amount,
        is_active: newToken.is_active || true,
      });

      if (success) {
        await loadData();
        setNewToken({
          address: '',
          name: '',
          symbol: '',
          airdrop_amount: 0,
          is_active: true,
        });
      }
    }
  };

  const handleRemoveToken = async (id: string) => {
    const success = await airdropService.removeFromWhitelist(id);
    if (success) {
      await loadData();
    }
  };

  const handleToggleToken = async (id: string, currentStatus: boolean) => {
    const success = await airdropService.updateWhitelistToken(id, {
      is_active: !currentStatus,
    });
    if (success) {
      await loadData();
    }
  };

  const handleToggleAdminUser = async (id: string, currentStatus: boolean) => {
    const success = currentStatus 
      ? await adminService.deactivateAdminUser(id)
      : await adminService.activateAdminUser(id);
    
    if (success) {
      await loadData();
    }
  };

  const handleSaveApiKey = async () => {
    await ethplorerService.setApiKey(apiKey);
    alert('API key updated successfully!');
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div 
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: `url("${backgroundPattern}")` }}
      ></div>
      
      <div className="relative max-w-7xl mx-auto p-6">
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl">
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                  <p className="text-gray-400">
                    Welcome, {adminUser?.email} • Role: {adminUser?.role}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-700/50 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('whitelist')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'whitelist'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Whitelist Management
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                API Settings
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'users'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Admin Users
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Analytics
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'whitelist' && (
              <div className="space-y-6">
                {/* Add New Token Form */}
                <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
                  <h3 className="font-semibold text-white mb-4">Add New Token</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Token Address"
                      value={newToken.address || ''}
                      onChange={(e) => setNewToken({ ...newToken, address: e.target.value })}
                      className="px-3 py-2 bg-gray-600/50 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    <input
                      type="text"
                      placeholder="Token Name"
                      value={newToken.name || ''}
                      onChange={(e) => setNewToken({ ...newToken, name: e.target.value })}
                      className="px-3 py-2 bg-gray-600/50 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    <input
                      type="text"
                      placeholder="Symbol"
                      value={newToken.symbol || ''}
                      onChange={(e) => setNewToken({ ...newToken, symbol: e.target.value.toUpperCase() })}
                      className="px-3 py-2 bg-gray-600/50 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    <input
                      type="number"
                      placeholder="Airdrop Amount"
                      value={newToken.airdrop_amount || ''}
                      onChange={(e) => setNewToken({ ...newToken, airdrop_amount: parseInt(e.target.value) || 0 })}
                      className="px-3 py-2 bg-gray-600/50 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <button
                    onClick={handleAddToken}
                    disabled={!newToken.address || !newToken.name || !newToken.symbol || !newToken.airdrop_amount}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/25"
                  >
                    <Plus className="w-4 h-4" />
                    Add Token
                  </button>
                </div>

                {/* Whitelist Table */}
                <div>
                  <h3 className="font-semibold text-white mb-4">Current Whitelist ({whitelist.length} tokens)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 font-semibold text-gray-300">Token</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-300">Address</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-300">Airdrop Amount</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-300">Status</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {whitelist.map((token) => (
                          <tr key={token.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                                  <span className="text-white font-bold text-xs">
                                    {token.symbol.slice(0, 2)}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-white">{token.name}</p>
                                  <p className="text-sm text-gray-400">{token.symbol}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <code className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                                {token.address.slice(0, 8)}...{token.address.slice(-6)}
                              </code>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-semibold text-emerald-400">
                                {token.airdrop_amount.toLocaleString()}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleToggleToken(token.id!, token.is_active)}
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  token.is_active
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-gray-500/20 text-gray-400'
                                }`}
                              >
                                {token.is_active ? 'Active' : 'Inactive'}
                              </button>
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleRemoveToken(token.id!)}
                                className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-white mb-4">Ethplorer API Configuration</h3>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-400">
                      <strong>Note:</strong> The free API key has rate limits. Consider upgrading to a paid plan for production use.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter Ethplorer API Key"
                        className="w-full px-3 py-2 pr-10 bg-gray-600/50 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      onClick={handleSaveApiKey}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/25"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <h3 className="font-semibold text-white mb-4">Administrator Users ({adminUsers.length} users)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 font-semibold text-gray-300">User</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-300">Role</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-300">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-300">Created</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminUsers.map((user) => (
                        <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                                <Shield className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-white">{user.email}</p>
                                <p className="text-sm text-gray-400">ID: {user.id.slice(0, 8)}...</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin' 
                                ? 'bg-purple-500/20 text-purple-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleToggleAdminUser(user.id, user.is_active)}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                user.is_active
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {user.is_active ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-400">
                              {new Date(user.created_at).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleToggleAdminUser(user.id, user.is_active)}
                              className={`text-sm px-3 py-1 rounded transition-colors ${
                                user.is_active
                                  ? 'text-red-400 hover:text-red-300'
                                  : 'text-emerald-400 hover:text-emerald-300'
                              }`}
                            >
                              {user.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h3 className="font-semibold text-white mb-4">Platform Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-5 h-5 text-blue-400" />
                      <p className="text-sm text-blue-400 font-medium">Total Claims</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{statistics.totalClaims || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <BarChart3 className="w-5 h-5 text-emerald-400" />
                      <p className="text-sm text-emerald-400 font-medium">Completed Claims</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{statistics.completedClaims || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Coins className="w-5 h-5 text-purple-400" />
                      <p className="text-sm text-purple-400 font-medium">Active Tokens</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{statistics.activeTokens || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-5 h-5 text-orange-400" />
                      <p className="text-sm text-orange-400 font-medium">Total Distributed</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{(statistics.totalDistributed || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;