import React, { createContext, useState, useEffect, useContext } from 'react';
import { optionsUseCases } from '@/domain/usecases/optionsUseCases';
import type { OptionsDto } from '@/domain/models/options';

interface ThemeContextValue {
  theme: 'Light' | 'Dark' | null;
  options: OptionsDto | null;
  refreshOptions: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [options, setOptions] = useState<OptionsDto | null>(null);

  const refreshOptions = async () => {
    try {
      const opts = await optionsUseCases.getOptions();
      setOptions(opts);
    } catch (error) {
      console.error('Failed to load options', error);
    }
  };

  useEffect(() => {
    refreshOptions();
  }, []);

  // Apply theme to document
  useEffect(() => {
    const theme = options?.webTheme;
    if (theme === 'Dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [options?.webTheme]);

  const theme = options?.webTheme === 'Dark' ? 'Dark' : 'Light';

  return (
    <ThemeContext.Provider value={{ theme, options, refreshOptions }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};