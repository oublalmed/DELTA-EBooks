
import React, { useState } from 'react';
import * as api from '../services/api';

interface EmailCaptureProps {
  variant?: 'inline' | 'card' | 'banner';
  onSubscribe?: (email: string) => void;
}

const EmailCapture: React.FC<EmailCaptureProps> = ({ variant = 'card', onSubscribe }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;

    setLoading(true);

    try {
      await api.subscribe(email);
      setStatus('success');
      onSubscribe?.(email);
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className={`${variant === 'banner' ? 'py-4' : 'p-8'} text-center`}>
        <div className="flex items-center justify-center gap-3">
          <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
          </svg>
          <p className="text-emerald-600 font-medium text-sm">Welcome aboard! Check your inbox for a free chapter preview.</p>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-md">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email..."
          required
          className="flex-1 px-5 py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/50 text-sm outline-none focus:bg-white/20 transition-all"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-white text-stone-800 rounded-full font-bold text-sm hover:bg-stone-100 transition-all disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? '...' : 'Get Free Chapters'}
        </button>
      </form>
    );
  }

  if (variant === 'banner') {
    return (
      <div className="bg-stone-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-white font-display font-medium text-lg mb-1">Get 4 Free Chapters Instantly</h3>
            <p className="text-stone-400 text-sm">Join 2,000+ readers on their journey to wisdom.</p>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2 w-full sm:w-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 sm:w-56 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-sm outline-none focus:bg-white/15 transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 bg-rose-500 text-white rounded-xl font-bold text-sm hover:bg-rose-600 transition-all disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? '...' : 'Subscribe'}
            </button>
          </form>
        </div>
        {status === 'error' && <p className="text-red-400 text-xs mt-3 text-center">Something went wrong. Try again.</p>}
      </div>
    );
  }

  // Default card variant
  return (
    <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-3xl p-8 sm:p-10 text-center shadow-2xl">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-6">
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="text-white font-display text-2xl font-medium mb-2">Start Your Free Journey</h3>
      <p className="text-stone-400 text-sm mb-1">Get 4 free chapters from every book — no payment required.</p>
      <p className="text-stone-500 text-xs mb-8">Join 2,000+ seekers already on the path.</p>

      <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 px-5 py-3.5 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm outline-none focus:bg-white/15 focus:border-white/20 transition-all"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 bg-rose-500 text-white rounded-xl font-bold text-sm hover:bg-rose-600 transition-all disabled:opacity-50"
          >
            {loading ? '...' : 'Join Free'}
          </button>
        </div>
        {status === 'error' && <p className="text-red-400 text-xs mt-3">Something went wrong. Please try again.</p>}
        <p className="text-stone-500 text-[10px] mt-4">No spam. Unsubscribe anytime. We respect your inbox.</p>
      </form>
    </div>
  );
};

export default EmailCapture;
