'use client';

import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export function useAndroidBackClose(enabled: boolean, onClose: () => void) {
  useEffect(() => {
    if (!enabled) return;
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') return;

    const sub = App.addListener('backButton', () => {
      try {
        onClose();
      } catch {
        // ignore
      }
    });

    return () => {
      sub.then((listener) => listener.remove()).catch(() => undefined);
    };
  }, [enabled, onClose]);
}


