/**
 * FlashcardViewer — Study mode with card flipping, spaced repetition,
 * swipe gestures, keyboard shortcuts, and session summary.
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  X,
  Minus,
  Check,
  Trophy,
  Brain,
  Target,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getDueCards, updateSR } from '../utils/spacedRepetition';
import MarkdownRenderer from './MarkdownRenderer';
import type { Flashcard, AnswerQuality } from '../types';

interface SessionResult {
  cardsStudied: number;
  correct: number;
  hard: number;
  forgot: number;
}

export default function FlashcardViewer() {
  const {
    getDeck, selectedDeckId,
    updateCardSR, addSession,
    setCurrentView, setSelectedDeckId,
    t,
  } = useApp();

  const deck = selectedDeckId ? getDeck(selectedDeckId) : undefined;

  const [studyQueue, setStudyQueue] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [result, setResult] = useState<SessionResult>({ cardsStudied: 0, correct: 0, hard: 0, forgot: 0 });
  const [studyAll, setStudyAll] = useState(false);

  const startTimeRef = useRef(Date.now());
  const resultRef = useRef(result);
  resultRef.current = result;

  // Touch/swipe state
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);

  // Initialize study queue
  useEffect(() => {
    if (!deck) return;
    const due = getDueCards(deck.cards);
    if (due.length > 0) {
      setStudyQueue([...due]);
      setStudyAll(false);
    } else {
      setStudyQueue([]);
    }
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionDone(false);
    setResult({ cardsStudied: 0, correct: 0, hard: 0, forgot: 0 });
    startTimeRef.current = Date.now();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck?.id]);

  const currentCard = studyQueue[currentIndex];

  const startStudyAll = () => {
    if (!deck) return;
    setStudyQueue([...deck.cards]);
    setStudyAll(true);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionDone(false);
    setResult({ cardsStudied: 0, correct: 0, hard: 0, forgot: 0 });
    startTimeRef.current = Date.now();
  };

  // Flip card
  const flipCard = useCallback(() => {
    if (!isAnimating) {
      setIsFlipped((prev) => !prev);
    }
  }, [isAnimating]);

  // Answer card
  const answerCard = useCallback(
    (quality: AnswerQuality) => {
      if (!currentCard || !deck || isAnimating) return;

      setIsAnimating(true);

      // Update spaced repetition
      const newSR = updateSR(currentCard.sr, quality);
      updateCardSR(deck.id, currentCard.id, newSR);

      // Update session result
      const newResult: SessionResult = {
        cardsStudied: resultRef.current.cardsStudied + 1,
        correct: resultRef.current.correct + (quality === 'knew' ? 1 : 0),
        hard: resultRef.current.hard + (quality === 'hard' ? 1 : 0),
        forgot: resultRef.current.forgot + (quality === 'forgot' ? 1 : 0),
      };
      setResult(newResult);
      resultRef.current = newResult;

      // If forgot, re-add card to end of queue
      let queueLength = studyQueue.length;
      if (quality === 'forgot') {
        setStudyQueue((prev) => [...prev, { ...currentCard, sr: newSR }]);
        queueLength += 1;
      }

      // Animate out and move to next
      const nextIdx = currentIndex + 1;
      setTimeout(() => {
        if (nextIdx >= queueLength) {
          // Session complete
          setSessionDone(true);
          addSession({
            deckId: deck.id,
            startedAt: startTimeRef.current,
            endedAt: Date.now(),
            cardsStudied: newResult.cardsStudied,
            correct: newResult.correct,
            hard: newResult.hard,
            forgot: newResult.forgot,
          });
        } else {
          setCurrentIndex(nextIdx);
          setIsFlipped(false);
        }
        setIsAnimating(false);
        setSwipeOffset(0);
      }, 300);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentCard?.id, deck?.id, currentIndex, studyQueue.length, isAnimating, updateCardSR, addSession]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (sessionDone) return;
      switch (e.key) {
        // Flip card
        case ' ':
        case 'Enter':
        case 'ArrowUp':
          e.preventDefault();
          if (!isFlipped) flipCard();
          break;
        // Didn't know (forgot)
        case '1':
        case 'ArrowLeft':
          e.preventDefault();
          if (isFlipped) answerCard('forgot');
          break;
        // So-so (hard)
        case '2':
        case 'ArrowDown':
          e.preventDefault();
          if (isFlipped) answerCard('hard');
          break;
        // Knew it
        case '3':
        case 'ArrowRight':
          e.preventDefault();
          if (isFlipped) answerCard('knew');
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, sessionDone, flipCard, answerCard]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !isFlipped) return;
    const dx = e.touches[0].clientX - touchStartRef.current.x;
    setSwipeOffset(dx);
  };

  const handleTouchEnd = () => {
    if (!touchStartRef.current || !isFlipped) {
      if (!isFlipped && touchStartRef.current) flipCard();
      touchStartRef.current = null;
      setSwipeOffset(0);
      return;
    }

    if (Math.abs(swipeOffset) > 80) {
      if (swipeOffset > 0) {
        answerCard('knew');
      } else {
        answerCard('forgot');
      }
    } else {
      setSwipeOffset(0);
    }
    touchStartRef.current = null;
  };

  const goBack = () => {
    setCurrentView('home');
    setSelectedDeckId(null);
  };

  if (!deck) return null;

  // ─── No cards due ────────────────────────────────────────
  if (studyQueue.length === 0 && !sessionDone) {
    return (
      <div className="pb-24 px-4 max-w-lg mx-auto">
        <div className="pt-4 pb-4 flex items-center gap-3">
          <button onClick={goBack} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">{deck.name}</h1>
        </div>

        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center">
            <Trophy size={36} className="text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{t('noCardsDue')}</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
            Come back later for your next review session.
          </p>
          {deck.cards.length > 0 && (
            <button
              onClick={startStudyAll}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
            >
              {t('studyAgain')} ({deck.cards.length})
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── Session complete ────────────────────────────────────
  if (sessionDone) {
    const total = result.cardsStudied;
    const accuracyPct = total > 0 ? Math.round(((result.correct + result.hard * 0.5) / total) * 100) : 0;

    return (
      <div className="pb-24 px-4 max-w-lg mx-auto">
        <div className="pt-4 pb-4 flex items-center gap-3">
          <button onClick={goBack} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">{deck.name}</h1>
        </div>

        <div className="text-center py-10">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-lg shadow-amber-500/30 animate-slide-up">
            <Trophy size={48} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t('sessionComplete')}</h2>

          <div className="grid grid-cols-3 gap-3 mt-8 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
              <Brain size={20} className="mx-auto mb-2 text-indigo-500" />
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{total}</p>
              <p className="text-xs text-slate-400">{t('cardsStudied')}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
              <Target size={20} className="mx-auto mb-2 text-emerald-500" />
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{accuracyPct}%</p>
              <p className="text-xs text-slate-400">{t('accuracy')}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
              <Zap size={20} className="mx-auto mb-2 text-amber-500" />
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{result.correct}</p>
              <p className="text-xs text-slate-400">{t('knew')}</p>
            </div>
          </div>

          {/* Breakdown bar */}
          {total > 0 && (
            <div className="mb-8">
              <div className="flex rounded-full overflow-hidden h-3 bg-slate-100 dark:bg-slate-700">
                {result.correct > 0 && (
                  <div className="bg-emerald-500 transition-all" style={{ width: `${(result.correct / total) * 100}%` }} />
                )}
                {result.hard > 0 && (
                  <div className="bg-amber-400 transition-all" style={{ width: `${(result.hard / total) * 100}%` }} />
                )}
                {result.forgot > 0 && (
                  <div className="bg-red-400 transition-all" style={{ width: `${(result.forgot / total) * 100}%` }} />
                )}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> {t('knew')} ({result.correct})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> {t('hard')} ({result.hard})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400" /> {t('forgot')} ({result.forgot})
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={goBack}
              className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {t('backToDeck')}
            </button>
            <button
              onClick={startStudyAll}
              className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} /> {t('studyAgain')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Active study ────────────────────────────────────────
  const progress = studyQueue.length > 0 ? ((currentIndex + 1) / studyQueue.length) * 100 : 0;

  const getSwipeStyle = (): React.CSSProperties => {
    if (!isFlipped || swipeOffset === 0) return {};
    const rotation = swipeOffset * 0.05;
    const opacity = 1 - Math.abs(swipeOffset) / 400;
    return {
      transform: `translateX(${swipeOffset}px) rotate(${rotation}deg)`,
      opacity: Math.max(0.5, opacity),
    };
  };

  return (
    <div className="pb-24 px-4 max-w-lg mx-auto flex flex-col min-h-[calc(100dvh-80px)]">
      {/* Header */}
      <div className="pt-4 pb-2 flex items-center gap-3">
        <button onClick={goBack} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-semibold text-slate-800 dark:text-white truncate">{deck.name}</h1>
          <p className="text-xs text-slate-400">
            {t('cardOf', { current: currentIndex + 1, total: studyQueue.length })}
            {studyAll ? '' : ` (${t('dueCards', { count: studyQueue.length })})`}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center py-4">
        <div
          className="w-full relative"
          style={{ perspective: '1000px', ...getSwipeStyle() }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={() => { if (!isFlipped) flipCard(); }}
        >
          <div
            className={`relative w-full min-h-[300px] sm:min-h-[360px] transition-transform duration-500 cursor-pointer`}
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front */}
            <div
              className="absolute inset-0"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            >
              <div className="h-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center p-8 text-center">
                <div className="absolute top-4 left-4 text-xs text-slate-300 dark:text-slate-600 font-medium uppercase tracking-wider">
                  {t('front')}
                </div>
                <MarkdownRenderer content={currentCard?.front || ''} className="text-lg" />
                <p className="absolute bottom-4 text-xs text-slate-300 dark:text-slate-600">{t('tapToFlip')}</p>
              </div>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <div className="h-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-indigo-900/20 rounded-3xl shadow-xl border border-indigo-100 dark:border-indigo-800/30 flex flex-col items-center justify-center p-8 text-center">
                <div className="absolute top-4 left-4 text-xs text-indigo-300 dark:text-indigo-600 font-medium uppercase tracking-wider">
                  {t('back')}
                </div>
                <MarkdownRenderer content={currentCard?.back || ''} className="text-lg" />
              </div>
            </div>
          </div>

          {/* Swipe indicators */}
          {isFlipped && swipeOffset !== 0 && (
            <>
              {swipeOffset > 30 && (
                <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
                  {t('knew')} ✓
                </div>
              )}
              {swipeOffset < -30 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
                  {t('forgot')} ✗
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Answer buttons — only visible when flipped */}
      <div className={`transition-all duration-300 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="grid grid-cols-3 gap-3 pb-4">
          <button
            onClick={() => answerCard('forgot')}
            className="flex flex-col items-center gap-1.5 px-3 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl transition-colors"
          >
            <X size={22} strokeWidth={2.5} />
            <span className="text-xs font-medium">{t('forgot')}</span>
          </button>
          <button
            onClick={() => answerCard('hard')}
            className="flex flex-col items-center gap-1.5 px-3 py-3 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl transition-colors"
          >
            <Minus size={22} strokeWidth={2.5} />
            <span className="text-xs font-medium">{t('hard')}</span>
          </button>
          <button
            onClick={() => answerCard('knew')}
            className="flex flex-col items-center gap-1.5 px-3 py-3 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl transition-colors"
          >
            <Check size={22} strokeWidth={2.5} />
            <span className="text-xs font-medium">{t('knew')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
