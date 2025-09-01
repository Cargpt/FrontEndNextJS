// lib/firebase.ts

import { initializeApp,getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

import {
  getMessaging,
  onMessage,
  getToken,
  isSupported,
  Messaging,
  MessagePayload,
} from 'firebase/messaging';

import { DBSchema } from 'idb';

interface MessageDB extends DBSchema {
  messages: {
    key: number;
    value: MessagePayload;
    indexes: { 'by-date': number };
  };
}

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA3otIa1Cil3YybV-X22Ea-UQSYwwxf-kM",
  authDomain: "aicaradvisor-fbcfa.firebaseapp.com",
  projectId: "aicaradvisor-fbcfa",
  storageBucket: "aicaradvisor-fbcfa.firebasestorage.app",
  messagingSenderId: "770291167384",
  appId: "1:770291167384:android:2d32bc15622333625c60ed",
};

// Initialize default app only if it doesn't exist
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firebase app
export let messaging: Messaging | null = null;

isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  } else {
    console.warn('FCM not supported in this browser.');
  }
});

export async function requestFirebaseToken(vapidKey: string): Promise<string | null> {
  if (!messaging) return null;
  try {
    return await getToken(messaging, { vapidKey });
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

export function listenForMessages(): void {
  if (!messaging) return;

  onMessage(messaging, async (payload) => {

    // Defer import and saving to client-side only
    const { saveMessage } = await import('./fcm-storage');
    await saveMessage(payload);
    console.log('Foreground message received:', payload);

    window.dispatchEvent(new Event('new-fcm-message'));
  });
}

export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log("User Info:", user);
    return user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    return null;
  }
};



export default app;
