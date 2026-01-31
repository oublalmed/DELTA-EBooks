import React, { useState, useEffect } from 'react';

interface Message {
  id: number;
  type: string;
  subject: string;
  message: string;
  status: string;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
}

interface Idea {
  id: number;
  title: string;
  description: string;
  category: string | null;
  status: string;
  created_at: string;
}

interface ContactViewProps {
  onBack: () => void;
}

const API_BASE = '/api/client';

const ContactView: React.FC<ContactViewProps> = ({ onBack }) => {
  const [tab, setTab] = useState<'messages' | 'ideas'>('messages');
  const [messages, setMessages] = useState<Message[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Message form
  const [messageForm, setMessageForm] = useState({
    type: 'general',
    subject: '',
    message: '',
  });

  // Idea form
  const [ideaForm, setIdeaForm] = useState({
    title: '',
    description: '',
    category: '',
    theme: '',
    target_audience: '',
    additional_notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, [tab]);

  const getToken = () => localStorage.getItem('delta_token');

  const loadData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/${tab}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (tab === 'messages') {
        setMessages(data);
      } else {
        setIdeas(data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(messageForm),
      });
      if (res.ok) {
        setSuccess('Message sent successfully!');
        setMessageForm({ type: 'general', subject: '', message: '' });
        setShowForm(false);
        loadData();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(ideaForm),
      });
      if (res.ok) {
        setSuccess('Book idea submitted! Thank you for your suggestion.');
        setIdeaForm({ title: '', description: '', category: '', theme: '', target_audience: '', additional_notes: '' });
        setShowForm(false);
        loadData();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Failed to submit idea:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      unread: 'bg-amber-100 text-amber-700',
      read: 'bg-stone-100 text-stone-600',
      replied: 'bg-green-100 text-green-700',
      pending: 'bg-amber-100 text-amber-700',
      reviewing: 'bg-blue-100 text-blue-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      implemented: 'bg-purple-100 text-purple-700',
    };
    return colors[status] || 'bg-stone-100 text-stone-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-stone-600 hover:text-stone-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="font-serif text-xl font-semibold text-stone-800">Contact & Ideas</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-center">
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <button
            onClick={() => { setTab('messages'); setShowForm(false); }}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              tab === 'messages'
                ? 'bg-stone-800 text-white shadow-lg'
                : 'bg-white text-stone-600 hover:bg-stone-100'
            }`}
          >
            Messages
          </button>
          <button
            onClick={() => { setTab('ideas'); setShowForm(false); }}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              tab === 'ideas'
                ? 'bg-stone-800 text-white shadow-lg'
                : 'bg-white text-stone-600 hover:bg-stone-100'
            }`}
          >
            Book Ideas
          </button>
        </div>

        {/* New Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowForm(true)}
            className="bg-amber-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-amber-600 transition-colors flex items-center gap-2 shadow-lg shadow-amber-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            {tab === 'messages' ? 'Send New Message' : 'Submit Book Idea'}
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-stone-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-stone-800">
                  {tab === 'messages' ? 'Send Message' : 'Submit Book Idea'}
                </h3>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-stone-100 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {tab === 'messages' ? (
                <form onSubmit={handleSubmitMessage} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Type</label>
                    <select
                      value={messageForm.type}
                      onChange={(e) => setMessageForm({ ...messageForm, type: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="feedback">Feedback</option>
                      <option value="support">Support Request</option>
                      <option value="bug_report">Bug Report</option>
                      <option value="feature_request">Feature Request</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Subject *</label>
                    <input
                      type="text"
                      value={messageForm.subject}
                      onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      placeholder="What is this about?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Message *</label>
                    <textarea
                      value={messageForm.message}
                      onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                      required
                      rows={5}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      placeholder="Tell us more..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-amber-500 text-white py-3 rounded-xl font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSubmitIdea} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Book Title *</label>
                    <input
                      type="text"
                      value={ideaForm.title}
                      onChange={(e) => setIdeaForm({ ...ideaForm, title: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      placeholder="Suggested title for the book"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Description *</label>
                    <textarea
                      value={ideaForm.description}
                      onChange={(e) => setIdeaForm({ ...ideaForm, description: e.target.value })}
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      placeholder="Describe your book idea, what topics it should cover, and why it would be valuable..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
                      <input
                        type="text"
                        value={ideaForm.category}
                        onChange={(e) => setIdeaForm({ ...ideaForm, category: e.target.value })}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                        placeholder="e.g., Self-help, Business"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Theme</label>
                      <input
                        type="text"
                        value={ideaForm.theme}
                        onChange={(e) => setIdeaForm({ ...ideaForm, theme: e.target.value })}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                        placeholder="e.g., Productivity, Mindset"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Target Audience</label>
                    <input
                      type="text"
                      value={ideaForm.target_audience}
                      onChange={(e) => setIdeaForm({ ...ideaForm, target_audience: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      placeholder="Who would benefit most from this book?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Additional Notes</label>
                    <textarea
                      value={ideaForm.additional_notes}
                      onChange={(e) => setIdeaForm({ ...ideaForm, additional_notes: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      placeholder="Any other thoughts or suggestions..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-amber-500 text-white py-3 rounded-xl font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Idea'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-stone-200 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : tab === 'messages' ? (
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <p className="text-stone-400 mb-4">You haven't sent any messages yet</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="text-amber-600 hover:text-amber-700 font-medium"
                >
                  Send your first message
                </button>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-stone-800">{msg.subject}</h4>
                      <p className="text-xs text-stone-400">{new Date(msg.created_at).toLocaleString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(msg.status)}`}>
                      {msg.status}
                    </span>
                  </div>
                  <p className="text-stone-600 text-sm mb-4">{msg.message}</p>
                  {msg.admin_reply && (
                    <div className="bg-green-50 rounded-xl p-4 border-l-4 border-green-400">
                      <p className="text-xs font-medium text-green-700 mb-1">Admin Reply:</p>
                      <p className="text-stone-700 text-sm">{msg.admin_reply}</p>
                      {msg.replied_at && (
                        <p className="text-xs text-stone-400 mt-2">{new Date(msg.replied_at).toLocaleString()}</p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {ideas.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <p className="text-stone-400 mb-4">You haven't submitted any book ideas yet</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="text-amber-600 hover:text-amber-700 font-medium"
                >
                  Submit your first idea
                </button>
              </div>
            ) : (
              ideas.map(idea => (
                <div key={idea.id} className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-stone-800">{idea.title}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(idea.status)}`}>
                      {idea.status}
                    </span>
                  </div>
                  <p className="text-stone-600 text-sm mb-3">{idea.description}</p>
                  {idea.category && (
                    <span className="text-xs bg-stone-100 text-stone-500 px-2 py-1 rounded">{idea.category}</span>
                  )}
                  <p className="text-xs text-stone-400 mt-3">Submitted: {new Date(idea.created_at).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ContactView;
