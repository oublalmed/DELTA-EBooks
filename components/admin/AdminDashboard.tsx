import React, { useState, useEffect } from 'react';
import { AdminViewState, DashboardStats, AdminUser, ClientMessage, BookIdea } from '../../types';
import * as adminApi from '../../services/adminApi';

// Import admin sub-components
import AdsManager from './AdsManager';
import ClientsManager from './ClientsManager';
import EbooksManager from './EbooksManager';
import InternalEbooksManager from './InternalEbooksManager';
import AIGenerator from './AIGenerator';
import MessagesManager from './MessagesManager';
import IdeasManager from './IdeasManager';
import AnalyticsView from './AnalyticsView';

interface AdminDashboardProps {
  onLogout: () => void;
  onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onBack }) => {
  const [view, setView] = useState<AdminViewState>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);
  const [recentMessages, setRecentMessages] = useState<ClientMessage[]>([]);
  const [recentIdeas, setRecentIdeas] = useState<BookIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (view === 'dashboard') {
      loadDashboardData();
    }
  }, [view]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getDashboardData();
      setStats(data.stats);
      setRecentUsers(data.recentUsers);
      setRecentMessages(data.recentMessages);
      setRecentIdeas(data.recentIdeas);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'ads', label: 'Ads Management', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z', badge: stats?.activeAds },
    { id: 'clients', label: 'Clients', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', badge: stats?.totalUsers },
    { id: 'ebooks', label: 'Ebooks', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', badge: stats?.totalBooks },
    { id: 'internal-ebooks', label: 'Internal Ebooks', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', badge: stats?.internalEbooks, private: true },
    { id: 'ai-generate', label: 'AI Generation', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', private: true },
    { id: 'messages', label: 'Messages', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', badge: stats?.unreadMessages, highlight: stats?.unreadMessages && stats.unreadMessages > 0 },
    { id: 'ideas', label: 'Book Ideas', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', badge: stats?.pendingIdeas, highlight: stats?.pendingIdeas && stats.pendingIdeas > 0 },
    { id: 'analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ];

  const renderContent = () => {
    switch (view) {
      case 'ads':
        return <AdsManager />;
      case 'clients':
        return <ClientsManager />;
      case 'ebooks':
        return <EbooksManager />;
      case 'internal-ebooks':
        return <InternalEbooksManager />;
      case 'ai-generate':
        return <AIGenerator />;
      case 'messages':
        return <MessagesManager />;
      case 'ideas':
        return <IdeasManager />;
      case 'analytics':
        return <AnalyticsView />;
      default:
        return renderDashboardHome();
    }
  };

  const renderDashboardHome = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-600 rounded-full animate-spin" />
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={stats?.totalUsers || 0} icon="👥" color="blue" />
          <StatCard label="Active Users (7d)" value={stats?.activeUsers || 0} icon="📊" color="green" />
          <StatCard label="Total Books" value={stats?.totalBooks || 0} icon="📚" color="purple" />
          <StatCard label="Active Ads" value={stats?.activeAds || 0} icon="📢" color="amber" />
          <StatCard label="Ad Impressions" value={stats?.totalImpressions || 0} icon="👁️" color="cyan" />
          <StatCard label="Ad Clicks" value={stats?.totalClicks || 0} icon="👆" color="rose" />
          <StatCard label="Unread Messages" value={stats?.unreadMessages || 0} icon="✉️" color="red" highlight />
          <StatCard label="Pending Ideas" value={stats?.pendingIdeas || 0} icon="💡" color="yellow" highlight />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction label="Create Ad" onClick={() => setView('ads')} icon="➕" />
          <QuickAction label="New Internal Ebook" onClick={() => setView('internal-ebooks')} icon="📝" />
          <QuickAction label="Generate with AI" onClick={() => setView('ai-generate')} icon="🤖" />
          <QuickAction label="View Analytics" onClick={() => setView('analytics')} icon="📈" />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
              <span>👥</span> Recent Users
            </h3>
            <div className="space-y-3">
              {recentUsers.length === 0 ? (
                <p className="text-stone-400 text-sm">No users yet</p>
              ) : (
                recentUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-stone-800">{user.name || 'Unnamed'}</p>
                      <p className="text-xs text-stone-400">{user.email}</p>
                    </div>
                    <span className="text-xs text-stone-400">{new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                ))
              )}
            </div>
            <button onClick={() => setView('clients')} className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700">
              View all clients →
            </button>
          </div>

          {/* Recent Messages */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
              <span>✉️</span> Recent Messages
              {stats?.unreadMessages && stats.unreadMessages > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{stats.unreadMessages}</span>
              )}
            </h3>
            <div className="space-y-3">
              {recentMessages.length === 0 ? (
                <p className="text-stone-400 text-sm">No messages yet</p>
              ) : (
                recentMessages.map(msg => (
                  <div key={msg.id} className="py-2 border-b border-stone-100 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-stone-800 truncate">{msg.subject}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${msg.status === 'unread' ? 'bg-red-100 text-red-600' : 'bg-stone-100 text-stone-500'}`}>
                        {msg.status}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400">{msg.user_name || msg.email}</p>
                  </div>
                ))
              )}
            </div>
            <button onClick={() => setView('messages')} className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700">
              View all messages →
            </button>
          </div>

          {/* Recent Ideas */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
              <span>💡</span> Recent Ideas
              {stats?.pendingIdeas && stats.pendingIdeas > 0 && (
                <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">{stats.pendingIdeas}</span>
              )}
            </h3>
            <div className="space-y-3">
              {recentIdeas.length === 0 ? (
                <p className="text-stone-400 text-sm">No ideas yet</p>
              ) : (
                recentIdeas.map(idea => (
                  <div key={idea.id} className="py-2 border-b border-stone-100 last:border-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{idea.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-stone-400">{idea.user_name || idea.email}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        idea.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-stone-100 text-stone-500'
                      }`}>
                        {idea.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button onClick={() => setView('ideas')} className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700">
              View all ideas →
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-stone-100 flex">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-stone-900 text-white flex flex-col transition-all duration-300`}>
        {/* Logo */}
        <div className="p-4 border-b border-stone-800">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-lg font-bold">Delta Admin</h1>
                <p className="text-xs text-stone-400">Management Dashboard</p>
              </div>
            )}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-stone-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sidebarCollapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id as AdminViewState)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                view === item.id 
                  ? 'bg-blue-600 text-white' 
                  : 'text-stone-300 hover:bg-stone-800 hover:text-white'
              } ${item.highlight && view !== item.id ? 'bg-stone-800' : ''}`}
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
              </svg>
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 text-left text-sm">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      item.highlight ? 'bg-red-500' : 'bg-stone-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {item.private && (
                    <span className="text-xs text-amber-400">🔒</span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 space-y-2">
          <button 
            onClick={onBack}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-stone-400 hover:bg-stone-800 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {!sidebarCollapsed && <span className="text-sm">Back to App</span>}
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-900/30 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!sidebarCollapsed && <span className="text-sm">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-stone-200 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-stone-800 capitalize">{view.replace('-', ' ')}</h2>
              <p className="text-sm text-stone-400">
                {view === 'dashboard' && 'Overview of your ebook platform'}
                {view === 'ads' && 'Manage your advertising campaigns'}
                {view === 'clients' && 'View and manage registered readers'}
                {view === 'ebooks' && 'Manage public ebook catalog'}
                {view === 'internal-ebooks' && 'Private ebooks, drafts, and notes'}
                {view === 'ai-generate' && 'Generate content with AI'}
                {view === 'messages' && 'Client messages and support'}
                {view === 'ideas' && 'Book ideas from readers'}
                {view === 'analytics' && 'Platform performance metrics'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {stats?.unreadMessages && stats.unreadMessages > 0 && (
                <button 
                  onClick={() => setView('messages')}
                  className="relative p-2 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  <svg className="w-6 h-6 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {stats.unreadMessages}
                  </span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{ label: string; value: number; icon: string; color: string; highlight?: boolean }> = 
  ({ label, value, icon, color, highlight }) => (
  <div className={`bg-white rounded-xl border ${highlight && value > 0 ? 'border-red-200 bg-red-50' : 'border-stone-200'} p-5`}>
    <div className="flex items-center justify-between mb-2">
      <span className="text-2xl">{icon}</span>
      <span className={`text-xs font-medium px-2 py-1 rounded-full bg-${color}-100 text-${color}-600`}>{color}</span>
    </div>
    <p className="text-2xl font-bold text-stone-800">{value.toLocaleString()}</p>
    <p className="text-sm text-stone-500">{label}</p>
  </div>
);

// Quick Action Component
const QuickAction: React.FC<{ label: string; onClick: () => void; icon: string }> = ({ label, onClick, icon }) => (
  <button 
    onClick={onClick}
    className="bg-white rounded-xl border border-stone-200 p-4 hover:border-blue-300 hover:shadow-md transition-all text-left"
  >
    <span className="text-2xl mb-2 block">{icon}</span>
    <p className="text-sm font-medium text-stone-800">{label}</p>
  </button>
);

export default AdminDashboard;
