// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
 apiKey: "AIzaSyBlnXWFFmep3B4B7rpdzSOn_rJumhoMVHI",
  authDomain: "cargpt-4366c.firebaseapp.com",
  projectId: "cargpt-4366c",
  storageBucket: "cargpt-4366c.firebasestorage.app",
  messagingSenderId: "431860020742",
  appId: "1:431860020742:web:676e2461ff4de4d8173587",
  measurementId: "G-R21W0MRCMT"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/assets/AICarAdvisor.png'
  };

  // Send the notification to all open clients so they can update their UI
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_NOTIFICATION',
        notification: {
          title: payload.notification.title,
          body: payload.notification.body,
          read: false,
        },
      });
    });
  });

  self.registration.showNotification(notificationTitle, notificationOptions);
});
