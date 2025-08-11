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

    const applyStatusBar = async () => {
      try {
        console.log('Applying status bar with mode:', mode);

        if (!isStatusBarAvailable) return;

        const currentPlatform = Capacitor.getPlatform();

        if (currentPlatform === 'android') {
          await StatusBar.setOverlaysWebView({ overlay: false });

          setTimeout(async () => {
            try {
              if (mode === 'dark') {
                await StatusBar.setBackgroundColor({ color: '#000000' });
                await StatusBar.setStyle({ style: Style.Light }); // light icons on dark background
              } else {
                await StatusBar.setBackgroundColor({ color: '#ffffff' });
                await StatusBar.setStyle({ style: Style.Dark }); // dark icons on light background
              }

              // Debug: log current status bar state
              if ((StatusBar as any).getInfo) {
                const info = await (StatusBar as any).getInfo();
                console.log('StatusBar info after apply:', mode, JSON.stringify(info));
              }
            } catch (e) {
              console.error('Error applying Android StatusBar:', e);
            }
          }, 100);
        } else if (currentPlatform === 'ios') {
          await StatusBar.setOverlaysWebView({ overlay: true });
          if (mode === 'dark') {
            await StatusBar.setStyle({ style: Style.Light });
          } else {
            await StatusBar.setStyle({ style: Style.Dark });
          }
        }
      } catch (e) {
        console.error('applyStatusBar failed:', e);
      }
    };

    // Apply on mount and retry for better reliability
    applyStatusBar();
    const retry1 = setTimeout(() => {
      console.log('Retry 500ms with mode:', mode);
      applyStatusBar();
    }, 500);
    const retry2 = setTimeout(() => {
      console.log('Retry 1500ms with mode:', mode);
      applyStatusBar();
    }, 1500);
    const retry3 = setTimeout(() => {
      console.log('Retry 3000ms with mode:', mode);
      applyStatusBar();
    }, 3000);

    // Reapply status bar on app resume
    const resumeListener = App.addListener('appStateChange', (state) => {
      if (state.isActive) {
        console.log('App resumed, reapplying status bar');
        applyStatusBar();
      }
    });

    // Hide splash
    if (typeof window !== 'undefined') SplashScreen.hide();

    return () => {
      clearTimeout(retry1);
      clearTimeout(retry2);
      clearTimeout(retry3);
      resumeListener.then((l) => l.remove()).catch(() => undefined);
    };
  }, [mode]);

  return null;
}
