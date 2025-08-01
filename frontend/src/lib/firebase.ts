// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBlnXWFFmep3B4B7rpdzSOn_rJumhoMVHI",
  authDomain: "cargpt-4366c.firebaseapp.com",
  projectId: "cargpt-4366c",
  storageBucket: "cargpt-4366c.firebasestorage.app",
  messagingSenderId: "431860020742",
  appId: "1:431860020742:web:676e2461ff4de4d8173587",
  measurementId: "G-R21W0MRCMT"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
