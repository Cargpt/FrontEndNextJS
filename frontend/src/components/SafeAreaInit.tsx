'use client';

import { useEffect } from 'react';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';

export default function SafeAreaInit() {
  useEffect(() => {
    // Add class to <html> if running in Capacitor native app
    if(Capacitor.isNativePlatform()){
      
    // Overlay content under the system status bar (IMPORTANT)
    StatusBar.setOverlaysWebView({ overlay: true }).catch(console.error);
    }
    // Check if on a native platform before calling
    if (typeof window !== 'undefined') {
      SplashScreen.hide();
    }
  }, []);

  return null;
}
