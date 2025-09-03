import { Capacitor } from '@capacitor/core';

export interface StatusBarConfig {
  backgroundColor: string;
  iconColor: 'light' | 'dark';
  style: 'light' | 'dark';
  overlay: boolean;
}

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
        await StatusBar.setOverlaysWebView({ overlay: true });
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
        // Dark mode: Blue-tinted icons
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#1a1a2e' }); // Dark blue-tinted background
        await StatusBar.setOverlaysWebView({ overlay: true });
        
        // For Android, set a darker blue background that will make icons appear blue
        if (Capacitor.getPlatform() === 'android') {
          await StatusBar.setBackgroundColor({ color: '#0f1419' }); // Very dark blue
        }
      } else {
        // Light mode: Red-tinted icons
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: '#fff5f5' }); // Light red-tinted background
        await StatusBar.setOverlaysWebView({ overlay: true });
        
        // For Android, set a light red background that will make icons appear red
        if (Capacitor.getPlatform() === 'android') {
          await StatusBar.setBackgroundColor({ color: '#fef2f2' }); // Very light red
        }
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
      await StatusBar.setOverlaysWebView({ overlay: true });
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

// Export singleton instance
export const statusBarManager = StatusBarManager.getInstance();
