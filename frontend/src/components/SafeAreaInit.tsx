'use client';

import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';
import { useColorMode } from '@/Context/ColorModeContext';

export default function SafeAreaInit() {
  const { mode } = useColorMode();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      if (typeof window !== 'undefined') SplashScreen.hide();
      return;
    }

    const platform = Capacitor.getPlatform();

    // Add classes for platform-specific styling if needed
    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      html.classList.add('in-capacitor-app');
      html.classList.add(`platform-${platform}`);
      html.setAttribute('data-platform', platform);
    }

    const isStatusBarAvailable = Capacitor.isPluginAvailable('StatusBar');
    if (!isStatusBarAvailable) {
      console.warn('Capacitor StatusBar plugin not available. Did you run `npx cap sync`?');
    }


    // Apply on mount and retry for better reliability
   
    // Reapply status bar on app resume

    // Hide splash
    if (typeof window !== 'undefined') SplashScreen.hide();

    return () => {
     ;
     
    };
  }, []);

  return null;
}
