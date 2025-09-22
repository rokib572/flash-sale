import React from 'react';

type Theme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

export const ThemeStateProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [theme, setTheme] = React.useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem('theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeState = () => {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeState must be used within ThemeStateProvider');
  return ctx;
};

