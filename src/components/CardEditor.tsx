/**
 * CardEditor — View for managing cards within a deck.
 * Supports add, edit, delete, search, and Markdown preview.
 */
import { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Edit3,
  Trash2,
  Search,
  Eye,
  BookOpen,
  Tag,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from './Modal';
import MarkdownRenderer from './MarkdownRenderer';

export default function CardEditor() {
  const {
    getDeck, selectedDeckId,
    addCard, updateCard, deleteCard,
    setCurrentView, setSelectedDeckId,
    t,
  } = useApp();

  const deck = selectedDeckId ? getDeck(selectedDeckId) : undefined;

  // Card editor state
  const [showCardModal, setShowCardModal] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [tags, setTags] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  if (!deck) return null;

  const filteredCards = deck.cards.filter((card) => {
    const q = searchQuery.toLowerCase();
    return (
      card.front.toLowerCase().includes(q) ||
      card.back.toLowerCase().includes(q) ||
      card.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  const openAddCard = () => {
    setFront('');
    setBack('');
    setTags('');
    setEditingCardId(null);
    setShowPreview(false);
    setShowCardModal(true);
  };

  const openEditCard = (cardId: string) => {
    const card = deck.cards.find((c) => c.id === cardId);
    if (!card) return;
    setFront(card.front);
    setBack(card.back);
    setTags(card.tags.join(', '));
    setEditingCardId(cardId);
    setShowPreview(false);
    setShowCardModal(true);
  };

  const handleSaveCard = () => {
    if (!front.trim() || !back.trim()) return;
    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingCardId) {
      updateCard(deck.id, editingCardId, { front: front.trim(), back: back.trim(), tags: parsedTags });
    } else {
      addCard(deck.id, front.trim(), back.trim(), parsedTags);
    }
    setShowCardModal(false);
  };

  const handleDeleteCard = (cardId: string) => {
    deleteCard(deck.id, cardId);
    setShowDeleteConfirm(null);
  };

  const stageColors: Record<number, string> = {
    0: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
    1: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    2: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    3: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  };

  const stageLabels: Record<number, string> = {
    0: t('newCards'),
    1: t('learningCards'),
    2: t('reviewCards'),
    3: t('masteredCards'),
  };

  return (
    <div className="pb-24 px-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="pt-4 pb-4 flex items-center gap-3">
        <button
          onClick={() => {
            setCurrentView('home');
            setSelectedDeckId(null);
          }}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white truncate">
            {deck.name}
          </h1>
          <p className="text-xs text-slate-400">
            {t('cardsCount', { count: deck.cards.length })}
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedDeckId(deck.id);
            setCurrentView('study');
          }}
          disabled={deck.cards.length === 0}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors
            disabled:opacity-40 disabled:cursor-not-allowed"
          title={t('studyNow')}
        >
          <BookOpen size={18} />
        </button>
      </div>

      {/* Search and Add */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search')}
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 
              dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white 
              focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <button
          onClick={openAddCard}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors 
            shadow-lg shadow-indigo-500/25"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Card list */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 dark:text-slate-500 text-sm">
            {deck.cards.length === 0 ? t('noCards') : 'No results found.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 
                dark:border-slate-700/50 p-3 group hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-white line-clamp-2">
                    {card.front}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-1">
                    {card.back}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${stageColors[card.sr.stage]}`}>
                      {stageLabels[card.sr.stage]}
                    </span>
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 
                          text-indigo-500 dark:text-indigo-400 flex items-center gap-0.5"
                      >
                        <Tag size={8} /> {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditCard(card.id)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Edit3 size={14} className="text-slate-400" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(card.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Card Add/Edit Modal */}
      <Modal
        isOpen={showCardModal}
        onClose={() => setShowCardModal(false)}
        title={editingCardId ? t('editCard') : t('addCard')}
        size="lg"
      >
        <div className="space-y-4">
          {/* Toggle Preview */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors
                ${showPreview 
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
            >
              <Eye size={12} /> {t('preview')}
            </button>
          </div>

          {/* Front */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t('front')}
            </label>
            {showPreview ? (
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl min-h-[80px]">
                <MarkdownRenderer content={front || '*Empty*'} />
              </div>
            ) : (
              <textarea
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder={t('frontPlaceholder')}
                rows={3}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 
                  dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white 
                  focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none 
                  transition-all resize-none font-mono"
                autoFocus
              />
            )}
          </div>

          {/* Back */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t('back')}
            </label>
            {showPreview ? (
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl min-h-[80px]">
                <MarkdownRenderer content={back || '*Empty*'} />
              </div>
            ) : (
              <textarea
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder={t('backPlaceholder')}
                rows={3}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 
                  dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white 
                  focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none 
                  transition-all resize-none font-mono"
              />
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t('tags')}
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder={t('tagsPlaceholder')}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 
                dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white 
                focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Save/Cancel */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setShowCardModal(false)}
              className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 
                rounded-xl text-slate-600 dark:text-slate-300 font-medium 
                hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSaveCard}
              disabled={!front.trim() || !back.trim()}
              className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white 
                rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('save')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Card Confirmation */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title={t('deleteCard')}
        size="sm"
      >
        <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
          {t('deleteCardConfirm')}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setShowDeleteConfirm(null)}
            className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 
              rounded-xl text-slate-600 dark:text-slate-300 font-medium 
              hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={() => showDeleteConfirm && handleDeleteCard(showDeleteConfirm)}
            className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white 
              rounded-xl font-medium transition-colors"
          >
            {t('delete')}
          </button>
        </div>
      </Modal>
    </div>
  );
}
