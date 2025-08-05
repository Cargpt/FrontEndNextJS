// lib/firebase.ts

import { initializeApp } from "firebase/app";
import {
  getMessaging,
  isSupported,
  getToken as getFCMToken,
  onMessage as onFCMMessage,
} from "firebase/messaging";

// Firebase config from your env
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// Initialize Firebase app once
const firebaseApp = initializeApp(firebaseConfig);

// Safe messaging getter
export const getMessagingIfSupported = async () => {
  if (typeof window !== "undefined" && (await isSupported())) {
    return getMessaging(firebaseApp);
  }
  return null;
};

export { getFCMToken, onFCMMessage };
