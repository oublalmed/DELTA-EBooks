import React, { useState, useEffect } from 'react';
import { InternalEbook } from '../../types';
import * as adminApi from '../../services/adminApi';

const InternalEbooksManager: React.FC = () => {
  const [ebooks, setEbooks] = useState<InternalEbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEbook, setEditingEbook] = useState<InternalEbook | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    content: '',
    category: 'draft',
    status: 'draft',
    notes: '',
  });

  useEffect(() => {
    loadEbooks();
  }, [categoryFilter]);

  const loadEbooks = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getInternalEbooks(
        categoryFilter !== 'all' ? { category: categoryFilter } : undefined
      );
      setEbooks(data);
    } catch (error) {
      console.error('Failed to load internal ebooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEbook) {
        await adminApi.updateInternalEbook(editingEbook.id, form);
      } else {
        await adminApi.createInternalEbook(form);
      }
      setShowModal(false);
      setEditingEbook(null);
      resetForm();
      loadEbooks();
    } catch (error) {
      console.error('Failed to save internal ebook:', error);
    }
  };

  const handleEdit = (ebook: InternalEbook) => {
    setEditingEbook(ebook);
    setForm({
      title: ebook.title,
      subtitle: ebook.subtitle || '',
      description: ebook.description || '',
      content: ebook.content || '',
      category: ebook.category,
      status: ebook.status,
      notes: ebook.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this internal ebook?')) return;
    try {
      await adminApi.deleteInternalEbook(id);
      loadEbooks();
    } catch (error) {
      console.error('Failed to delete internal ebook:', error);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      subtitle: '',
      description: '',
      content: '',
      category: 'draft',
      status: 'draft',
      notes: '',
    });
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-stone-100 text-stone-600',
      ai_draft: 'bg-purple-100 text-purple-600',
      notes: 'bg-blue-100 text-blue-600',
      research: 'bg-amber-100 text-amber-600',
      future_release: 'bg-green-100 text-green-600',
    };
    return colors[category] || colors.draft;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="draft">Drafts</option>
            <option value="ai_draft">AI Drafts</option>
            <option value="notes">Notes</option>
            <option value="research">Research</option>
            <option value="future_release">Future Release</option>
          </select>
        </div>
        <button
          onClick={() => { resetForm(); setEditingEbook(null); setShowModal(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New Internal Ebook
        </button>
      </div>

      {/* Private Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <span className="text-amber-500 text-xl">🔒</span>
        <div>
          <p className="font-medium text-amber-800">Private Content</p>
          <p className="text-sm text-amber-600">Internal ebooks are only visible to admins. They are never exposed to clients or public APIs.</p>
        </div>
      </div>

      {/* Ebooks Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-stone-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : ebooks.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <p className="text-stone-400 mb-4">No internal ebooks found</p>
          <button onClick={() => setShowModal(true)} className="text-blue-600 hover:text-blue-700 font-medium">
            Create your first internal ebook
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ebooks.map(ebook => (
            <div key={ebook.id} className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadge(ebook.category)}`}>
                  {ebook.category.replace('_', ' ')}
                </span>
                {ebook.ai_generated === 1 && (
                  <span className="text-purple-500" title="AI Generated">🤖</span>
                )}
              </div>
              <h3 className="font-semibold text-stone-800 mb-1">{ebook.title}</h3>
              {ebook.subtitle && <p className="text-sm text-stone-500 mb-2">{ebook.subtitle}</p>}
              <p className="text-sm text-stone-400 line-clamp-2 mb-4">{ebook.description || 'No description'}</p>
              <div className="flex items-center justify-between text-xs text-stone-400 mb-4">
                <span>v{ebook.version}</span>
                <span>{new Date(ebook.updated_at).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(ebook)}
                  className="flex-1 px-3 py-2 bg-stone-100 text-stone-600 rounded-lg text-sm hover:bg-stone-200 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(ebook.id)}
                  className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-stone-200">
              <h3 className="text-lg font-semibold text-stone-800">
                {editingEbook ? 'Edit Internal Ebook' : 'Create Internal Ebook'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="ai_draft">AI Draft</option>
                    <option value="notes">Notes</option>
                    <option value="research">Research</option>
                    <option value="future_release">Future Release</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={8}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Admin Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Private notes only visible to admins..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingEbook(null); }}
                  className="flex-1 px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingEbook ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternalEbooksManager;
