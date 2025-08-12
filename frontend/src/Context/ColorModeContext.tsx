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

  const [mode, setMode] = useState<PaletteMode>(
    (cookies['color-mode'] as PaletteMode) || 'light'
  );

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

    const applyStatusBar = async () => {
      if (typeof window === 'undefined') return;

      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');

        if (mode === 'dark') {
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#000000' });
        } else {
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#ffffff' });
        }
      } catch (error) {
        console.warn('Capacitor StatusBar error:', error);
      }
    };

    applyStatusBar();
  }, [mode]);

  const toggleColorMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={{ toggleColorMode, mode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
