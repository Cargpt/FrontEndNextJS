import { Capacitor } from '@capacitor/core';

export class StatusBarManager {
  private static instance: StatusBarManager;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): StatusBarManager {
    if (!StatusBarManager.instance) {
      StatusBarManager.instance = new StatusBarManager();
    }
    return StatusBarManager.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    try {
      if (Capacitor.isNativePlatform()) {
        const { StatusBar } = await import('@capacitor/status-bar');
        await StatusBar.setOverlaysWebView({ overlay: false });
        this.isInitialized = true;
      }
    } catch (error) {
      console.warn('StatusBar initialization failed:', error);
    }
  }

  public async setTheme(theme: 'light' | 'dark'): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const { StatusBar, Style } = await import('@capacitor/status-bar');

      if (theme === 'dark') {
        // Dark theme → dark background + white icons
        await StatusBar.setBackgroundColor({ color: '#121212' });
        await StatusBar.setStyle({ style: Style.Light });
      } else {
        // Light theme → white background + dark icons
        await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
        await StatusBar.setStyle({ style: Style.Dark });
      }
    } catch (error) {
      console.warn('StatusBar theme change failed:', error);
    }
  }

  public async setCustomColors(backgroundColor: string, iconStyle: 'light' | 'dark'): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const { StatusBar, Style } = await import('@capacitor/status-bar');
      await StatusBar.setBackgroundColor({ color: backgroundColor });
      await StatusBar.setStyle({ style: iconStyle === 'light' ? Style.Light : Style.Dark });
    } catch (error) {
      console.warn('StatusBar custom color change failed:', error);
    }
  }

  public async hide(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const { StatusBar } = await import('@capacitor/status-bar');
      await StatusBar.hide();
    } catch (error) {
      console.warn('StatusBar hide failed:', error);
    }
  }

  public async show(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const { StatusBar } = await import('@capacitor/status-bar');
      await StatusBar.show();
    } catch (error) {
      console.warn('StatusBar show failed:', error);
    }
  }
}

export const statusBarManager = StatusBarManager.getInstance();
