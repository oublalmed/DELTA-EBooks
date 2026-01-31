import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { JournalAccessStatus, JOURNAL_FREE_DAYS } from '../types';

interface JournalAccessGateProps {
  children: React.ReactNode;
  onBack: () => void;
}

const JournalAccessGate: React.FC<JournalAccessGateProps> = ({ children, onBack }) => {
  const [accessStatus, setAccessStatus] = useState<JournalAccessStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);

  useEffect(() => {
    loadAccessStatus();
  }, []);

  const loadAccessStatus = async () => {
    try {
      const status = await api.getJournalAccessStatus();
      setAccessStatus(status);
    } catch (error) {
      console.error('Failed to load journal access:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWatchAd = async () => {
    setUnlocking(true);
    try {
      const result = await api.unlockJournalAccess();
      if (result.success) {
        // Reload access status
        const status = await api.getJournalAccessStatus();
        setAccessStatus(status);
        setShowAdModal(false);
      }
    } catch (error) {
      console.error('Failed to unlock journal:', error);
    } finally {
      setUnlocking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-themed flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <div className="w-12 h-12 border-3 border-stone-200 border-t-stone-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-themed-muted text-sm">Checking access...</p>
        </div>
      </div>
    );
  }

  // Has access - show the content
  if (accessStatus?.hasAccess) {
    return (
      <>
        {children}
        {/* Access status banner */}
        {accessStatus.freeTrialActive && (
          <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-emerald-500 text-white rounded-xl p-4 shadow-lg z-40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">🎁</span>
              </div>
              <div>
                <p className="font-bold text-sm">Free Trial Active</p>
                <p className="text-white/80 text-xs">{accessStatus.daysRemaining} days remaining</p>
              </div>
            </div>
          </div>
        )}
        {!accessStatus.freeTrialActive && accessStatus.accessUntil && (
          <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-amber-500 text-white rounded-xl p-4 shadow-lg z-40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">⏰</span>
              </div>
              <div>
                <p className="font-bold text-sm">Premium Access</p>
                <p className="text-white/80 text-xs">{accessStatus.daysRemaining} days remaining</p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // No access - show unlock screen
  return (
    <div className="min-h-screen bg-themed">
      {/* Header */}
      <div className="bg-themed-card border-b border-themed">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-themed-muted hover:text-themed transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
      </div>

      {/* Access required content */}
      <div className="max-w-lg mx-auto px-6 py-16">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h1 className="text-3xl font-display text-themed font-medium mb-4">
            Journal Access Required
          </h1>
          
          {accessStatus?.freeTrialExpired ? (
            <p className="text-themed-sub text-lg mb-8 max-w-md mx-auto">
              Your free {JOURNAL_FREE_DAYS}-day trial has ended. Watch a short video to continue using the Journal and Calendar features.
            </p>
          ) : (
            <p className="text-themed-sub text-lg mb-8 max-w-md mx-auto">
              Unlock the Journal and Calendar features to record your thoughts, feelings, and journey.
            </p>
          )}

          <button
            onClick={() => setShowAdModal(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-10 py-4 rounded-full font-bold text-sm uppercase tracking-wider hover:shadow-2xl transition-all hover:-translate-y-0.5 inline-flex items-center gap-3 mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Watch Ad — Get 7 Days Access
          </button>

          <div className="flex items-center justify-center gap-6 text-themed-muted text-xs">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ~30 second video
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
              </svg>
              100% Free
            </span>
          </div>
        </div>

        {/* Features preview */}
        <div className="mt-16 space-y-4">
          <h3 className="text-themed-muted text-xs font-bold uppercase tracking-wider text-center mb-6">What You'll Unlock</h3>
          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: '📝', title: 'Expressive Journal', desc: 'Write about your feelings, experiences, and insights' },
              { icon: '📅', title: 'Personal Calendar', desc: 'Track your journey day by day with mood ratings' },
              { icon: '📊', title: 'Mood Analytics', desc: 'See patterns in your emotional journey over time' },
              { icon: '🌍', title: 'Community Feed', desc: 'Share entries and connect with other readers' },
            ].map((feature, i) => (
              <div key={i} className="bg-themed-card border border-themed rounded-xl p-4 flex items-center gap-4">
                <div className="text-2xl">{feature.icon}</div>
                <div>
                  <h4 className="text-themed font-medium text-sm">{feature.title}</h4>
                  <p className="text-themed-muted text-xs">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ad Modal */}
      {showAdModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-themed-card rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-fadeIn">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-display text-themed font-medium mb-3">
              Unlock Journal Access
            </h3>
            <p className="text-themed-sub mb-6">
              Watch a short video (~30 seconds) to get 7 days of full access to Journal and Calendar features.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={handleWatchAd}
                disabled={unlocking}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {unlocking ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Unlocking...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                    Watch Ad to Unlock
                  </>
                )}
              </button>
              
              <button
                onClick={() => setShowAdModal(false)}
                className="w-full py-3 text-themed-muted text-sm font-medium hover:text-themed transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalAccessGate;
