/**
 * SettingsView — Theme, language, account, data management, and about.
 */
import { useState } from 'react';
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  Globe,
  Trash2,
  Info,
  Download,
  Upload,
  ChevronRight,
  LogOut,
  User,
  Cloud,
  CloudOff,
  Loader2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from './Modal';
import type { ThemeMode, Language } from '../types';

const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
];

const themes: { mode: ThemeMode; icon: typeof Sun; labelKey: 'lightMode' | 'darkMode' | 'systemMode' }[] = [
  { mode: 'light', icon: Sun, labelKey: 'lightMode' },
  { mode: 'dark', icon: Moon, labelKey: 'darkMode' },
  { mode: 'system', icon: Monitor, labelKey: 'systemMode' },
];

export default function SettingsView() {
  const {
    themeMode, setThemeMode,
    language, setLanguage,
    resetAllData, exportAllDecks,
    t, decks,
    user, logout,
    isAuthenticated,
    hasPendingLocalData,
    migrateLocalData,
  } = useApp();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [migrating, setMigrating] = useState(false);

  const currentLang = languages.find((l) => l.code === language);

  const handleMigrate = async () => {
    setMigrating(true);
    try {
      await migrateLocalData();
    } finally {
      setMigrating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowLogoutConfirm(false);
  };

  return (
    <div className="pb-24 px-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-700 rounded-xl flex items-center justify-center">
            <Settings size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            {t('settings')}
          </h1>
        </div>
      </div>

      {/* Account Section */}
      {isAuthenticated && user && (
        <Section title={t('account')}>
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-4 mb-3">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt=""
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                  <User size={24} className="text-indigo-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 dark:text-white truncate">
                  {user.displayName || 'User'}
                </p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Cloud size={12} className="text-emerald-500" />
                  <span className="text-[10px] text-emerald-500 font-medium">
                    {t('syncedToCloud')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Migrate local data button */}
          {hasPendingLocalData && (
            <button
              onClick={handleMigrate}
              disabled={migrating}
              className="w-full flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 
                border border-amber-200 dark:border-amber-800 rounded-xl mb-3
                hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
            >
              {migrating ? (
                <Loader2 size={18} className="text-amber-500 animate-spin" />
              ) : (
                <CloudOff size={18} className="text-amber-500" />
              )}
              <div className="flex-1 text-left">
                <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  {migrating ? t('migrating') : t('migrateData')}
                </span>
                {!migrating && (
                  <p className="text-xs text-amber-600/70 dark:text-amber-500/70">
                    {t('migrateDataDesc')}
                  </p>
                )}
              </div>
            </button>
          )}

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 
              border border-slate-100 dark:border-slate-700 rounded-xl 
              hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <LogOut size={18} className="text-red-500" />
            <span className="text-sm text-red-600 dark:text-red-400">{t('signOut')}</span>
          </button>
        </Section>
      )}

      {/* Theme */}
      <Section title={t('theme')}>
        <div className="grid grid-cols-3 gap-2">
          {themes.map(({ mode, icon: Icon, labelKey }) => (
            <button
              key={mode}
              onClick={() => setThemeMode(mode)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all
                ${themeMode === mode
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600'
                }`}
            >
              <Icon
                size={20}
                className={themeMode === mode
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-400'
                }
              />
              <span className={`text-xs font-medium ${
                themeMode === mode
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}>
                {t(labelKey)}
              </span>
            </button>
          ))}
        </div>
      </Section>

      {/* Language */}
      <Section title={t('language')}>
        <button
          onClick={() => setShowLangPicker(true)}
          className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 
            border border-slate-100 dark:border-slate-700 rounded-xl 
            hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <Globe size={18} className="text-slate-400" />
          <span className="flex-1 text-left text-sm text-slate-800 dark:text-white">
            {currentLang?.flag} {currentLang?.label}
          </span>
          <ChevronRight size={16} className="text-slate-300" />
        </button>
      </Section>

      {/* Data Management */}
      <Section title="Data">
        <div className="space-y-2">
          {decks.length > 0 && (
            <button
              onClick={exportAllDecks}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 
                border border-slate-100 dark:border-slate-700 rounded-xl 
                hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Download size={18} className="text-blue-500" />
              <span className="flex-1 text-left text-sm text-slate-800 dark:text-white">
                {t('exportDeck')} ({decks.length} decks)
              </span>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
          )}

          <ImportButton t={t} />

          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 
              border border-red-100 dark:border-red-900/30 rounded-xl 
              hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <Trash2 size={18} className="text-red-500" />
            <span className="flex-1 text-left text-sm text-red-600 dark:text-red-400">
              {t('resetData')}
            </span>
          </button>
        </div>
      </Section>

      {/* About */}
      <Section title={t('about')}>
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Info size={20} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-white">FlashMind</p>
              <p className="text-xs text-slate-400">{t('version')} 1.1.0</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
            A modern flashcard app with spaced repetition and cloud sync. 
            Built with React, Tailwind CSS, Firebase, and ❤️.
          </p>
        </div>
      </Section>

      {/* Language Picker Modal */}
      <Modal
        isOpen={showLangPicker}
        onClose={() => setShowLangPicker(false)}
        title={t('language')}
        size="sm"
      >
        <div className="space-y-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setShowLangPicker(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                ${language === lang.code
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <span className="text-sm font-medium">{lang.label}</span>
              {language === lang.code && (
                <span className="ml-auto text-indigo-500">✓</span>
              )}
            </button>
          ))}
        </div>
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title={t('resetData')}
        size="sm"
      >
        <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
          {t('resetConfirm')}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setShowResetConfirm(false)}
            className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 
              rounded-xl text-slate-600 dark:text-slate-300 font-medium 
              hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={() => {
              resetAllData();
              setShowResetConfirm(false);
            }}
            className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white 
              rounded-xl font-medium transition-colors"
          >
            {t('delete')}
          </button>
        </div>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title={t('signOut')}
        size="sm"
      >
        <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
          Are you sure you want to sign out?
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setShowLogoutConfirm(false)}
            className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 
              rounded-xl text-slate-600 dark:text-slate-300 font-medium 
              hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white 
              rounded-xl font-medium transition-colors"
          >
            {t('signOut')}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}

function ImportButton({ t }: { t: (key: import('../i18n/translations').TranslationKey) => string }) {
  const { importDecks } = useApp();
  
  return (
    <label className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 
      border border-slate-100 dark:border-slate-700 rounded-xl 
      hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
      <Upload size={18} className="text-emerald-500" />
      <span className="flex-1 text-left text-sm text-slate-800 dark:text-white">
        {t('importDeck')}
      </span>
      <input
        type="file"
        accept=".json"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            await importDecks(file);
            e.target.value = '';
          }
        }}
      />
      <ChevronRight size={16} className="text-slate-300" />
    </label>
  );
}
