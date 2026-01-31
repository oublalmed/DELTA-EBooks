import React, { useState, useEffect } from 'react';
import { BookIdea } from '../../types';
import * as adminApi from '../../services/adminApi';

const IdeasManager: React.FC = () => {
  const [ideas, setIdeas] = useState<BookIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIdea, setSelectedIdea] = useState<BookIdea | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    loadIdeas();
  }, [statusFilter]);

  const loadIdeas = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getIdeas(
        statusFilter !== 'all' ? { status: statusFilter } : undefined
      );
      setIdeas(data);
    } catch (error) {
      console.error('Failed to load ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await adminApi.updateIdea(id, { status });
      loadIdeas();
      if (selectedIdea?.id === id) {
        setSelectedIdea({ ...selectedIdea, status: status as any });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handlePriorityChange = async (id: number, priority: number) => {
    try {
      await adminApi.updateIdea(id, { priority });
      loadIdeas();
    } catch (error) {
      console.error('Failed to update priority:', error);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedIdea) return;
    try {
      await adminApi.updateIdea(selectedIdea.id, { admin_notes: adminNotes });
      setSelectedIdea({ ...selectedIdea, admin_notes: adminNotes });
      loadIdeas();
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this idea?')) return;
    try {
      await adminApi.deleteIdea(id);
      setSelectedIdea(null);
      loadIdeas();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-600',
      reviewing: 'bg-blue-100 text-blue-600',
      approved: 'bg-green-100 text-green-600',
      rejected: 'bg-red-100 text-red-600',
      implemented: 'bg-purple-100 text-purple-600',
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="reviewing">Reviewing</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="implemented">Implemented</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <p className="text-2xl font-bold text-stone-800">{ideas.length}</p>
          <p className="text-sm text-stone-500">Total Ideas</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 p-4">
          <p className="text-2xl font-bold text-amber-600">{ideas.filter(i => i.status === 'pending').length}</p>
          <p className="text-sm text-stone-500">Pending</p>
        </div>
        <div className="bg-white rounded-xl border border-blue-200 p-4">
          <p className="text-2xl font-bold text-blue-600">{ideas.filter(i => i.status === 'reviewing').length}</p>
          <p className="text-sm text-stone-500">Reviewing</p>
        </div>
        <div className="bg-white rounded-xl border border-green-200 p-4">
          <p className="text-2xl font-bold text-green-600">{ideas.filter(i => i.status === 'approved').length}</p>
          <p className="text-sm text-stone-500">Approved</p>
        </div>
        <div className="bg-white rounded-xl border border-purple-200 p-4">
          <p className="text-2xl font-bold text-purple-600">{ideas.filter(i => i.status === 'implemented').length}</p>
          <p className="text-sm text-stone-500">Implemented</p>
        </div>
      </div>

      {/* Ideas List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-stone-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : ideas.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <p className="text-stone-400">No ideas found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideas.map(idea => (
            <div
              key={idea.id}
              className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => { setSelectedIdea(idea); setAdminNotes(idea.admin_notes || ''); }}
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(idea.status)}`}>
                  {idea.status}
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={(e) => { e.stopPropagation(); handlePriorityChange(idea.id, star); }}
                      className={`text-sm ${idea.priority >= star ? 'text-amber-400' : 'text-stone-200'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <h4 className="font-semibold text-stone-800 mb-2">{idea.title}</h4>
              <p className="text-sm text-stone-500 line-clamp-3 mb-3">{idea.description}</p>
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>{idea.user_name || idea.email}</span>
                <span>{new Date(idea.created_at).toLocaleDateString()}</span>
              </div>
              {idea.category && (
                <div className="mt-2">
                  <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded">{idea.category}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Idea Detail Modal */}
      {selectedIdea && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-stone-200">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedIdea.status)}`}>
                  {selectedIdea.status}
                </span>
                <button onClick={() => setSelectedIdea(null)} className="p-2 hover:bg-stone-100 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <h3 className="text-lg font-semibold text-stone-800">{selectedIdea.title}</h3>
              <p className="text-sm text-stone-400">
                From: {selectedIdea.user_name || 'Unknown'} ({selectedIdea.email})
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-sm font-medium text-stone-600 mb-2">Description:</p>
                <div className="bg-stone-50 rounded-lg p-4">
                  <p className="text-stone-700">{selectedIdea.description}</p>
                </div>
              </div>

              {selectedIdea.category && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-stone-600 mb-1">Category</p>
                    <p className="text-stone-700">{selectedIdea.category}</p>
                  </div>
                  {selectedIdea.theme && (
                    <div>
                      <p className="text-sm font-medium text-stone-600 mb-1">Theme</p>
                      <p className="text-stone-700">{selectedIdea.theme}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedIdea.target_audience && (
                <div>
                  <p className="text-sm font-medium text-stone-600 mb-1">Target Audience</p>
                  <p className="text-stone-700">{selectedIdea.target_audience}</p>
                </div>
              )}

              {selectedIdea.additional_notes && (
                <div>
                  <p className="text-sm font-medium text-stone-600 mb-1">Additional Notes</p>
                  <p className="text-stone-700">{selectedIdea.additional_notes}</p>
                </div>
              )}

              {/* Status Change */}
              <div>
                <p className="text-sm font-medium text-stone-600 mb-2">Change Status:</p>
                <div className="flex flex-wrap gap-2">
                  {['pending', 'reviewing', 'approved', 'rejected', 'implemented'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(selectedIdea.id, status)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        selectedIdea.status === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <p className="text-sm font-medium text-stone-600 mb-2">Admin Notes:</p>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Add private notes about this idea..."
                />
                <button
                  onClick={handleSaveNotes}
                  className="mt-2 px-4 py-2 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 transition-colors"
                >
                  Save Notes
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-stone-200">
                <button
                  onClick={() => handleDelete(selectedIdea.id)}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Delete Idea
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdeasManager;
