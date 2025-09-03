import { useEffect } from 'react';
import { useColorMode } from '@/Context/ColorModeContext';
import { statusBarManager } from '@/utils/statusBarManager';

export const useStatusBar = () => {
  const { mode } = useColorMode();

  useEffect(() => {
    // Apply status bar theme when color mode changes
    const applyStatusBarTheme = async () => {
      await statusBarManager.setTheme(mode);
    };

    applyStatusBarTheme();
  }, [mode]);

  // Return functions for manual status bar control
  return {
    setTheme: statusBarManager.setTheme,
    setCustomColors: statusBarManager.setCustomColors,
    hide: statusBarManager.hide,
    show: statusBarManager.show,
    currentTheme: mode,
  };
};
