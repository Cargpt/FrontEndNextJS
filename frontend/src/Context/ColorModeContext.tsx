// ColorModeContext.tsx
import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { createTheme, ThemeProvider, CssBaseline, PaletteMode } from '@mui/material';
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

export const ColorModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cookies, setCookie] = useCookies(['color-mode']);

  // Initialize with cookie or fallback to 'light'
  const [mode, setMode] = useState<PaletteMode>(
    (cookies['color-mode'] as PaletteMode) || 'light'
  );

  useEffect(() => {
    // Save to cookie whenever mode changes
    setCookie('color-mode', mode, { path: '/', maxAge: 60 * 60 * 24 * 30 }); // 30 days
  }, [mode, setCookie]);

  useEffect(() => {
    // Set data attribute on document for CSS targeting
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-mui-color-scheme', mode);
    }
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
