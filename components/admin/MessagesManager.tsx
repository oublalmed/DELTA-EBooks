import React, { useState, useEffect } from 'react';
import { ClientMessage } from '../../types';
import * as adminApi from '../../services/adminApi';

const MessagesManager: React.FC = () => {
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState<ClientMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    loadMessages();
  }, [statusFilter, typeFilter]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getMessages({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
      });
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessage = async (message: ClientMessage) => {
    try {
      const fullMessage = await adminApi.getMessage(message.id);
      setSelectedMessage(fullMessage);
      setReplyText('');
    } catch (error) {
      console.error('Failed to load message:', error);
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;
    setReplying(true);
    try {
      await adminApi.replyToMessage(selectedMessage.id, replyText);
      setSelectedMessage(null);
      setReplyText('');
      loadMessages();
    } catch (error) {
      console.error('Failed to reply:', error);
    } finally {
      setReplying(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this message?')) return;
    try {
      await adminApi.deleteMessage(id);
      setSelectedMessage(null);
      loadMessages();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      general: 'bg-stone-100 text-stone-600',
      feedback: 'bg-blue-100 text-blue-600',
      support: 'bg-amber-100 text-amber-600',
      bug_report: 'bg-red-100 text-red-600',
      feature_request: 'bg-purple-100 text-purple-600',
    };
    return colors[type] || colors.general;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      unread: 'bg-red-100 text-red-600',
      read: 'bg-stone-100 text-stone-600',
      replied: 'bg-green-100 text-green-600',
      archived: 'bg-stone-200 text-stone-500',
    };
    return colors[status] || colors.unread;
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
          <option value="unread">Unread</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="general">General</option>
          <option value="feedback">Feedback</option>
          <option value="support">Support</option>
          <option value="bug_report">Bug Report</option>
          <option value="feature_request">Feature Request</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <p className="text-2xl font-bold text-stone-800">{messages.length}</p>
          <p className="text-sm text-stone-500">Total Messages</p>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-4">
          <p className="text-2xl font-bold text-red-600">{messages.filter(m => m.status === 'unread').length}</p>
          <p className="text-sm text-stone-500">Unread</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <p className="text-2xl font-bold text-stone-600">{messages.filter(m => m.status === 'read').length}</p>
          <p className="text-sm text-stone-500">Read</p>
        </div>
        <div className="bg-white rounded-xl border border-green-200 p-4">
          <p className="text-2xl font-bold text-green-600">{messages.filter(m => m.status === 'replied').length}</p>
          <p className="text-sm text-stone-500">Replied</p>
        </div>
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-stone-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <p className="text-stone-400">No messages found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100">
          {messages.map(message => (
            <div
              key={message.id}
              onClick={() => handleViewMessage(message)}
              className={`p-4 hover:bg-stone-50 cursor-pointer transition-colors ${
                message.status === 'unread' ? 'bg-red-50/50' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(message.type)}`}>
                    {message.type.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(message.status)}`}>
                    {message.status}
                  </span>
                </div>
                <span className="text-xs text-stone-400">{new Date(message.created_at).toLocaleString()}</span>
              </div>
              <h4 className="font-medium text-stone-800 mb-1">{message.subject}</h4>
              <p className="text-sm text-stone-500 line-clamp-2">{message.message}</p>
              <p className="text-xs text-stone-400 mt-2">From: {message.user_name || message.email}</p>
            </div>
          ))}
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-stone-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(selectedMessage.type)}`}>
                    {selectedMessage.type.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedMessage.status)}`}>
                    {selectedMessage.status}
                  </span>
                </div>
                <button onClick={() => setSelectedMessage(null)} className="p-2 hover:bg-stone-100 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <h3 className="text-lg font-semibold text-stone-800">{selectedMessage.subject}</h3>
              <p className="text-sm text-stone-400">
                From: {selectedMessage.user_name || 'Unknown'} ({selectedMessage.email})
              </p>
              <p className="text-xs text-stone-400">{new Date(selectedMessage.created_at).toLocaleString()}</p>
            </div>
            <div className="p-6 space-y-6">
              {/* Original Message */}
              <div>
                <p className="text-sm font-medium text-stone-600 mb-2">Message:</p>
                <div className="bg-stone-50 rounded-lg p-4">
                  <p className="text-stone-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              {/* Admin Reply (if exists) */}
              {selectedMessage.admin_reply && (
                <div>
                  <p className="text-sm font-medium text-green-600 mb-2">Your Reply:</p>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-stone-700 whitespace-pre-wrap">{selectedMessage.admin_reply}</p>
                    <p className="text-xs text-stone-400 mt-2">
                      Replied at: {selectedMessage.replied_at ? new Date(selectedMessage.replied_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              )}

              {/* Reply Form */}
              {selectedMessage.status !== 'replied' && (
                <div>
                  <p className="text-sm font-medium text-stone-600 mb-2">Reply:</p>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your reply..."
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {selectedMessage.status !== 'replied' && (
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim() || replying}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {replying ? 'Sending...' : 'Send Reply'}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selectedMessage.id)}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesManager;
