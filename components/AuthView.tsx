
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { translations, Language } from '../i18n';

declare global {
  interface Window {
    google?: any;
  }
}

interface AuthViewProps {
  onLogin: (email: string, password: string) => Promise<any>;
  onRegister: (email: string, password: string, name: string) => Promise<any>;
  onForgotPassword: (email: string) => Promise<{ devResetToken?: string }>;
  onResetPassword: (email: string, token: string, password: string) => Promise<void>;
  onGoogleSignIn: (credential: string) => Promise<any>;
  onBack: () => void;
  error: string | null;
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
}

const AuthView: React.FC<AuthViewProps> = ({
  onLogin,
  onRegister,
  onForgotPassword,
  onResetPassword,
  onGoogleSignIn,
  onBack,
  error,
  language: propLanguage,
  onLanguageChange,
}) => {
  const lang = propLanguage || (localStorage.getItem('delta_language') as Language) || 'en';
  const t = translations[lang];

  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [devHint, setDevHint] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Google Sign-In button ref
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const googleInitialized = useRef(false);

  // Initialize Google Sign-In with renderButton (more reliable than prompt)
  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!googleClientId) return;

    const renderGoogleButton = () => {
      if (!window.google?.accounts?.id || !googleBtnRef.current) return false;

      if (!googleInitialized.current) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            if (response.credential) {
              try {
                setLocalError(null);
                setInfoMessage(null);
                await onGoogleSignIn(response.credential);
              } catch (err: any) {
                setLocalError(err.message || t.errors.generic);
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        googleInitialized.current = true;
      }

      // Render the official Google button
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        width: googleBtnRef.current.offsetWidth,
        text: mode === 'register' ? 'signup_with' : 'signin_with',
        shape: 'pill',
        locale: lang === 'fr' ? 'fr' : 'en',
      });

      return true;
    };

    if (renderGoogleButton()) return;

    // Retry until Google SDK loads
    const interval = window.setInterval(() => {
      if (renderGoogleButton()) {
        window.clearInterval(interval);
      }
    }, 300);

    return () => window.clearInterval(interval);
  }, [onGoogleSignIn, mode, lang]);

  const switchLang = useCallback((newLang: Language) => {
    localStorage.setItem('delta_language', newLang);
    if (onLanguageChange) onLanguageChange(newLang);
  }, [onLanguageChange]);

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
          setLocalError(t.auth.password_min_length);
          setLoading(false);
          return;
        }
        await onRegister(email, password, name);
      } else if (mode === 'forgot') {
        const result = await onForgotPassword(email);
        setInfoMessage(t.auth.reset_link_sent);
        if (result?.devResetToken) {
          setDevHint(`Dev reset token: ${result.devResetToken}`);
        }
        setMode('reset');
      } else if (mode === 'reset') {
        if (password.length < 6) {
          setLocalError(t.auth.password_min_length);
          setLoading(false);
          return;
        }
        await onResetPassword(email, resetToken, password);
        setInfoMessage(t.auth.password_updated);
        setPassword('');
        setResetToken('');
        setMode('login');
      }
    } catch (err: any) {
      setLocalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const displayError = localError || error;

  const titles: Record<typeof mode, string> = {
    login: t.auth.welcome_back,
    register: t.auth.create_account,
    forgot: t.auth.forgot_password,
    reset: t.auth.reset_password,
  };
  const subtitles: Record<typeof mode, string> = {
    login: lang === 'fr'
      ? 'Connectez-vous pour synchroniser votre progression'
      : 'Sign in to sync your reading progress across devices',
    register: lang === 'fr'
      ? 'Creez un compte pour sauvegarder et debloquer des livres'
      : 'Create an account to save progress and unlock books with ads',
    forgot: lang === 'fr'
      ? 'Nous vous enverrons un code de reinitialisation'
      : 'We will send you a reset code',
    reset: t.auth.enter_reset_code,
  };
  const submitLabels: Record<typeof mode, string> = {
    login: t.auth.sign_in,
    register: t.auth.create_account,
    forgot: lang === 'fr' ? 'Envoyer le code' : 'Send Reset Code',
    reset: t.auth.reset_password,
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
            {lang === 'fr'
              ? <>Commencez votre<br />voyage de transformation</>
              : <>Begin Your Journey<br />of Transformation</>}
          </h2>
          <div className="w-16 h-px bg-amber-400/50 mx-auto mb-6" />
          <p className="text-white/60 font-serif italic text-lg max-w-sm leading-relaxed mb-8">
            {lang === 'fr'
              ? '"La lecture de tous les bons livres est comme une conversation avec les plus grands esprits des siecles passes."'
              : '"The reading of all good books is like a conversation with the finest minds of past centuries."'}
          </p>
          <p className="text-amber-400/70 text-xs font-bold uppercase tracking-[0.3em]">
            {lang === 'fr' ? '— Rene Descartes' : '— Rene Descartes'}
          </p>

          {/* Stats */}
          <div className="mt-12 flex items-center gap-8">
            {[
              { value: '4', label: lang === 'fr' ? 'Livres' : 'Books' },
              { value: '80', label: lang === 'fr' ? 'Chapitres' : 'Chapters' },
              { value: '2,847+', label: lang === 'fr' ? 'Lecteurs' : 'Readers' },
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
          {/* Top bar: Back + Language switcher */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-themed-muted hover:text-themed transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t.common.back}
            </button>

            {/* Language switcher */}
            <div className="flex items-center gap-1 bg-themed-muted rounded-full p-1">
              <button
                onClick={() => switchLang('en')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  lang === 'en' ? 'bg-stone-800 text-white shadow' : 'text-themed-muted hover:text-themed'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => switchLang('fr')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  lang === 'fr' ? 'bg-stone-800 text-white shadow' : 'text-themed-muted hover:text-themed'
                }`}
              >
                FR
              </button>
            </div>
          </div>

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
              <div className="mb-6 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-xs text-center font-mono">
                {devHint}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-themed-sub text-xs font-bold uppercase tracking-wider mb-2">
                    {t.common.name}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.auth.enter_name}
                    className="w-full px-4 py-3.5 bg-themed-muted border border-themed rounded-xl text-themed outline-none focus:ring-2 focus:ring-stone-300 transition-all text-sm"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-themed-sub text-xs font-bold uppercase tracking-wider mb-2">
                  {t.common.email}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.auth.enter_email}
                  className="w-full px-4 py-3.5 bg-themed-muted border border-themed rounded-xl text-themed outline-none focus:ring-2 focus:ring-stone-300 transition-all text-sm"
                  required
                  autoComplete="email"
                />
              </div>

              {mode === 'reset' && (
                <div>
                  <label className="block text-themed-sub text-xs font-bold uppercase tracking-wider mb-2">
                    {lang === 'fr' ? 'Code de reinitialisation' : 'Reset Code'}
                  </label>
                  <input
                    type="text"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder={lang === 'fr' ? 'Collez le code recu' : 'Paste reset code'}
                    className="w-full px-4 py-3.5 bg-themed-muted border border-themed rounded-xl text-themed outline-none focus:ring-2 focus:ring-stone-300 transition-all text-sm font-mono"
                    required
                    autoComplete="one-time-code"
                  />
                </div>
              )}

              {(mode === 'login' || mode === 'register' || mode === 'reset') && (
                <div>
                  <label className="block text-themed-sub text-xs font-bold uppercase tracking-wider mb-2">
                    {mode === 'reset' ? t.auth.new_password : t.common.password}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={
                        mode === 'register'
                          ? t.auth.password_min_length
                          : mode === 'reset'
                            ? (lang === 'fr' ? 'Nouveau mot de passe' : 'Create a new password')
                            : t.auth.enter_password
                      }
                      className="w-full px-4 py-3.5 pr-12 bg-themed-muted border border-themed rounded-xl text-themed outline-none focus:ring-2 focus:ring-stone-300 transition-all text-sm"
                      required
                      minLength={6}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-themed-muted hover:text-themed p-1"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
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
                    {t.common.loading}
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
                  {t.auth.forgot_password}?
                </button>
              </div>
            )}

            {/* Google Sign-In */}
            {(mode === 'login' || mode === 'register') && (
              <div className="mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-themed border-themed" />
                  <span className="text-themed-muted text-xs font-bold uppercase tracking-wider">
                    {t.common.or}
                  </span>
                  <div className="flex-1 h-px bg-themed border-themed" />
                </div>

                {/* Rendered Google button (official SDK) */}
                <div ref={googleBtnRef} className="flex justify-center" />

                {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                  <p className="text-themed-muted text-[10px] text-center mt-2">
                    {lang === 'fr' ? 'Google Sign-In non configure' : 'Google Sign-In not configured'}
                  </p>
                )}
              </div>
            )}

            {/* Toggle mode */}
            <div className="mt-6 text-center">
              {mode === 'login' && (
                <p className="text-themed-muted text-sm">
                  {t.auth.dont_have_account}
                  <button
                    onClick={() => { setMode('register'); setLocalError(null); setInfoMessage(null); }}
                    className="ml-1 font-bold text-themed hover:underline"
                  >
                    {t.auth.sign_up}
                  </button>
                </p>
              )}
              {mode === 'register' && (
                <p className="text-themed-muted text-sm">
                  {t.auth.already_have_account}
                  <button
                    onClick={() => { setMode('login'); setLocalError(null); setInfoMessage(null); }}
                    className="ml-1 font-bold text-themed hover:underline"
                  >
                    {t.auth.sign_in}
                  </button>
                </p>
              )}
              {(mode === 'forgot' || mode === 'reset') && (
                <button
                  onClick={() => { setMode('login'); setLocalError(null); setInfoMessage(null); setDevHint(null); }}
                  className="text-sm font-bold text-themed hover:underline"
                >
                  {lang === 'fr' ? 'Retour a la connexion' : 'Back to Sign In'}
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
                  {lang === 'fr' ? 'Securise' : 'Secure'}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {lang === 'fr' ? 'Avec publicites' : 'Ad supported'}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {lang === 'fr' ? 'Sans abonnement' : 'No subscription'}
                </div>
              </div>
            </div>
          </div>

          {/* Motivational quote below card */}
          <div className="mt-8 text-center">
            <p className="text-themed-muted text-xs font-serif italic">
              {lang === 'fr'
                ? '"Une piece sans livres est comme un corps sans ame."'
                : '"A room without books is like a body without a soul."'}
            </p>
            <p className="text-themed-muted text-[10px] font-bold uppercase tracking-wider mt-1">— Marcus Tullius Cicero</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
