/**
 * FlashMind — Main Application Component
 * 
 * A modern PWA flashcard app with spaced repetition,
 * multi-language support, dark/light themes, and Firebase cloud sync.
 */
import { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import AuthScreen from './components/AuthScreen';
import DeckManager from './components/DeckManager';
import CardEditor from './components/CardEditor';
import FlashcardViewer from './components/FlashcardViewer';
import StatsView from './components/StatsView';
import SettingsView from './components/SettingsView';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import { Loader2 } from 'lucide-react';

/** Register service worker for PWA */
function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration failed:', err);
      });
    });
  }
}

/** Loading screen */
function LoadingScreen() {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
      <div className="text-center">
        <Loader2 size={48} className="animate-spin text-white mx-auto mb-4" />
        <p className="text-white/80 text-sm">Loading...</p>
      </div>
    </div>
  );
}

/** Main view router */
function AppContent() {
  const {
    currentView,
    isAuthenticated,
    authLoading,
    authError,
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    clearAuthError,
    t,
  } = useApp();

  useEffect(() => {
    registerSW();
  }, []);

  // Show loading while checking auth state
  if (authLoading) {
    return <LoadingScreen />;
  }

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthScreen
        onSignInWithGoogle={signInWithGoogle}
        onSignInWithEmail={signInWithEmail}
        onRegisterWithEmail={registerWithEmail}
        error={authError}
        clearError={clearAuthError}
        t={t}
      />
    );
  }

  // Main app when authenticated
  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <DeckManager />;
      case 'editor':
        return <CardEditor />;
      case 'study':
        return <FlashcardViewer />;
      case 'stats':
        return <StatsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DeckManager />;
    }
  };

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <main className="relative">
        {renderView()}
      </main>
      <BottomNav />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
