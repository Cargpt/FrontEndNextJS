"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { messaging, getToken, onMessage} from "@/lib/firebase";

interface Notification {
  title: string;
  body: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("notifications");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    console.log("useEffect: notifications changed", notifications);
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    console.log("useEffect: component mounted");
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      console.warn("This browser does not support FCM web push notifications.");
      return;
    }

    let unsubscribe: (() => void) | undefined;

    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_VAPIDKEY,
        })
          .then((currentToken) => {
            if (currentToken) {
              console.log("Web FCM Token:", currentToken);
              fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cargpt/store-token/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: currentToken }),
              });
            } else {
              console.warn("No registration token available. Request permission to generate one.");
            }
          })
          .catch((err) => {
            console.error("An error occurred while retrieving token.", err);
          });

        unsubscribe = onMessage(messaging, (payload) => {
          console.log("Message received in foreground:", payload);
          setNotifications((prev) => {
            const updated = [
              {
                title: payload.notification?.title ?? "Notification",
                body: payload.notification?.body ?? "",
                read: false,
              },
              ...prev,
            ];
            return updated;
          });
        });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    const syncNotifications = () => {
      const saved = localStorage.getItem("notifications");
      if (saved) setNotifications(JSON.parse(saved));
    };

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "BACKGROUND_NOTIFICATION") {
        console.log("Received background notification from SW:", event.data.notification);
        setNotifications((prev) => {
          const updated = [event.data.notification, ...prev];
          return updated;
        });
      }
    };

    navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);
    window.addEventListener("storage", syncNotifications);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
      window.removeEventListener("storage", syncNotifications);
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};