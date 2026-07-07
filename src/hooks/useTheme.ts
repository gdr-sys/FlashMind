/**
 * Custom hook for theme management (light/dark/system).
 * Applies the correct class to <html> and listens to system preference changes.
 */
import { useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { ThemeMode } from '../types';

export function useTheme() {
  const [themeMode, setThemeMode] = useLocalStorage<ThemeMode>('flashmind-theme', 'system');

  const applyTheme = useCallback((mode: ThemeMode) => {
    const root = document.documentElement;
    
    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', mode === 'dark');
    }
  }, []);

  // Apply theme on mount and when it changes
  useEffect(() => {
    applyTheme(themeMode);
  }, [themeMode, applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (themeMode === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode, applyTheme]);

  return { themeMode, setThemeMode };
}
