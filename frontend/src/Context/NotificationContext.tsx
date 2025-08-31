"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Web FCM imports
// import { messaging, getToken, onMessage } from "@/lib/firebase";

// Capacitor imports
import { Capacitor } from "@capacitor/core";
import {
  PushNotifications,
  Token,
  PushNotificationSchema,
} from "@capacitor/push-notifications";

interface Notification {
  title: string;
  body: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("notifications");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // // Persist notifications in localStorage
  // useEffect(() => {
  //   localStorage.setItem("notifications", JSON.stringify(notifications));
  // }, [notifications]);

  // // Unified setup for web and mobile
  // useEffect(() => {
  //   let cleanupFunctions: (() => void)[] = [];

  //   const setupNotifications = async () => {
  //     const isNative = Capacitor.isNativePlatform();

  //     if (isNative) {
  //       // -------------------------------
  //       // Mobile: Capacitor Push Notifications
  //       // -------------------------------
  //       const permission = await PushNotifications.requestPermissions();
  //       if (permission.receive !== "granted") {
  //         console.warn("Push notification permission denied");
  //         return;
  //       }

  //       await PushNotifications.register();

  //       const tokenListener = await PushNotifications.addListener(
  //         "registration",
  //         (token: Token) => {
  //           console.log("Device push token:", token.value);
  //           fetch(
  //             `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cargpt/store-token/`,
  //             {
  //               method: "POST",
  //               headers: { "Content-Type": "application/json" },
  //               body: JSON.stringify({ token: token.value }),
  //             }
  //           );
  //         }
  //       );

  //       const notificationListener = await PushNotifications.addListener(
  //         "pushNotificationReceived",
  //         (notification: PushNotificationSchema) => {
  //           console.log("Push notification received:", notification);
  //           setNotifications((prev) => [
  //             {
  //               title: notification.title ?? "Notification",
  //               body: notification.body ?? "",
  //               read: false,
  //             },
  //             ...prev,
  //           ]);
  //         }
  //       );

  //       const actionListener = await PushNotifications.addListener(
  //         "pushNotificationActionPerformed",
  //         (notification) => {
  //           console.log("Notification action performed:", notification);
  //         }
  //       );

  //       cleanupFunctions = [
  //         () => tokenListener.remove(),
  //         () => notificationListener.remove(),
  //         () => actionListener.remove(),
  //       ];
  //     } else if (
  //       typeof window !== "undefined" &&
  //       "Notification" in window &&
  //       "serviceWorker" in navigator &&
  //       "PushManager" in window
  //     ) {
  //       // -------------------------------
  //       // Web: FCM
  //       // -------------------------------
  //       Notification.requestPermission().then((permission) => {
  //         if (permission === "granted") {
  //           getToken(messaging, {
  //             vapidKey: process.env.NEXT_PUBLIC_VAPIDKEY,
  //           })
  //             .then((currentToken) => {
  //               if (currentToken) {
  //                 console.log("Web FCM Token:", currentToken);
  //                 fetch(
  //                   `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cargpt/store-token/`,
  //                   {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({ token: currentToken }),
  //                   }
  //                 );
  //               } else {
  //                 console.warn(
  //                   "No registration token available. Request permission to generate one."
  //                 );
  //               }
  //             })
  //             .catch((err) => {
  //               console.error("Error retrieving FCM token", err);
  //             });

  //           onMessage(messaging, (payload) => {
  //             console.log("Message received in foreground:", payload);
  //             setNotifications((prev) => [
  //               {
  //                 title: payload.notification?.title ?? "Notification",
  //                 body: payload.notification?.body ?? "",
  //                 read: false,
  //               },
  //               ...prev,
  //             ]);
  //           });
  //         }
  //       });
  //     }
  //   };

  //   setupNotifications();

  //   // Cleanup function
  //   return () => {
  //     cleanupFunctions.forEach((fn) => fn());
  //   };
  // }, []);

  // // Handle service worker background messages and localStorage sync
  // useEffect(() => {
  //   const syncNotifications = () => {
  //     const saved = localStorage.getItem("notifications");
  //     if (saved) setNotifications(JSON.parse(saved));
  //   };

  //   const handleServiceWorkerMessage = (event: MessageEvent) => {
  //     if (event.data && event.data.type === "BACKGROUND_NOTIFICATION") {
  //       console.log("Received background notification from SW:", event.data.notification);
  //       setNotifications((prev) => [event.data.notification, ...prev]);
  //     }
  //   };

  //   if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
  //     navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);
  //   }
  //   window.addEventListener("storage", syncNotifications);

  //   return () => {
  //     if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
  //       navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
  //     }
  //     window.removeEventListener("storage", syncNotifications);
  //   };
  // }, []);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
};
