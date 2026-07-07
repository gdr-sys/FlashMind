/**
 * Firestore Service — Handles all database operations for user data.
 * 
 * Data structure:
 * users/{userId}/decks/{deckId} → Deck document
 * users/{userId}/sessions/{sessionId} → StudySession document
 */
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Deck, StudySession } from '../types';

// ─── Deck Operations ───────────────────────────────────────

/** Get all decks for a user */
export async function getUserDecks(userId: string): Promise<Deck[]> {
  const decksRef = collection(db, 'users', userId, 'decks');
  const q = query(decksRef, orderBy('updatedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Deck));
}

/** Subscribe to deck changes (real-time updates) */
export function subscribeToDecks(
  userId: string,
  onUpdate: (decks: Deck[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const decksRef = collection(db, 'users', userId, 'decks');
  const q = query(decksRef, orderBy('updatedAt', 'desc'));
  
  return onSnapshot(
    q,
    (snapshot) => {
      const decks = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Deck));
      onUpdate(decks);
    },
    (error) => {
      console.error('Firestore subscription error:', error);
      onError?.(error);
    }
  );
}

/** Save a single deck */
export async function saveDeck(userId: string, deck: Deck): Promise<void> {
  const deckRef = doc(db, 'users', userId, 'decks', deck.id);
  await setDoc(deckRef, deck);
}

/** Update a deck (partial) */
export async function updateDeck(
  userId: string,
  deckId: string,
  updates: Partial<Deck>
): Promise<void> {
  const deckRef = doc(db, 'users', userId, 'decks', deckId);
  await updateDoc(deckRef, { ...updates, updatedAt: Date.now() });
}

/** Delete a deck */
export async function deleteDeckFromFirestore(userId: string, deckId: string): Promise<void> {
  const deckRef = doc(db, 'users', userId, 'decks', deckId);
  await deleteDoc(deckRef);
}

/** Save all decks (batch write) */
export async function saveAllDecks(userId: string, decks: Deck[]): Promise<void> {
  const batch = writeBatch(db);
  
  decks.forEach((deck) => {
    const deckRef = doc(db, 'users', userId, 'decks', deck.id);
    batch.set(deckRef, deck);
  });
  
  await batch.commit();
}

// ─── Session Operations ────────────────────────────────────

/** Get all study sessions for a user */
export async function getUserSessions(userId: string): Promise<StudySession[]> {
  const sessionsRef = collection(db, 'users', userId, 'sessions');
  const q = query(sessionsRef, orderBy('startedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as StudySession);
}

/** Save a study session */
export async function saveSession(userId: string, session: StudySession): Promise<void> {
  const sessionId = `${session.deckId}-${session.startedAt}`;
  const sessionRef = doc(db, 'users', userId, 'sessions', sessionId);
  await setDoc(sessionRef, session);
}

/** Subscribe to session changes */
export function subscribeToSessions(
  userId: string,
  onUpdate: (sessions: StudySession[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const sessionsRef = collection(db, 'users', userId, 'sessions');
  const q = query(sessionsRef, orderBy('startedAt', 'desc'));
  
  return onSnapshot(
    q,
    (snapshot) => {
      const sessions = snapshot.docs.map((doc) => doc.data() as StudySession);
      onUpdate(sessions);
    },
    (error) => {
      console.error('Firestore subscription error:', error);
      onError?.(error);
    }
  );
}

// ─── Migration ─────────────────────────────────────────────

/** Migrate local data to Firestore for a new user */
export async function migrateLocalDataToFirestore(
  userId: string,
  decks: Deck[],
  sessions: StudySession[]
): Promise<void> {
  // Check if user already has data
  const existingDecks = await getUserDecks(userId);
  if (existingDecks.length > 0) {
    console.log('User already has cloud data, skipping migration');
    return;
  }

  // Migrate decks and sessions
  if (decks.length > 0) {
    await saveAllDecks(userId, decks);
  }

  if (sessions.length > 0) {
    const batch = writeBatch(db);
    sessions.forEach((session) => {
      const sessionId = `${session.deckId}-${session.startedAt}`;
      const sessionRef = doc(db, 'users', userId, 'sessions', sessionId);
      batch.set(sessionRef, session);
    });
    await batch.commit();
  }

  console.log(`Migrated ${decks.length} decks and ${sessions.length} sessions to Firestore`);
}

// ─── User Profile ──────────────────────────────────────────

interface UserProfile {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  createdAt: number;
  lastLogin: number;
}

/** Create or update user profile */
export async function updateUserProfile(
  userId: string,
  profile: Partial<UserProfile>
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const existing = await getDoc(userRef);
  
  if (existing.exists()) {
    await updateDoc(userRef, { ...profile, lastLogin: Date.now() });
  } else {
    await setDoc(userRef, {
      ...profile,
      createdAt: Date.now(),
      lastLogin: Date.now(),
    });
  }
}
