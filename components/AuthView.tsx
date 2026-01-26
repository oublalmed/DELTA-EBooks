
import React, { useState } from 'react';
import { BOOK_TITLE } from '../constants';

interface AuthViewProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string, name: string) => Promise<void>;
  onBack: () => void;
  error: string | null;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin, onRegister, onBack, error }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await onLogin(email, password);
      } else {
        if (password.length < 6) {
          setLocalError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        await onRegister(email, password, name);
      }
    } catch (err: any) {
      setLocalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-themed flex items-center justify-center px-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[60%] bg-rose-100/20 rounded-full blur-[120px] animate-pulse-soft" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[60%] h-[60%] bg-indigo-50/20 rounded-full blur-[120px] animate-pulse-soft" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative w-full max-w-md animate-scaleIn">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-themed-muted hover:text-themed mb-8 transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Library
        </button>

        {/* Card */}
        <div className="bg-themed-card rounded-3xl border border-themed p-8 sm:p-10 shadow-xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-stone-800 mb-4">
              <span className="text-white text-xl font-display">&#x2726;</span>
            </div>
            <h1 className="text-2xl font-display font-medium text-themed">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-themed-muted text-sm mt-2">
              {mode === 'login'
                ? 'Sign in to access your purchased books'
                : 'Join to purchase books and track your reading'
              }
            </p>
          </div>

          {/* Error */}
          {displayError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center">
              {displayError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-themed-sub text-xs font-bold uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3.5 bg-themed-muted border border-themed rounded-xl text-themed outline-none focus:ring-2 focus:ring-stone-300 transition-all text-sm"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-themed-sub text-xs font-bold uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3.5 bg-themed-muted border border-themed rounded-xl text-themed outline-none focus:ring-2 focus:ring-stone-300 transition-all text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-themed-sub text-xs font-bold uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'Min. 6 characters' : 'Your password'}
                className="w-full px-4 py-3.5 bg-themed-muted border border-themed rounded-xl text-themed outline-none focus:ring-2 focus:ring-stone-300 transition-all text-sm"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-stone-800 text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-stone-700 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="mt-6 text-center">
            <p className="text-themed-muted text-sm">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setLocalError(null); }}
                className="ml-1 font-bold text-themed hover:underline"
              >
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

          {/* Trust badges */}
          <div className="mt-8 pt-6 border-t border-themed">
            <div className="flex items-center justify-center gap-6 text-themed-muted">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure
              </div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                One-time payment
              </div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Lifetime access
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
