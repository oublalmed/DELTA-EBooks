
import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    google?: any;
  }
}

interface AuthViewProps {
  onLogin: (email: string, password: string) => Promise<any>;
  onRegister: (email: string, password: string, name: string) => Promise<any>;
  onVerifyEmail: (email: string, code: string) => Promise<void>;
  onResendVerification: (email: string) => Promise<{ devVerificationCode?: string }>;
  onForgotPassword: (email: string) => Promise<{ devResetToken?: string }>;
  onResetPassword: (email: string, token: string, password: string) => Promise<void>;
  onGoogleSignIn: (credential: string) => Promise<any>;
  onBack: () => void;
  error: string | null;
}

const AuthView: React.FC<AuthViewProps> = ({
  onLogin,
  onRegister,
  onVerifyEmail,
  onResendVerification,
  onForgotPassword,
  onResetPassword,
  onGoogleSignIn,
  onBack,
  error
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'verify' | 'forgot' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [devHint, setDevHint] = useState<string | null>(null);
  const [googleReady, setGoogleReady] = useState(false);

  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!googleClientId) return;

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id) return false;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response: any) => {
          try {
            setLocalError(null);
            setInfoMessage(null);
            await onGoogleSignIn(response.credential);
          } catch (err: any) {
            setLocalError(err.message || 'Google sign-in failed');
          }
        },
      });
      setGoogleReady(true);
      return true;
    };

    if (initializeGoogle()) return;
    const interval = window.setInterval(() => {
      if (initializeGoogle()) {
        window.clearInterval(interval);
      }
    }, 300);
    return () => window.clearInterval(interval);
  }, [onGoogleSignIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setInfoMessage(null);
    setDevHint(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await onLogin(email, password);
      } else if (mode === 'register') {
        if (password.length < 6) {
          setLocalError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        const result = await onRegister(email, password, name);
        if (result?.verificationRequired) {
          setMode('verify');
          setInfoMessage('We sent a verification code to your email.');
          if (result.devVerificationCode) {
            setDevHint(`Dev code: ${result.devVerificationCode}`);
          }
        }
      } else if (mode === 'verify') {
        await onVerifyEmail(email, verificationCode);
        setInfoMessage('Email verified. Please sign in.');
        setMode('login');
        setVerificationCode('');
      } else if (mode === 'forgot') {
        const result = await onForgotPassword(email);
        setInfoMessage('Password reset code sent. Enter it below.');
        if (result?.devResetToken) {
          setDevHint(`Dev reset token: ${result.devResetToken}`);
        }
        setMode('reset');
      } else if (mode === 'reset') {
        if (password.length < 6) {
          setLocalError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        await onResetPassword(email, resetToken, password);
        setInfoMessage('Password updated. Please sign in.');
        setPassword('');
        setResetToken('');
        setMode('login');
      }
    } catch (err: any) {
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        setMode('verify');
        setInfoMessage('Please verify your email to continue.');
      } else {
        setLocalError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const displayError = localError || error;
  const titles: Record<typeof mode, string> = {
    login: 'Welcome Back',
    register: 'Create Account',
    verify: 'Verify Your Email',
    forgot: 'Forgot Password',
    reset: 'Set a New Password',
  };
  const subtitles: Record<typeof mode, string> = {
    login: 'Sign in to sync your reading progress across devices',
    register: 'Create an account to save progress and unlock books with ads',
    verify: 'Enter the verification code sent to your email',
    forgot: 'We will send you a reset code',
    reset: 'Enter your reset code and new password',
  };
  const submitLabels: Record<typeof mode, string> = {
    login: 'Sign In',
    register: 'Create Account',
    verify: 'Verify Email',
    forgot: 'Send Reset Code',
    reset: 'Reset Password',
  };

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
                {titles[mode]}
              </h1>
              <p className="text-themed-muted text-sm mt-2">
                {subtitles[mode]}
              </p>
            </div>

            {/* Error */}
            {displayError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center">
                {displayError}
              </div>
            )}
            {infoMessage && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm text-center">
                {infoMessage}
              </div>
            )}
            {devHint && (
              <div className="mb-6 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-xs text-center">
                {devHint}
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

              {mode === 'verify' && (
                <div>
                  <label className="block text-themed-sub text-xs font-bold uppercase tracking-wider mb-2">Verification Code</label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter code"
                    className="w-full px-4 py-3.5 bg-themed-muted border border-themed rounded-xl text-themed outline-none focus:ring-2 focus:ring-stone-300 transition-all text-sm"
                    required
                  />
                </div>
              )}

              {mode === 'reset' && (
                <div>
                  <label className="block text-themed-sub text-xs font-bold uppercase tracking-wider mb-2">Reset Code</label>
                  <input
                    type="text"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Paste reset code"
                    className="w-full px-4 py-3.5 bg-themed-muted border border-themed rounded-xl text-themed outline-none focus:ring-2 focus:ring-stone-300 transition-all text-sm"
                    required
                  />
                </div>
              )}

              {(mode === 'login' || mode === 'register' || mode === 'reset') && (
                <div>
                  <label className="block text-themed-sub text-xs font-bold uppercase tracking-wider mb-2">{mode === 'reset' ? 'New Password' : 'Password'}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'register' ? 'Min. 6 characters' : mode === 'reset' ? 'Create a new password' : 'Your password'}
                    className="w-full px-4 py-3.5 bg-themed-muted border border-themed rounded-xl text-themed outline-none focus:ring-2 focus:ring-stone-300 transition-all text-sm"
                    required
                    minLength={6}
                  />
                </div>
              )}

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
                  submitLabels[mode]
                )}
              </button>
            </form>

            {mode === 'login' && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => { setMode('forgot'); setLocalError(null); setInfoMessage(null); }}
                  className="text-xs font-bold uppercase tracking-wider text-themed-muted hover:text-themed"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {mode === 'verify' && (
              <div className="mt-4 text-center">
                <button
                  onClick={async () => {
                    setLoading(true);
                    setLocalError(null);
                    setInfoMessage(null);
                    try {
                      const result = await onResendVerification(email);
                      setInfoMessage('Verification code resent.');
                      if (result?.devVerificationCode) {
                        setDevHint(`Dev code: ${result.devVerificationCode}`);
                      }
                    } catch (err: any) {
                      setLocalError(err.message || 'Failed to resend code');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="text-xs font-bold uppercase tracking-wider text-themed-muted hover:text-themed"
                >
                  Resend verification code
                </button>
              </div>
            )}

            {(mode === 'login' || mode === 'register') && (
              <div className="mt-6">
                <button
                  onClick={() => window.google?.accounts?.id?.prompt()}
                  disabled={!googleReady}
                  className="w-full py-3 rounded-xl border border-themed bg-themed-muted text-themed text-xs font-bold uppercase tracking-wider hover:bg-themed transition-all disabled:opacity-50"
                >
                  Continue with Google
                </button>
                {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                  <p className="text-themed-muted text-[10px] text-center mt-2">Google Sign-In not configured</p>
                )}
              </div>
            )}

            {/* Toggle mode */}
            <div className="mt-6 text-center">
              {mode === 'login' && (
                <p className="text-themed-muted text-sm">
                  Don't have an account?
                  <button
                    onClick={() => { setMode('register'); setLocalError(null); setInfoMessage(null); }}
                    className="ml-1 font-bold text-themed hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              )}
              {mode === 'register' && (
                <p className="text-themed-muted text-sm">
                  Already have an account?
                  <button
                    onClick={() => { setMode('login'); setLocalError(null); setInfoMessage(null); }}
                    className="ml-1 font-bold text-themed hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              )}
              {(mode === 'verify' || mode === 'forgot' || mode === 'reset') && (
                <button
                  onClick={() => { setMode('login'); setLocalError(null); setInfoMessage(null); }}
                  className="text-sm font-bold text-themed hover:underline"
                >
                  Back to Sign In
                </button>
              )}
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
