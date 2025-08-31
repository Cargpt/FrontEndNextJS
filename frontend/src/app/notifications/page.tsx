


"use client";
import { useEffect, useState } from "react";
import { requestFirebaseToken, listenForMessages } from "../../lib/firebase";
import { PushNotifications } from "@capacitor/push-notifications";
import { Capacitor } from "@capacitor/core";

const VAPID_KEY =
  "BOjWpWNg2UbA9o33HTIKOAAdLkx6GiB5l4Q_4lOwEJOZxDKVuku7HXUOWimqnPdOjzngx1-5rumuKrJz33GpSZs";


type StoredMessage = {
  notification?: {
    title?: string;
    body?: string;
    image?: string;
  };
  data?: any;
};
export default function Home() {
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [token, setToken] = useState<string>("");
  const isNative = Capacitor.isNativePlatform();

  const loadMessages = async () => {
    const { getSavedMessages } = await import("../../lib/fcm-storage");
    const allMessages = await getSavedMessages();
    setMessages(allMessages);
  };

  const handleClearMessages = async () => {
    const { clearMessages } = await import("../../lib/fcm-storage");
    await clearMessages();
    setMessages([]);
  };

  useEffect(() => {
    const initPush = async () => {
      if (isNative) {
        // ✅ Native push setup
        let permStatus = await PushNotifications.checkPermissions();
        if (permStatus.receive !== "granted") {
          permStatus = await PushNotifications.requestPermissions();
          if (permStatus.receive !== "granted") return;
        }
        await PushNotifications.register();

        PushNotifications.addListener("registration", t => setToken(t.value));
        PushNotifications.addListener("pushNotificationReceived", async notification => {
          const { saveMessage } = await import("../../lib/fcm-storage");
          await saveMessage({
            notification: { title: notification.title, body: notification.body },
            data: notification.data,
          } as any);
          await loadMessages();
        });
      } else {
        // ✅ Web push setup
        if (Notification.permission === "default") {
          await Notification.requestPermission();
        }
        if (Notification.permission === "granted") {
          const webToken = await requestFirebaseToken(VAPID_KEY);
          if (webToken) setToken(webToken);
          listenForMessages();
          window.addEventListener("new-fcm-message", loadMessages);
        }
      }
      await loadMessages();
    };
    initPush();
    return () => {
      if (!isNative) {
        window.removeEventListener("new-fcm-message", loadMessages);
      }
    };
  }, []);

  console.log("token:", token);
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📩 FCM Notifications</h1>
        <button
          onClick={handleClearMessages}
          className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
        >
          Clear Messages
        </button>
      </div>

      {messages.length === 0 && (
        <p className="text-gray-500 italic">No messages yet.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-3 hover:shadow-lg transition"
          >
            {msg.notification?.image && (
              <img
                src={msg.notification.image}
                alt="Notification"
                className="w-full h-40 object-cover rounded-xl"
              />
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {msg.notification?.title || "No title"}
              </h2>
              <p className="text-gray-600">
                {msg.notification?.body || "No body"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {token && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Your FCM Token:</h2>
          <textarea
            readOnly
            className="w-full h-32 p-3 border rounded-lg text-sm bg-gray-50"
            value={token}
          />
        </div>
      )}
    </main>
  );
}

