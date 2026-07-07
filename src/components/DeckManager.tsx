/**
 * DeckManager — Home view showing all decks with creation/import/export.
 */
import { useState, useRef } from 'react';
import {
  Plus,
  Upload,
  Download,
  BookOpen,
  Edit3,
  Trash2,
  Layers,
  MoreVertical,
} from 'lucide-react';
import { useApp, DECK_COLORS } from '../context/AppContext';
import { getDeckStats } from '../utils/spacedRepetition';
import Modal from './Modal';

export default function DeckManager() {
  const {
    decks, createDeck, updateDeck, deleteDeck,
    setCurrentView, setSelectedDeckId,
    exportDeck, exportAllDecks, importDecks,
    t,
  } = useApp();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDeck, setEditingDeck] = useState<string | null>(null);
  const [deckName, setDeckName] = useState('');
  const [deckDesc, setDeckDesc] = useState('');
  const [deckColor, setDeckColor] = useState(DECK_COLORS[0]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCreate = () => {
    setDeckName('');
    setDeckDesc('');
    setDeckColor(DECK_COLORS[Math.floor(Math.random() * DECK_COLORS.length)]);
    setEditingDeck(null);
    setShowCreateModal(true);
  };

  const openEdit = (deckId: string) => {
    const deck = decks.find((d) => d.id === deckId);
    if (!deck) return;
    setDeckName(deck.name);
    setDeckDesc(deck.description);
    setDeckColor(deck.color);
    setEditingDeck(deckId);
    setShowCreateModal(true);
    setMenuOpen(null);
  };

  const handleSave = () => {
    if (!deckName.trim()) return;
    if (editingDeck) {
      updateDeck(editingDeck, { name: deckName.trim(), description: deckDesc.trim(), color: deckColor });
    } else {
      createDeck(deckName.trim(), deckDesc.trim(), deckColor);
    }
    setShowCreateModal(false);
  };

  const handleDelete = (id: string) => {
    deleteDeck(id);
    setShowDeleteConfirm(null);
    setMenuOpen(null);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await importDecks(file);
      e.target.value = '';
    }
  };

  const openDeck = (deckId: string) => {
    setSelectedDeckId(deckId);
    setCurrentView('editor');
  };

  const startStudy = (deckId: string) => {
    setSelectedDeckId(deckId);
    setCurrentView('study');
  };

  return (
    <div className="pb-24 px-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Layers size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              {t('appName')}
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500">{t('appTagline')}</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={openCreate}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 
            bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium 
            transition-colors shadow-lg shadow-indigo-500/25"
        >
          <Plus size={18} />
          {t('createDeck')}
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 
            rounded-xl transition-colors text-slate-600 dark:text-slate-300"
          title={t('importDeck')}
        >
          <Upload size={18} />
        </button>
        {decks.length > 0 && (
          <button
            onClick={exportAllDecks}
            className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 
              rounded-xl transition-colors text-slate-600 dark:text-slate-300"
            title={t('exportDeck')}
          >
            <Download size={18} />
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>

      {/* Deck list */}
      {decks.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-2xl 
            flex items-center justify-center">
            <Layers size={36} className="text-slate-300 dark:text-slate-600" />
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-sm">{t('noDecks')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {t('yourDecks')}
          </h2>
          {decks.map((deck) => {
            const stats = getDeckStats(deck.cards);
            return (
              <div
                key={deck.id}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm 
                  border border-slate-100 dark:border-slate-700/50
                  overflow-hidden transition-all hover:shadow-md"
              >
                <div className="flex items-stretch">
                  {/* Color stripe */}
                  <div className="w-1.5 shrink-0" style={{ backgroundColor: deck.color }} />

                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <button
                        onClick={() => openDeck(deck.id)}
                        className="text-left flex-1"
                      >
                        <h3 className="font-semibold text-slate-800 dark:text-white text-base">
                          {deck.name}
                        </h3>
                        {deck.description && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">
                            {deck.description}
                          </p>
                        )}
                      </button>

                      {/* Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpen(menuOpen === deck.id ? null : deck.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          <MoreVertical size={16} className="text-slate-400" />
                        </button>
                        {menuOpen === deck.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                            <div className="absolute right-0 top-8 z-20 w-44 bg-white dark:bg-slate-700 
                              rounded-xl shadow-xl border border-slate-100 dark:border-slate-600 
                              overflow-hidden py-1">
                              <button
                                onClick={() => openEdit(deck.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 
                                  dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
                              >
                                <Edit3 size={14} /> {t('editDeck')}
                              </button>
                              <button
                                onClick={() => { exportDeck(deck.id); setMenuOpen(null); }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 
                                  dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
                              >
                                <Download size={14} /> {t('exportDeck')}
                              </button>
                              <button
                                onClick={() => { setShowDeleteConfirm(deck.id); setMenuOpen(null); }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 
                                  hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 size={14} /> {t('deleteDeck')}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Stats badges */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                        {t('cardsCount', { count: stats.total })}
                      </span>
                      {stats.due > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                          {t('dueCards', { count: stats.due })}
                        </span>
                      )}
                      {stats.mastered > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                          ✓ {stats.mastered}
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => startStudy(deck.id)}
                        disabled={deck.cards.length === 0}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 
                          bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 
                          rounded-lg text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/40 
                          transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <BookOpen size={14} /> {t('studyNow')}
                      </button>
                      <button
                        onClick={() => openDeck(deck.id)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 
                          bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 
                          rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 
                          transition-colors"
                      >
                        <Edit3 size={14} /> {t('manageCards')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Deck Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={editingDeck ? t('editDeck') : t('createDeck')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t('deckName')}
            </label>
            <input
              type="text"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              placeholder="e.g. Spanish Vocabulary"
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 
                dark:border-slate-600 rounded-xl text-slate-800 dark:text-white 
                focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t('deckDescription')}
            </label>
            <input
              type="text"
              value={deckDesc}
              onChange={(e) => setDeckDesc(e.target.value)}
              placeholder="Optional description"
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 
                dark:border-slate-600 rounded-xl text-slate-800 dark:text-white 
                focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              {t('deckColor')}
            </label>
            <div className="flex gap-2 flex-wrap">
              {DECK_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setDeckColor(color)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    deckColor === color ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-800 scale-110' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setShowCreateModal(false)}
              className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 
                rounded-xl text-slate-600 dark:text-slate-300 font-medium 
                hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={!deckName.trim()}
              className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white 
                rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('save')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title={t('deleteDeck')}
        size="sm"
      >
        <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
          {t('deleteDeckConfirm')}
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
            onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
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
