'use client';

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';
import {
  createTheme,
  ThemeProvider,
  CssBaseline,
  PaletteMode,
} from '@mui/material';
import { useCookies } from 'react-cookie';
import { grey } from '@mui/material/colors';
import { statusBarManager } from '@/utils/statusBarManager';

interface ColorModeContextType {
  toggleColorMode: () => void;
  mode: PaletteMode;
}

const ColorModeContext = createContext<ColorModeContextType>({
  toggleColorMode: () => {},
  mode: 'light',
});

export const useColorMode = () => useContext(ColorModeContext);

export const ColorModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cookies, setCookie] = useCookies(['color-mode']);

  // Initialize with light mode
  const [mode, setMode] = useState<PaletteMode>('light');

  // First render effect - set initial theme based on device
  useEffect(() => {
    const setInitialTheme = async () => {
      // Initialize status bar manager
      await statusBarManager.initialize();
      
      // Clear any existing theme preference
      setCookie('color-mode', '', { path: '/', expires: new Date(0) });
      
      // Check if mobile device
      const isMobile = typeof window !== 'undefined' && 
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      // Force the appropriate mode
      const newMode = isMobile ? 'dark' : 'light';
      setMode(newMode);
      
      // Save the new mode
      setCookie('color-mode', newMode, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      // Force apply the theme
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-mui-color-scheme', newMode);
      }

      // Apply status bar theme
      await statusBarManager.setTheme(newMode);
    };

    setInitialTheme();
  }, []);

  useEffect(() => {
    setCookie('color-mode', mode, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }, [mode, setCookie]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-mui-color-scheme', mode);
    }

    // Apply status bar theme changes
    const applyStatusBarTheme = async () => {
      await statusBarManager.setTheme(mode);
    };

    applyStatusBarTheme();
  }, [mode]);

  // ✅ Custom theme
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        
        },
        
      }),
    [mode]
  );
const toggleColorMode = () => {
  setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
};

  return (
    <ColorModeContext.Provider value={{ toggleColorMode, mode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
