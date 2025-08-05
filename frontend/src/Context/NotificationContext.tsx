"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  getMessagingIfSupported,
  getFCMToken,
  onFCMMessage,
} from "@/lib/firebase";

interface Notification {
  title: string;
  body: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}
// #changes
const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("notifications");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      console.warn(
        "This browser does not support FCM web push notifications."
      );
      return;
    }

    let unsubscribe: (() => void) | undefined;

    Notification.requestPermission().then(async (permission) => {
      if (permission !== "granted") return;

      const messaging = await getMessagingIfSupported();
      if (!messaging) return;

      try {
        const currentToken = await getFCMToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_VAPIDKEY,
        });

        if (currentToken) {
          console.log("Web FCM Token:", currentToken);

          await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cargpt/store-token/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ token: currentToken }),
            }
          );
        } else {
          console.warn("No FCM token available.");
        }
      } catch (err) {
        console.error("Error retrieving FCM token", err);
      }

      unsubscribe = onFCMMessage(messaging, (payload) => {
        console.log("Foreground notification:", payload);
        setNotifications((prev) => [
          {
            title: payload.notification?.title ?? "Notification",
            body: payload.notification?.body ?? "",
            read: false,
          },
          ...prev,
        ]);
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncNotifications = () => {
      const saved = localStorage.getItem("notifications");
      if (saved) setNotifications(JSON.parse(saved));
    };

    const handleSWMessage = (event: MessageEvent) => {
      if (event.data?.type === "BACKGROUND_NOTIFICATION") {
        setNotifications((prev) => [
          event.data.notification,
          ...prev,
        ]);
      }
    };

    navigator.serviceWorker.addEventListener("message", handleSWMessage);
    window.addEventListener("storage", syncNotifications);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleSWMessage);
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
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};
