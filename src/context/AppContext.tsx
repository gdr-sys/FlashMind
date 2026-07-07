/**
 * Global application context.
 * Manages decks, navigation, study sessions, toasts, settings, and Firebase sync.
 */
import { createContext, useContext, useCallback, useState, useEffect, useRef, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../hooks/useAuth';
import { generateId } from '../utils/id';
import { createDefaultSR } from '../utils/spacedRepetition';
import {
  subscribeToDecks,
  subscribeToSessions,
  saveDeck,
  updateDeck as updateDeckFirestore,
  deleteDeckFromFirestore,
  saveSession,
  migrateLocalDataToFirestore,
  updateUserProfile,
} from '../services/firestoreService';
import type {
  Deck,
  Flashcard,
  AppView,
  StudySession,
  ExportData,
  ThemeMode,
  Language,
} from '../types';
import type { TranslationKey } from '../i18n/translations';
import type { User } from 'firebase/auth';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearAuthError: () => void;

  // Decks
  decks: Deck[];
  createDeck: (name: string, description: string, color: string) => Promise<Deck>;
  updateDeck: (id: string, updates: Partial<Pick<Deck, 'name' | 'description' | 'color'>>) => void;
  deleteDeck: (id: string) => void;
  getDeck: (id: string) => Deck | undefined;

  // Cards
  addCard: (deckId: string, front: string, back: string, tags: string[]) => void;
  updateCard: (deckId: string, cardId: string, updates: Partial<Pick<Flashcard, 'front' | 'back' | 'tags'>>) => void;
  deleteCard: (deckId: string, cardId: string) => void;
  updateCardSR: (deckId: string, cardId: string, sr: Flashcard['sr']) => void;

  // Navigation
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedDeckId: string | null;
  setSelectedDeckId: (id: string | null) => void;

  // Study sessions
  sessions: StudySession[];
  addSession: (session: StudySession) => void;

  // Import/Export
  exportDeck: (deckId: string) => void;
  exportAllDecks: () => void;
  importDecks: (file: File) => Promise<void>;

  // Theme
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;

  // Language
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  language: Language;
  setLanguage: (lang: Language) => void;

  // Toast
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;

  // Reset
  resetAllData: () => void;

  // Migration
  migrateLocalData: () => Promise<void>;
  hasPendingLocalData: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

/** Deck colors palette */
export const DECK_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#64748b', '#78716c',
];

export function AppProvider({ children }: { children: ReactNode }) {
  // Local storage (fallback for offline/unauthenticated)
  const [localDecks, setLocalDecks] = useLocalStorage<Deck[]>('flashmind-decks', []);
  const [localSessions, setLocalSessions] = useLocalStorage<StudySession[]>('flashmind-sessions', []);
  
  // Cloud data (from Firebase)
  const [cloudDecks, setCloudDecks] = useState<Deck[]>([]);
  const [cloudSessions, setCloudSessions] = useState<StudySession[]>([]);
  
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const { themeMode, setThemeMode } = useTheme();
  const { t, language, setLanguage } = useTranslation();
  const {
    user,
    loading: authLoading,
    error: authError,
    isAuthenticated,
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    logout,
    clearError: clearAuthError,
  } = useAuth();

  // Use cloud data when authenticated, local otherwise
  const decks = isAuthenticated ? cloudDecks : localDecks;
  const sessions = isAuthenticated ? cloudSessions : localSessions;
  // Note: setDecks and setSessions are used conditionally in the CRUD operations
  void(isAuthenticated ? setCloudDecks : setLocalDecks);
  void(isAuthenticated ? setCloudSessions : setLocalSessions);

  // Track if there's local data that can be migrated
  const hasPendingLocalData = isAuthenticated && localDecks.length > 0;

  // Unsubscribe refs
  const unsubDecksRef = useRef<(() => void) | null>(null);
  const unsubSessionsRef = useRef<(() => void) | null>(null);

  // Subscribe to Firestore when authenticated
  useEffect(() => {
    if (user) {
      // Update user profile
      updateUserProfile(user.uid, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      });

      // Subscribe to decks
      unsubDecksRef.current = subscribeToDecks(
        user.uid,
        (decks) => setCloudDecks(decks),
        (error) => console.error('Deck subscription error:', error)
      );

      // Subscribe to sessions
      unsubSessionsRef.current = subscribeToSessions(
        user.uid,
        (sessions) => setCloudSessions(sessions),
        (error) => console.error('Session subscription error:', error)
      );
    }

    return () => {
      unsubDecksRef.current?.();
      unsubSessionsRef.current?.();
    };
  }, [user]);

  // ─── Toast System ────────────────────────────────────────
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ─── Deck CRUD ───────────────────────────────────────────
  const createDeck = useCallback(
    async (name: string, description: string, color: string): Promise<Deck> => {
      const now = Date.now();
      const deck: Deck = {
        id: generateId(),
        name,
        description,
        color,
        cards: [],
        createdAt: now,
        updatedAt: now,
      };

      if (user) {
        await saveDeck(user.uid, deck);
      } else {
        setLocalDecks((prev) => [...prev, deck]);
      }
      
      showToast(t('saved'));
      return deck;
    },
    [user, setLocalDecks, showToast, t]
  );

  const updateDeck = useCallback(
    async (id: string, updates: Partial<Pick<Deck, 'name' | 'description' | 'color'>>) => {
      if (user) {
        await updateDeckFirestore(user.uid, id, updates);
      } else {
        setLocalDecks((prev) =>
          prev.map((d) => (d.id === id ? { ...d, ...updates, updatedAt: Date.now() } : d))
        );
      }
      showToast(t('saved'));
    },
    [user, setLocalDecks, showToast, t]
  );

  const deleteDeck = useCallback(
    async (id: string) => {
      if (user) {
        await deleteDeckFromFirestore(user.uid, id);
      } else {
        setLocalDecks((prev) => prev.filter((d) => d.id !== id));
      }
      showToast(t('deleted'));
    },
    [user, setLocalDecks, showToast, t]
  );

  const getDeck = useCallback(
    (id: string) => decks.find((d) => d.id === id),
    [decks]
  );

  // ─── Card CRUD ───────────────────────────────────────────
  const addCard = useCallback(
    async (deckId: string, front: string, back: string, tags: string[]) => {
      const now = Date.now();
      const card: Flashcard = {
        id: generateId(),
        front,
        back,
        tags,
        sr: createDefaultSR(),
        createdAt: now,
        updatedAt: now,
      };

      const deck = decks.find((d) => d.id === deckId);
      if (!deck) return;

      const updatedDeck = {
        ...deck,
        cards: [...deck.cards, card],
        updatedAt: now,
      };

      if (user) {
        await saveDeck(user.uid, updatedDeck);
      } else {
        setLocalDecks((prev) => prev.map((d) => (d.id === deckId ? updatedDeck : d)));
      }
      showToast(t('saved'));
    },
    [user, decks, setLocalDecks, showToast, t]
  );

  const updateCard = useCallback(
    async (deckId: string, cardId: string, updates: Partial<Pick<Flashcard, 'front' | 'back' | 'tags'>>) => {
      const deck = decks.find((d) => d.id === deckId);
      if (!deck) return;

      const updatedDeck = {
        ...deck,
        cards: deck.cards.map((c) =>
          c.id === cardId ? { ...c, ...updates, updatedAt: Date.now() } : c
        ),
        updatedAt: Date.now(),
      };

      if (user) {
        await saveDeck(user.uid, updatedDeck);
      } else {
        setLocalDecks((prev) => prev.map((d) => (d.id === deckId ? updatedDeck : d)));
      }
      showToast(t('saved'));
    },
    [user, decks, setLocalDecks, showToast, t]
  );

  const deleteCard = useCallback(
    async (deckId: string, cardId: string) => {
      const deck = decks.find((d) => d.id === deckId);
      if (!deck) return;

      const updatedDeck = {
        ...deck,
        cards: deck.cards.filter((c) => c.id !== cardId),
        updatedAt: Date.now(),
      };

      if (user) {
        await saveDeck(user.uid, updatedDeck);
      } else {
        setLocalDecks((prev) => prev.map((d) => (d.id === deckId ? updatedDeck : d)));
      }
      showToast(t('deleted'));
    },
    [user, decks, setLocalDecks, showToast, t]
  );

  const updateCardSR = useCallback(
    async (deckId: string, cardId: string, sr: Flashcard['sr']) => {
      const deck = decks.find((d) => d.id === deckId);
      if (!deck) return;

      const updatedDeck = {
        ...deck,
        cards: deck.cards.map((c) => (c.id === cardId ? { ...c, sr } : c)),
      };

      if (user) {
        await saveDeck(user.uid, updatedDeck);
      } else {
        setLocalDecks((prev) => prev.map((d) => (d.id === deckId ? updatedDeck : d)));
      }
    },
    [user, decks, setLocalDecks]
  );

  // ─── Sessions ────────────────────────────────────────────
  const addSession = useCallback(
    async (session: StudySession) => {
      if (user) {
        await saveSession(user.uid, session);
      } else {
        setLocalSessions((prev) => [...prev, session]);
      }
    },
    [user, setLocalSessions]
  );

  // ─── Import / Export ─────────────────────────────────────
  const exportDeck = useCallback(
    (deckId: string) => {
      const deck = decks.find((d) => d.id === deckId);
      if (!deck) return;

      const data: ExportData = {
        version: '1.0.0',
        exportedAt: Date.now(),
        decks: [deck],
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flashmind-${deck.name.replace(/\s+/g, '-').toLowerCase()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(t('exportSuccess'));
    },
    [decks, showToast, t]
  );

  const exportAllDecks = useCallback(() => {
    const data: ExportData = {
      version: '1.0.0',
      exportedAt: Date.now(),
      decks,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashmind-all-decks-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(t('exportSuccess'));
  }, [decks, showToast, t]);

  const importDecks = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        const data = JSON.parse(text) as ExportData;

        if (!data.decks || !Array.isArray(data.decks)) {
          throw new Error('Invalid format');
        }

        const importedDecks: Deck[] = data.decks.map((deck) => ({
          ...deck,
          id: generateId(),
          cards: deck.cards.map((card) => ({
            ...card,
            id: generateId(),
          })),
        }));

        if (user) {
          for (const deck of importedDecks) {
            await saveDeck(user.uid, deck);
          }
        } else {
          setLocalDecks((prev) => [...prev, ...importedDecks]);
        }
        showToast(t('importSuccess'));
      } catch {
        showToast(t('importError'), 'error');
      }
    },
    [user, setLocalDecks, showToast, t]
  );

  // ─── Migration ───────────────────────────────────────────
  const migrateLocalData = useCallback(async () => {
    if (!user || localDecks.length === 0) return;

    try {
      await migrateLocalDataToFirestore(user.uid, localDecks, localSessions);
      // Clear local data after migration
      setLocalDecks([]);
      setLocalSessions([]);
      showToast(t('migrateSuccess'));
    } catch (error) {
      console.error('Migration error:', error);
      showToast('Migration failed', 'error');
    }
  }, [user, localDecks, localSessions, setLocalDecks, setLocalSessions, showToast, t]);

  // ─── Reset ───────────────────────────────────────────────
  const resetAllData = useCallback(async () => {
    if (user) {
      // Delete all cloud data
      for (const deck of cloudDecks) {
        await deleteDeckFromFirestore(user.uid, deck.id);
      }
    } else {
      setLocalDecks([]);
      setLocalSessions([]);
    }
    showToast(t('deleted'));
  }, [user, cloudDecks, setLocalDecks, setLocalSessions, showToast, t]);

  return (
    <AppContext.Provider
      value={{
        // Auth
        user,
        isAuthenticated,
        authLoading,
        authError,
        signInWithGoogle,
        signInWithEmail,
        registerWithEmail,
        logout,
        clearAuthError,
        // Decks
        decks,
        createDeck,
        updateDeck,
        deleteDeck,
        getDeck,
        // Cards
        addCard,
        updateCard,
        deleteCard,
        updateCardSR,
        // Navigation
        currentView,
        setCurrentView,
        selectedDeckId,
        setSelectedDeckId,
        // Sessions
        sessions,
        addSession,
        // Import/Export
        exportDeck,
        exportAllDecks,
        importDecks,
        // Theme
        themeMode,
        setThemeMode,
        // Language
        t,
        language,
        setLanguage,
        // Toast
        toasts,
        showToast,
        dismissToast,
        // Reset
        resetAllData,
        // Migration
        migrateLocalData,
        hasPendingLocalData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
