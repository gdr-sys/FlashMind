/**
 * Bottom navigation bar — mobile-first tab navigation.
 */
import { Home, BookOpen, BarChart3, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { AppView } from '../types';

const navItems: { view: AppView; icon: typeof Home; labelKey: 'home' | 'study' | 'stats' | 'settings' }[] = [
  { view: 'home', icon: Home, labelKey: 'home' },
  { view: 'study', icon: BookOpen, labelKey: 'study' },
  { view: 'stats', icon: BarChart3, labelKey: 'stats' },
  { view: 'settings', icon: Settings, labelKey: 'settings' },
];

export default function BottomNav() {
  const { currentView, setCurrentView, setSelectedDeckId, t } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 
      bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl 
      border-t border-slate-200 dark:border-slate-700/50
      safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-1">
        {navItems.map(({ view, icon: Icon, labelKey }) => {
          const isActive = currentView === view || 
            (view === 'home' && currentView === 'editor');
          
          return (
            <button
              key={view}
              onClick={() => {
                setCurrentView(view);
                if (view === 'home') setSelectedDeckId(null);
              }}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200
                ${isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{t(labelKey)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
