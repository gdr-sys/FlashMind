/**
 * Core type definitions for FlashMind
 */

/** A single flashcard */
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  /** Tags for organization */
  tags: string[];
  /** Spaced repetition data */
  sr: SpacedRepetitionData;
  createdAt: number;
  updatedAt: number;
}

/** Spaced repetition metadata */
export interface SpacedRepetitionData {
  /** 0 = new, 1 = learning, 2 = review, 3 = mastered */
  stage: 0 | 1 | 2 | 3;
  /** Ease factor (starts at 2.5) */
  ease: number;
  /** Current interval in minutes */
  interval: number;
  /** Number of consecutive correct answers */
  streak: number;
  /** Next review timestamp */
  nextReview: number;
  /** Total reviews */
  totalReviews: number;
  /** Total correct */
  totalCorrect: number;
}

/** A deck/collection of flashcards */
export interface Deck {
  id: string;
  name: string;
  description: string;
  color: string;
  cards: Flashcard[];
  createdAt: number;
  updatedAt: number;
}

/** User answer quality during study */
export type AnswerQuality = 'forgot' | 'hard' | 'knew';

/** App view/route */
export type AppView = 'home' | 'study' | 'editor' | 'stats' | 'settings';

/** Theme mode */
export type ThemeMode = 'light' | 'dark' | 'system';

/** Supported languages */
export type Language = 'en' | 'it' | 'es' | 'fr' | 'de' | 'pt';

/** Study session stats */
export interface StudySession {
  deckId: string;
  startedAt: number;
  endedAt: number;
  cardsStudied: number;
  correct: number;
  hard: number;
  forgot: number;
}

/** Export format */
export interface ExportData {
  version: string;
  exportedAt: number;
  decks: Deck[];
}
