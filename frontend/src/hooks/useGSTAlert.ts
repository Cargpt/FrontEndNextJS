"use client";
import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const GST_ALERT_DISMISSED_KEY = 'gst-alert-dismissed';
const GST_ALERT_VERSION_KEY = 'gst-alert-version';
const GST_ALERT_LAST_CLOSED_KEY = 'gst-alert-last-closed';
const CURRENT_GST_VERSION = '1.0'; // Increment this when you want to show the alert again
const ALERT_COOLDOWN_HOURS = 24; // Show again after 24 hours
// For testing: uncomment the line below and comment the line above
// const ALERT_COOLDOWN_HOURS = 1/60; // Show again after 1 minute (for testing)

export const useGSTAlert = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    const checkAlertStatus = async () => {
      try {
        let dismissedVersion: string | null = null;
        let lastClosedTime: string | null = null;
        
        if (isNative) {
          // For native platforms, use Capacitor Preferences
          const dismissedResult = await Preferences.get({ key: GST_ALERT_DISMISSED_KEY });
          const versionResult = await Preferences.get({ key: GST_ALERT_VERSION_KEY });
          const lastClosedResult = await Preferences.get({ key: GST_ALERT_LAST_CLOSED_KEY });
          dismissedVersion = versionResult.value;
          lastClosedTime = lastClosedResult.value;
        } else {
          // For web, use localStorage
          dismissedVersion = localStorage.getItem(GST_ALERT_VERSION_KEY);
          lastClosedTime = localStorage.getItem(GST_ALERT_LAST_CLOSED_KEY);
        }

        // Check if user is new (no dismissed version)
        const isNewUser = !dismissedVersion;
        
        // Check if 24 hours have passed since last close
        let canShowAfterCooldown = false;
        if (lastClosedTime) {
          const lastClosed = new Date(lastClosedTime);
          const now = new Date();
          const hoursSinceLastClose = (now.getTime() - lastClosed.getTime()) / (1000 * 60 * 60);
          canShowAfterCooldown = hoursSinceLastClose >= ALERT_COOLDOWN_HOURS;
        }

        // Show alert if:
        // 1. User is new (never seen the alert), OR
        // 2. User dismissed an older version, OR
        // 3. 24 hours have passed since last close
        const shouldShow = isNewUser || 
                          (dismissedVersion && dismissedVersion !== CURRENT_GST_VERSION) ||
                          canShowAfterCooldown;
        
        setShowAlert(shouldShow);
      } catch (error) {
        console.error('Error checking GST alert status:', error);
        // Default to showing the alert if there's an error
        setShowAlert(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkAlertStatus();
  }, [isNative]);

  const dismissAlert = async () => {
    try {
      if (isNative) {
        // For native platforms, use Capacitor Preferences
        await Preferences.set({ key: GST_ALERT_DISMISSED_KEY, value: 'true' });
        await Preferences.set({ key: GST_ALERT_VERSION_KEY, value: CURRENT_GST_VERSION });
      } else {
        // For web, use localStorage
        localStorage.setItem(GST_ALERT_DISMISSED_KEY, 'true');
        localStorage.setItem(GST_ALERT_VERSION_KEY, CURRENT_GST_VERSION);
      }
      
      setShowAlert(false);
    } catch (error) {
      console.error('Error dismissing GST alert:', error);
    }
  };

  const closeAlert = async () => {
    try {
      // Record the timestamp when user closes the alert
      const now = new Date().toISOString();
      
      if (isNative) {
        // For native platforms, use Capacitor Preferences
        await Preferences.set({ key: GST_ALERT_LAST_CLOSED_KEY, value: now });
        // Also mark that this version has been seen
        await Preferences.set({ key: GST_ALERT_VERSION_KEY, value: CURRENT_GST_VERSION });
      } else {
        // For web, use localStorage
        localStorage.setItem(GST_ALERT_LAST_CLOSED_KEY, now);
        // Also mark that this version has been seen
        localStorage.setItem(GST_ALERT_VERSION_KEY, CURRENT_GST_VERSION);
      }
      
      setShowAlert(false);
    } catch (error) {
      console.error('Error recording close time:', error);
      setShowAlert(false);
    }
  };

  const resetAlert = async () => {
    try {
      if (isNative) {
        // For native platforms, use Capacitor Preferences
        await Preferences.remove({ key: GST_ALERT_DISMISSED_KEY });
        await Preferences.remove({ key: GST_ALERT_VERSION_KEY });
        await Preferences.remove({ key: GST_ALERT_LAST_CLOSED_KEY });
      } else {
        // For web, use localStorage
        localStorage.removeItem(GST_ALERT_DISMISSED_KEY);
        localStorage.removeItem(GST_ALERT_VERSION_KEY);
        localStorage.removeItem(GST_ALERT_LAST_CLOSED_KEY);
      }
      
      setShowAlert(true);
    } catch (error) {
      console.error('Error resetting GST alert:', error);
    }
  };

  return {
    showAlert,
    isLoading,
    dismissAlert,
    closeAlert,
    resetAlert,
  };
};
