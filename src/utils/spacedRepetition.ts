/**
 * Spaced Repetition "Lite" Algorithm
 * 
 * Based on a simplified SM-2 algorithm:
 * - "Forgot" → reset streak, short interval (1 min), decrease ease
 * - "Hard"   → keep streak, moderate interval, slightly decrease ease
 * - "Knew"   → increase streak, longer interval, increase ease
 * 
 * Intervals grow exponentially with the ease factor.
 */
import type { SpacedRepetitionData, AnswerQuality, Flashcard } from '../types';

/** Default SR data for a new card */
export function createDefaultSR(): SpacedRepetitionData {
  return {
    stage: 0,
    ease: 2.5,
    interval: 0,
    streak: 0,
    nextReview: Date.now(),
    totalReviews: 0,
    totalCorrect: 0,
  };
}

/** Minimum ease factor */
const MIN_EASE = 1.3;
/** Maximum ease factor */
const MAX_EASE = 3.5;

/** Update SR data based on user's answer quality */
export function updateSR(sr: SpacedRepetitionData, quality: AnswerQuality): SpacedRepetitionData {
  const now = Date.now();
  const newSR = { ...sr, totalReviews: sr.totalReviews + 1 };

  switch (quality) {
    case 'forgot': {
      // Reset — show again soon (1 minute)
      newSR.streak = 0;
      newSR.ease = Math.max(MIN_EASE, sr.ease - 0.3);
      newSR.interval = 1; // 1 minute
      newSR.stage = 1; // learning
      newSR.nextReview = now + 1 * 60 * 1000;
      break;
    }
    case 'hard': {
      // Moderate — slightly longer interval
      newSR.streak = sr.streak + 1;
      newSR.ease = Math.max(MIN_EASE, sr.ease - 0.1);
      newSR.totalCorrect = sr.totalCorrect + 1;
      
      if (sr.interval === 0) {
        newSR.interval = 10; // 10 minutes
      } else {
        newSR.interval = Math.round(sr.interval * 1.2);
      }
      
      newSR.stage = newSR.interval > 1440 ? 2 : 1; // 1440 min = 1 day
      newSR.nextReview = now + newSR.interval * 60 * 1000;
      break;
    }
    case 'knew': {
      // Easy — longer interval, increase ease
      newSR.streak = sr.streak + 1;
      newSR.ease = Math.min(MAX_EASE, sr.ease + 0.15);
      newSR.totalCorrect = sr.totalCorrect + 1;
      
      if (sr.interval === 0) {
        newSR.interval = 1440; // 1 day
      } else {
        newSR.interval = Math.round(sr.interval * sr.ease);
      }
      
      // Stage progression
      if (newSR.interval > 21 * 1440) {
        newSR.stage = 3; // mastered (21+ days)
      } else if (newSR.interval > 1440) {
        newSR.stage = 2; // review
      } else {
        newSR.stage = 1; // learning
      }
      
      newSR.nextReview = now + newSR.interval * 60 * 1000;
      break;
    }
  }

  return newSR;
}

/** Check if a card is due for review */
export function isDue(card: Flashcard): boolean {
  return Date.now() >= card.sr.nextReview;
}

/** Get cards sorted by due date (most overdue first) */
export function getDueCards(cards: Flashcard[]): Flashcard[] {
  const now = Date.now();
  return cards
    .filter((card) => card.sr.nextReview <= now)
    .sort((a, b) => a.sr.nextReview - b.sr.nextReview);
}

/** Format interval for display */
export function formatInterval(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
  return `${Math.round(minutes / 1440)}d`;
}

/** Format time until next review */
export function formatTimeUntil(timestamp: number): string {
  const diff = timestamp - Date.now();
  if (diff <= 0) return 'now';
  
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} min`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

/** Get deck statistics */
export function getDeckStats(cards: Flashcard[]) {
  const now = Date.now();
  return {
    total: cards.length,
    new: cards.filter((c) => c.sr.stage === 0).length,
    learning: cards.filter((c) => c.sr.stage === 1).length,
    review: cards.filter((c) => c.sr.stage === 2).length,
    mastered: cards.filter((c) => c.sr.stage === 3).length,
    due: cards.filter((c) => c.sr.nextReview <= now).length,
  };
}
