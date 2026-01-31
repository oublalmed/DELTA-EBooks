import React, { useState, useEffect } from 'react';
import { AdminUser } from '../../types';
import * as adminApi from '../../services/adminApi';

const ClientsManager: React.FC = () => {
  const [clients, setClients] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState<AdminUser | null>(null);

  useEffect(() => {
    loadClients();
  }, [statusFilter]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getClients({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search || undefined,
      });
      setClients(data);
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadClients();
  };

  const handleStatusChange = async (userId: number, newStatus: string) => {
    if (!confirm(`Are you sure you want to ${newStatus} this user?`)) return;
    try {
      await adminApi.updateClientStatus(userId, newStatus);
      loadClients();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const formatTime = (seconds: number | null) => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email or name..."
              className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="restricted">Restricted</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <p className="text-2xl font-bold text-stone-800">{clients.length}</p>
          <p className="text-sm text-stone-500">Total Clients</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <p className="text-2xl font-bold text-green-600">{clients.filter(c => c.status === 'active').length}</p>
          <p className="text-sm text-stone-500">Active</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <p className="text-2xl font-bold text-red-600">{clients.filter(c => c.status === 'suspended').length}</p>
          <p className="text-sm text-stone-500">Suspended</p>
        </div>
      </div>

      {/* Clients Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-stone-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <p className="text-stone-400">No clients found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Activity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {clients.map(client => (
                <tr key={client.id} className="hover:bg-stone-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center">
                        <span className="text-stone-600 font-medium">{(client.name || client.email)[0].toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium text-stone-800">{client.name || 'No name'}</p>
                        <p className="text-sm text-stone-400">{client.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      client.status === 'active' ? 'bg-green-100 text-green-700' :
                      client.status === 'suspended' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {client.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-stone-800">{client.chapters_read || 0} chapters read</p>
                      <p className="text-stone-400">{formatTime(client.total_reading_time || 0)} reading time</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-stone-800">{new Date(client.created_at).toLocaleDateString()}</p>
                      {client.last_active_at && (
                        <p className="text-stone-400">Last: {new Date(client.last_active_at).toLocaleDateString()}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {client.status !== 'suspended' ? (
                        <button
                          onClick={() => handleStatusChange(client.id, 'suspended')}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(client.id, 'active')}
                          className="px-3 py-1 bg-green-100 text-green-600 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors"
                        >
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedClient(client)}
                        className="px-3 py-1 bg-stone-100 text-stone-600 rounded-lg text-xs font-medium hover:bg-stone-200 transition-colors"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Client Detail Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-stone-800">{selectedClient.name || 'User Details'}</h3>
                <p className="text-sm text-stone-400">{selectedClient.email}</p>
              </div>
              <button onClick={() => setSelectedClient(null)} className="p-2 hover:bg-stone-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-stone-50 rounded-lg p-4">
                  <p className="text-sm text-stone-500">Status</p>
                  <p className="font-medium text-stone-800 capitalize">{selectedClient.status || 'active'}</p>
                </div>
                <div className="bg-stone-50 rounded-lg p-4">
                  <p className="text-sm text-stone-500">Member Since</p>
                  <p className="font-medium text-stone-800">{new Date(selectedClient.created_at).toLocaleDateString()}</p>
                </div>
                <div className="bg-stone-50 rounded-lg p-4">
                  <p className="text-sm text-stone-500">Chapters Read</p>
                  <p className="font-medium text-stone-800">{selectedClient.chapters_read || 0}</p>
                </div>
                <div className="bg-stone-50 rounded-lg p-4">
                  <p className="text-sm text-stone-500">Total Reading Time</p>
                  <p className="font-medium text-stone-800">{formatTime(selectedClient.total_reading_time || 0)}</p>
                </div>
              </div>
              <div className="flex gap-3">
                {selectedClient.status !== 'suspended' ? (
                  <button
                    onClick={() => { handleStatusChange(selectedClient.id, 'suspended'); setSelectedClient(null); }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Suspend Account
                  </button>
                ) : (
                  <button
                    onClick={() => { handleStatusChange(selectedClient.id, 'active'); setSelectedClient(null); }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Activate Account
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsManager;
