import React, { useState, useEffect } from 'react';
import { Ad } from '../../types';
import * as adminApi from '../../services/adminApi';

const AdsManager: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [filter, setFilter] = useState<string>('all');

  // Form state
  const [form, setForm] = useState({
    name: '',
    type: 'banner',
    placement: 'reading',
    image_url: '',
    link_url: '',
    cta_text: 'Learn More',
    status: 'active',
    priority: 0,
  });

  useEffect(() => {
    loadAds();
  }, [filter]);

  const loadAds = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAds(filter !== 'all' ? { status: filter } : undefined);
      setAds(data);
    } catch (error) {
      console.error('Failed to load ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAd) {
        await adminApi.updateAd(editingAd.id, form);
      } else {
        await adminApi.createAd(form);
      }
      setShowModal(false);
      setEditingAd(null);
      resetForm();
      loadAds();
    } catch (error) {
      console.error('Failed to save ad:', error);
    }
  };

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad);
    setForm({
      name: ad.name,
      type: ad.type,
      placement: ad.placement,
      image_url: ad.image_url || '',
      link_url: ad.link_url || '',
      cta_text: ad.cta_text,
      status: ad.status,
      priority: ad.priority,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;
    try {
      await adminApi.deleteAd(id);
      loadAds();
    } catch (error) {
      console.error('Failed to delete ad:', error);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await adminApi.toggleAdStatus(id);
      loadAds();
    } catch (error) {
      console.error('Failed to toggle ad:', error);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      type: 'banner',
      placement: 'reading',
      image_url: '',
      link_url: '',
      cta_text: 'Learn More',
      status: 'active',
      priority: 0,
    });
  };

  const ctr = (ad: Ad) => ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : '0.00';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
        <button
          onClick={() => { resetForm(); setEditingAd(null); setShowModal(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Ad
        </button>
      </div>

      {/* Ads Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-stone-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : ads.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <p className="text-stone-400 mb-4">No ads found</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Create your first ad
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Ad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Placement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Performance</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {ads.map(ad => (
                <tr key={ad.id} className="hover:bg-stone-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {ad.image_url ? (
                        <img src={ad.image_url} alt={ad.name} className="w-12 h-12 object-cover rounded-lg" />
                      ) : (
                        <div className="w-12 h-12 bg-stone-200 rounded-lg flex items-center justify-center">
                          <span className="text-stone-400 text-xs">No img</span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-stone-800">{ad.name}</p>
                        <p className="text-xs text-stone-400">Priority: {ad.priority}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-stone-100 text-stone-600 rounded text-xs capitalize">{ad.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-stone-600 capitalize">{ad.placement}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ad.status === 'active' ? 'bg-green-100 text-green-700' :
                      ad.status === 'paused' ? 'bg-amber-100 text-amber-700' :
                      'bg-stone-100 text-stone-600'
                    }`}>
                      {ad.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-stone-800">{ad.impressions.toLocaleString()} imp</p>
                      <p className="text-stone-400">{ad.clicks.toLocaleString()} clicks ({ctr(ad)}% CTR)</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggle(ad.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          ad.status === 'active' 
                            ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' 
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                        title={ad.status === 'active' ? 'Pause' : 'Activate'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                            d={ad.status === 'active' ? "M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" : "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"} 
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEdit(ad)}
                        className="p-2 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(ad.id)}
                        className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-stone-200">
              <h3 className="text-lg font-semibold text-stone-800">
                {editingAd ? 'Edit Ad' : 'Create New Ad'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="banner">Banner</option>
                    <option value="interstitial">Interstitial</option>
                    <option value="rewarded">Rewarded</option>
                    <option value="native">Native</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Placement</label>
                  <select
                    value={form.placement}
                    onChange={(e) => setForm({ ...form, placement: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="reading">Reading</option>
                    <option value="chapter_end">Chapter End</option>
                    <option value="library">Library</option>
                    <option value="home">Home</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Link URL</label>
                <input
                  type="url"
                  value={form.link_url}
                  onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">CTA Text</label>
                  <input
                    type="text"
                    value={form.cta_text}
                    onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Priority</label>
                  <input
                    type="number"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingAd(null); }}
                  className="flex-1 px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingAd ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdsManager;
