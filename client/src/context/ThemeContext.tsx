import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'cj_theme';

function resolveInitial(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  // No saved choice: light is the original site, so default to it unless the
  // user's OS explicitly prefers dark.
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function apply(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(resolveInitial);

  useEffect(() => {
    apply(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // Follow the OS only while the user hasn't made an explicit choice this session.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem(STORAGE_KEY)) setThemeState(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggle = useCallback(() => setThemeState((t) => (t === 'dark' ? 'light' : 'dark')), []);

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
