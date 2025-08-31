importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyA3otIa1Cil3YybV-X22Ea-UQSYwwxf-kM",
  authDomain: "aicaradvisor-fbcfa.firebaseapp.com",
  projectId: "aicaradvisor-fbcfa",
  storageBucket: "aicaradvisor-fbcfa.firebasestorage.app",
  messagingSenderId: "770291167384",
  appId: "1:770291167384:android:2d32bc15622333625c60ed",
};
firebase.initializeApp(firebaseConfig);


const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'Background Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/logo.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
