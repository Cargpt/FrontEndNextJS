"use client"
import { Capacitor } from '@capacitor/core';

export interface PermissionStatus {
  camera: 'granted' | 'denied' | 'prompt' | 'unavailable';
  location: 'granted' | 'denied' | 'prompt' | 'unavailable';
  notifications: 'granted' | 'denied' | 'prompt' | 'unavailable';
}

export interface PermissionRequest {
  camera?: boolean;
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
   * Request camera permission
   */
  public async requestCameraPermission(): Promise<'granted' | 'denied' | 'unavailable'> {
    try {
      if (!Capacitor.isNativePlatform()) {
        // Web platform - use MediaDevices API
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia({ video: true })) {
          console.log('Camera not available on this device');
          return 'unavailable';
        }

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
        
        console.log('Camera permission granted');
        return 'granted';
      } else {
        // Native platform - use Capacitor Camera plugin
        try {
          const { Camera } = await import('@capacitor/camera');
          const permission = await Camera.requestPermissions();
          
          if (permission.camera === 'granted') {
            console.log('Camera permission granted on native platform');
            return 'granted';
          } else {
            console.log('Camera permission denied on native platform');
            return 'denied';
          }
        } catch (error) {
          console.error('Camera plugin not available:', error);
          return 'unavailable';
        }
      }
    } catch (error) {
      console.error('Camera permission request failed:', error);
      return 'denied';
    }
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
      camera: 'unavailable',
      location: 'unavailable',
      notifications: 'unavailable'
    };

    if (permissions.camera) {
      result.camera = await this.requestCameraPermission();
    }

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
      camera: 'unavailable',
      location: 'unavailable',
      notifications: 'unavailable'
    };

    // Check camera permission
    try {
      if (!Capacitor.isNativePlatform()) {
        if (navigator.mediaDevices) {
          status.camera = 'prompt';
        }
      } else {
        try {
          const { Camera } = await import('@capacitor/camera');
          const permission = await Camera.checkPermissions();
          status.camera = permission.camera as 'granted' | 'denied' | 'prompt';
        } catch {
          status.camera = 'unavailable';
        }
      }
    } catch {
      status.camera = 'unavailable';
    }

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
