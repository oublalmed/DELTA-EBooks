
import React, { useState } from 'react';
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
    <div className="min-h-screen flex">
      {/* Left panel - motivational image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1200"
          alt="Wisdom"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/80" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-8">
            <span className="text-white text-2xl font-display font-bold">&#x2726;</span>
          </div>
          <h2 className="text-4xl font-display text-white font-medium mb-4 leading-tight">
            Begin Your Journey<br />of Transformation
          </h2>
          <div className="w-16 h-px bg-amber-400/50 mx-auto mb-6" />
          <p className="text-white/60 font-serif italic text-lg max-w-sm leading-relaxed mb-8">
            "The reading of all good books is like a conversation with the finest minds of past centuries."
          </p>
          <p className="text-amber-400/70 text-xs font-bold uppercase tracking-[0.3em]">— Rene Descartes</p>

          {/* Stats */}
          <div className="mt-12 flex items-center gap-8">
            {[
              { value: '4', label: 'Books' },
              { value: '80', label: 'Chapters' },
              { value: '2,847+', label: 'Readers' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-display font-bold text-white">{stat.value}</div>
                <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 bg-themed flex items-center justify-center px-4 relative">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[60%] bg-rose-100/20 rounded-full blur-[120px] animate-pulse-soft" />
          <div className="absolute bottom-[-20%] right-[-15%] w-[60%] h-[60%] bg-amber-50/20 rounded-full blur-[120px] animate-pulse-soft" style={{ animationDelay: '1.5s' }} />
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
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-stone-800 mb-4 shadow-lg">
                <span className="text-white text-xl font-display">&#x2726;</span>
              </div>
              <h1 className="text-2xl font-display font-medium text-themed">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-themed-muted text-sm mt-2">
                {mode === 'login'
                  ? 'Sign in to sync your reading progress across devices'
                  : 'Create an account to save progress and unlock books with ads'
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
                className="w-full py-4 cta-premium text-white rounded-xl font-bold text-sm uppercase tracking-wider disabled:opacity-50 transition-all hover:shadow-lg"
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
                  Ad supported
                </div>
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  No subscription
                </div>
              </div>
            </div>
          </div>

          {/* Motivational quote below card */}
          <div className="mt-8 text-center">
            <p className="text-themed-muted text-xs font-serif italic">"A room without books is like a body without a soul."</p>
            <p className="text-themed-muted text-[10px] font-bold uppercase tracking-wider mt-1">— Marcus Tullius Cicero</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
