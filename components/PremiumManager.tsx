/**
 * Premium Manager Component
 * 
 * Handles ad-based premium access:
 * - Shows premium status
 * - Free trial activation
 * - Rewarded ad trigger
 * - Premium benefits display
 * 
 * NOTE: AdMob integration requires React Native.
 * For web, this shows a simulated flow or integrates with web ads.
 */

import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import { PremiumStatus, PREMIUM_DURATION_DAYS, TRIAL_DURATION_DAYS } from '../types';

interface PremiumManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (isPremium: boolean) => void;
}

// Premium benefits list
const PREMIUM_BENEFITS = [
  { icon: '📚', title: 'Full Library Access', description: 'Read all chapters of every book' },
  { icon: '✏️', title: 'Unlimited Journal', description: 'Create unlimited journal entries with images' },
  { icon: '📊', title: 'Advanced Analytics', description: 'Track your reading and mood patterns' },
  { icon: '💬', title: 'AI Chat', description: 'Discuss books with AI companion' },
  { icon: '📥', title: 'PDF Downloads', description: 'Download books as PDF files' },
  { icon: '🌟', title: 'No Ads', description: 'Enjoy ad-free reading experience' },
];

const PremiumManager: React.FC<PremiumManagerProps> = ({ isOpen, onClose, onStatusChange }) => {
  const [status, setStatus] = useState<PremiumStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAd, setShowAd] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  
  // Load premium status
  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);
  
  const loadStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPremiumStatus();
      setStatus(data);
      onStatusChange?.(data.isPremium);
    } catch (err: any) {
      setError(err.message || 'Failed to load premium status');
    } finally {
      setLoading(false);
    }
  };
  
  // Start free trial
  const handleStartTrial = async () => {
    setActionLoading(true);
    setError(null);
    try {
      await api.startTrial();
      await loadStatus();
    } catch (err: any) {
      setError(err.message || 'Failed to start trial');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Watch ad simulation (for web)
  // In React Native, this would trigger AdMob rewarded ad
  const handleWatchAd = useCallback(() => {
    if (!status?.canWatchAd) return;
    
    setShowAd(true);
    setAdProgress(0);
    
    // Simulate ad watching (5 seconds)
    const interval = setInterval(() => {
      setAdProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
    
    // After "ad" completes
    setTimeout(async () => {
      setShowAd(false);
      setAdProgress(0);
      setActionLoading(true);
      
      try {
        // Grant premium access
        await api.grantPremiumAccess({
          adNetwork: 'web_simulation',
          platform: 'web',
          deviceId: localStorage.getItem('delta_device_id') || crypto.randomUUID(),
        });
        await loadStatus();
      } catch (err: any) {
        setError(err.message || 'Failed to grant premium access');
      } finally {
        setActionLoading(false);
      }
    }, 5000);
  }, [status]);
  
  // Format date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  // Calculate days remaining
  const getDaysRemaining = (dateStr: string | null) => {
    if (!dateStr) return 0;
    const expires = new Date(dateStr);
    const now = new Date();
    const diff = expires.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-themed-card w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20" />
          <div className="relative px-6 py-8 text-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-5xl mb-3">👑</div>
            <h2 className="text-white text-2xl font-display font-medium mb-2">DELTA Premium</h2>
            <p className="text-white/80 text-sm">Unlock the full reading experience</p>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-10 h-10 border-3 border-stone-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-themed-muted text-sm">Loading...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">😕</div>
              <p className="text-red-500 text-sm mb-4">{error}</p>
              <button
                onClick={loadStatus}
                className="px-4 py-2 bg-themed-muted rounded-full text-themed text-sm font-bold hover:bg-stone-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : status?.isPremium ? (
            // Premium active
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold mb-4">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                </svg>
                Premium Active
              </div>
              
              <div className="bg-themed-muted rounded-2xl p-4 mb-4">
                <p className="text-themed-muted text-xs uppercase tracking-wider font-bold mb-1">
                  {status.accessType === 'trial' ? 'Trial' : 'Premium'} expires
                </p>
                <p className="text-themed font-display text-xl">{formatDate(status.premiumUntil)}</p>
                <p className="text-amber-600 text-sm font-bold mt-1">
                  {getDaysRemaining(status.premiumUntil)} days remaining
                </p>
              </div>
              
              {status.canWatchAd && (
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                  <p className="text-themed text-sm mb-3">
                    Want more time? Watch an ad to extend by {PREMIUM_DURATION_DAYS} days!
                  </p>
                  <button
                    onClick={handleWatchAd}
                    disabled={actionLoading}
                    className="px-6 py-2.5 bg-amber-500 text-white rounded-full text-sm font-bold hover:bg-amber-600 transition-colors shadow-lg"
                  >
                    {actionLoading ? 'Processing...' : `Watch Ad (+${PREMIUM_DURATION_DAYS} days)`}
                  </button>
                  <p className="text-themed-muted text-xs mt-2">
                    {status.adsWatchedToday} / {status.maxAdsPerDay} ads watched today
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Not premium
            <div>
              {/* Benefits */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {PREMIUM_BENEFITS.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-themed-muted rounded-xl">
                    <span className="text-xl shrink-0">{benefit.icon}</span>
                    <div>
                      <p className="text-themed text-xs font-bold">{benefit.title}</p>
                      <p className="text-themed-muted text-[10px]">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Trial CTA */}
              {status?.trialAvailable && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 mb-4 border border-amber-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🎁</span>
                    <div>
                      <p className="text-themed font-bold">Start Your Free Trial</p>
                      <p className="text-themed-muted text-xs">{TRIAL_DURATION_DAYS} days of premium, no ads required</p>
                    </div>
                  </div>
                  <button
                    onClick={handleStartTrial}
                    disabled={actionLoading}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-bold hover:opacity-90 transition-opacity shadow-lg"
                  >
                    {actionLoading ? 'Starting...' : `Start ${TRIAL_DURATION_DAYS}-Day Free Trial`}
                  </button>
                </div>
              )}
              
              {/* Watch Ad CTA */}
              <div className="bg-stone-800 rounded-2xl p-4 text-center">
                <p className="text-white font-bold mb-1">Watch a Short Ad</p>
                <p className="text-white/70 text-xs mb-3">Get {PREMIUM_DURATION_DAYS} days of premium access</p>
                
                {status?.canWatchAd ? (
                  <button
                    onClick={handleWatchAd}
                    disabled={actionLoading}
                    className="px-6 py-3 bg-amber-500 text-white rounded-full text-sm font-bold hover:bg-amber-600 transition-colors shadow-lg"
                  >
                    {actionLoading ? 'Loading...' : '▶ Watch Ad Now'}
                  </button>
                ) : (
                  <div>
                    <p className="text-amber-400 text-sm mb-2">Daily limit reached</p>
                    <p className="text-white/50 text-xs">Come back tomorrow for more ads</p>
                  </div>
                )}
                
                {status && (
                  <p className="text-white/50 text-xs mt-3">
                    {status.adsWatchedToday} / {status.maxAdsPerDay} ads watched today
                  </p>
                )}
              </div>
              
              {status?.trialUsed && (
                <p className="text-center text-themed-muted text-xs mt-4">
                  Trial already used • Watch ads to unlock premium
                </p>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 pb-6">
          <p className="text-center text-themed-muted text-[10px]">
            By using premium features, you agree to our Terms of Service.
            <br />
            Premium access via ads is compliant with Google Play policies.
          </p>
        </div>
      </div>
      
      {/* Ad Simulation Overlay */}
      {showAd && (
        <div className="fixed inset-0 bg-black z-60 flex flex-col items-center justify-center">
          <div className="text-center text-white mb-8">
            <div className="text-6xl mb-4">📺</div>
            <h3 className="text-2xl font-bold mb-2">Watching Ad...</h3>
            <p className="text-white/70 text-sm">Please wait while the ad plays</p>
          </div>
          
          <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-amber-500 transition-all duration-100"
              style={{ width: `${adProgress}%` }}
            />
          </div>
          
          <p className="text-white/50 text-sm">{Math.ceil((100 - adProgress) / 20)}s remaining</p>
          
          <p className="text-white/30 text-xs mt-8">
            In the real app, this would be a Google AdMob rewarded video
          </p>
        </div>
      )}
    </div>
  );
};

export default PremiumManager;
