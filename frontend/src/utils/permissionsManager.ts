"use client"
import { Capacitor } from '@capacitor/core';

export interface PermissionStatus {
  location: 'granted' | 'denied' | 'prompt' | 'unavailable';
  notifications: 'granted' | 'denied' | 'prompt' | 'unavailable';
}

export interface PermissionRequest {
  location?: boolean;
  notifications?: boolean;
}

export class PermissionsManager {
  private static instance: PermissionsManager;

  private constructor() {}

  public static getInstance(): PermissionsManager {
    if (!PermissionsManager.instance) {
      PermissionsManager.instance = new PermissionsManager();
    }
    return PermissionsManager.instance;
  }



  /**
   * Request location permission
   */
  public async requestLocationPermission(): Promise<'granted' | 'denied' | 'unavailable'> {
    try {
      if (!Capacitor.isNativePlatform()) {
        // Web platform - use Geolocation API
        if (!navigator.geolocation) {
          console.log('Geolocation not available on this device');
          return 'unavailable';
        }

        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => {
              console.log('Location permission granted');
              resolve('granted');
            },
            (error) => {
              console.log('Location permission denied:', error.message);
              resolve('denied');
            },
            { timeout: 10000, enableHighAccuracy: false }
          );
        });
      } else {
        // Native platform - use Capacitor Geolocation plugin
        try {
          const { Geolocation } = await import('@capacitor/geolocation');
          const permission = await Geolocation.requestPermissions();
          
          if (permission.location === 'granted') {
            console.log('Location permission granted on native platform');
            return 'granted';
          } else {
            console.log('Location permission denied on native platform');
            return 'denied';
          }
        } catch (error) {
          console.error('Geolocation plugin not available:', error);
          return 'unavailable';
        }
      }
    } catch (error) {
      console.error('Location permission request failed:', error);
      return 'denied';
    }
  }

  /**
   * Request notifications permission
   */
  public async requestNotificationsPermission(): Promise<'granted' | 'denied' | 'unavailable'> {
    try {
      if (!Capacitor.isNativePlatform()) {
        // Web platform - use Notifications API
        if (!('Notification' in window)) {
          console.log('Notifications not available on this device');
          return 'unavailable';
        }

        if (Notification.permission === 'granted') {
          console.log('Notifications already granted');
          return 'granted';
        }

        if (Notification.permission === 'denied') {
          console.log('Notifications previously denied');
          return 'denied';
        }

        const permission = await Notification.requestPermission();
        console.log('Notification permission result:', permission);
        return permission as 'granted' | 'denied';
      } else {
        // Native platform - use Capacitor Push Notifications plugin
        try {
          const { PushNotifications } = await import('@capacitor/push-notifications');
          const permission = await PushNotifications.requestPermissions();
          
          if (permission.receive === 'granted') {
            console.log('Push notifications permission granted on native platform');
            return 'granted';
          } else {
            console.log('Push notifications permission denied on native platform');
            return 'denied';
          }
        } catch (error) {
          console.error('Push notifications plugin not available:', error);
          return 'unavailable';
        }
      }
    } catch (error) {
      console.error('Notifications permission request failed:', error);
      return 'denied';
    }
  }



  /**
   * Request multiple permissions at once
   */
  public async requestPermissions(permissions: PermissionRequest): Promise<PermissionStatus> {
    const result: PermissionStatus = {
      location: 'unavailable',
      notifications: 'unavailable'
    };

    if (permissions.location) {
      result.location = await this.requestLocationPermission();
    }

    if (permissions.notifications) {
      result.notifications = await this.requestNotificationsPermission();
    }

    return result;
  }

  /**
   * Check current permission status
   */
  public async checkPermissionStatus(): Promise<PermissionStatus> {
    const status: PermissionStatus = {
      location: 'unavailable',
      notifications: 'unavailable'
    };

    // Check location permission
    try {
      if (!Capacitor.isNativePlatform()) {
        if (navigator.geolocation) {
          status.location = 'prompt';
        }
      } else {
        try {
          const { Geolocation } = await import('@capacitor/geolocation');
          const permission = await Geolocation.checkPermissions();
          status.location = permission.location as 'granted' | 'denied' | 'prompt';
        } catch {
          status.location = 'unavailable';
        }
      }
    } catch {
      status.location = 'unavailable';
    }

    // Check notifications permission
    try {
      if (!Capacitor.isNativePlatform()) {
        if ('Notification' in window) {
          status.notifications = Notification.permission as 'granted' | 'denied' | 'prompt';
        }
      } else {
        try {
          const { PushNotifications } = await import('@capacitor/push-notifications');
          const permission = await PushNotifications.checkPermissions();
          status.notifications = permission.receive as 'granted' | 'denied' | 'prompt';
        } catch {
          status.notifications = 'unavailable';
        }
      }
    } catch {
      status.notifications = 'unavailable';
    }

    return status;
  }

  /**
   * Get permission status text for display
   */
  public getPermissionStatusText(status: 'granted' | 'denied' | 'prompt' | 'unavailable'): string {
    switch (status) {
      case 'granted':
        return '✅ Granted';
      case 'denied':
        return '❌ Denied';
      case 'prompt':
        return '⏳ Not Requested';
      case 'unavailable':
        return '🚫 Unavailable';
      default:
        return '❓ Unknown';
    }
  }
}

// Export singleton instance
export const permissionsManager = PermissionsManager.getInstance();
