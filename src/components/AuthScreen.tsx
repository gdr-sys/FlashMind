/**
 * AuthScreen — Login and registration screen with Google Sign-In.
 */
import { useState } from 'react';
import { Layers, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import type { TranslationKey } from '../i18n/translations';

interface AuthScreenProps {
  onSignInWithGoogle: () => Promise<void>;
  onSignInWithEmail: (email: string, password: string) => Promise<void>;
  onRegisterWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  error: string | null;
  clearError: () => void;
  t: (key: TranslationKey) => string;
}

export default function AuthScreen({
  onSignInWithGoogle,
  onSignInWithEmail,
  onRegisterWithEmail,
  error,
  clearError,
  t,
}: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearError();

    try {
      if (mode === 'login') {
        await onSignInWithEmail(email, password);
      } else {
        await onRegisterWithEmail(email, password, displayName);
      }
    } catch {
      // Error is handled by the hook
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    clearError();
    try {
      await onSignInWithGoogle();
    } catch {
      // Error is handled by the hook
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    clearError();
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Layers size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">FlashMind</h1>
          <p className="text-white/70 text-sm mt-1">{t('appTagline')}</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white text-center mb-6">
            {mode === 'login' ? t('signIn') : t('createAccount')}
          </h2>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2">
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Google Sign-In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 
              bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 
              rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin text-slate-400" />
            ) : (
              <>
                <GoogleIcon />
                <span className="font-medium text-slate-700 dark:text-white">
                  {t('continueWithGoogle')}
                </span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-600" />
            <span className="text-xs text-slate-400 uppercase">{t('or')}</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-600" />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t('displayName')}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 
                    border border-slate-200 dark:border-slate-600 rounded-xl 
                    text-slate-800 dark:text-white placeholder-slate-400
                    focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            )}

            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('email')}
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 
                  border border-slate-200 dark:border-slate-600 rounded-xl 
                  text-slate-800 dark:text-white placeholder-slate-400
                  focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('password')}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 
                  border border-slate-200 dark:border-slate-600 rounded-xl 
                  text-slate-800 dark:text-white placeholder-slate-400
                  focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white 
                rounded-xl font-medium transition-colors 
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                mode === 'login' ? t('signIn') : t('createAccount')
              )}
            </button>
          </form>

          {/* Switch mode */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-5">
            {mode === 'login' ? t('noAccount') : t('haveAccount')}{' '}
            <button
              onClick={switchMode}
              className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              {mode === 'login' ? t('createAccount') : t('signIn')}
            </button>
          </p>
        </div>

        {/* Privacy note */}
        <p className="text-center text-xs text-white/50 mt-6 px-4">
          {t('privacyNote')}
        </p>
      </div>
    </div>
  );
}

// Google "G" logo SVG
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
