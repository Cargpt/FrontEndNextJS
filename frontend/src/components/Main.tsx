"use client";
import React, { useEffect, useState } from "react";
import {
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { useCookies } from "react-cookie";
import { v4 as uuidv4 } from "uuid";
import { Token } from "@mui/icons-material";
import AdvisorIntro from "./AdvisorIntro/AdvisorIntro";
import HeroSection from "./HeroSection/HeroSection";
import { axiosInstance, axiosInstance1 } from "@/utils/axiosInstance";
import { Capacitor } from "@capacitor/core";

import { Preferences } from "@capacitor/preferences";
import { PushNotifications } from "@capacitor/push-notifications";
import { listenForMessages, requestFirebaseToken } from "@/lib/firebase";
type StoredMessage = {
  notification?: {
    title?: string;
    body?: string;
    image?: string;
  };
  data?: any;
};
const platform = Capacitor.getPlatform();

const VAPID_KEY ="BOjWpWNg2UbA9o33HTIKOAAdLkx6GiB5l4Q_4lOwEJOZxDKVuku7HXUOWimqnPdOjzngx1-5rumuKrJz33GpSZs";

const Main: React.FC = () => {
    const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md")); 

  const onClick = () => {};

    const [cookies, setCookie] = useCookies(["selectedOption", "token"]);

  const handleGuestLogin = async () => {
    const uniqueUserId = uuidv4();

    const payload = {
      userId: uniqueUserId, // Include unique user ID
    };

    const response = await axiosInstance.post(
      `/api/cargpt/createUser/`,
      payload,
      {}
    );

    if (response.token) {

      setCookie("token", response.token, { path: "/", maxAge: 365 * 60 * 60 }); // Store the token
    } else {
    }
  };

  useEffect(() => {
    if (!cookies.token) handleGuestLogin();
  }, []);

  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [token, setToken] = useState<string>("");
  const isNative = Capacitor.isNativePlatform();
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const toggleExpand = (index: number) =>
    setExpanded(prev => ({ ...prev, [index]: !prev[index] }));

  const saveTokenIfNew = async (newToken: string) => {
    try {
      let saved: string | null = null;
      if (isNative) {
        try {
           
            const res = await Preferences.get({ key: "fcm_token_saved" });
            saved = res?.value ?? null;
          
        } catch {}
      } else {
        saved = localStorage.getItem("fcm_token_saved");
      }
      if (saved === newToken) return;
      await axiosInstance1.post("/api/cargpt/store-token/", { token: newToken, platform: platform });
      if (isNative) {
        try {
            await Preferences.set({ key: "fcm_token_saved", value: newToken });
            console.log("Token saved successfully");
        
        } catch {}
      } else {
        localStorage.setItem("fcm_token_saved", newToken);
      }
    } catch (e) {
      console.error("Failed to store FCM token", JSON.stringify(e));
    }
  };

  const loadMessages = async () => {
    const { getSavedMessages } = await import("../lib/fcm-storage");
    const allMessages = await getSavedMessages();
    setMessages(allMessages);
  };

  const handleClearMessages = async () => {
    const { clearMessages } = await import("../lib/fcm-storage");
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

        PushNotifications.addListener("registration", async t => {
          setToken(t.value);
          await saveTokenIfNew(t.value);
        });
        PushNotifications.addListener("pushNotificationReceived", async notification => {
          const { saveMessage } = await import("../lib/fcm-storage");
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
          if (webToken) {
            setToken(webToken);
            await saveTokenIfNew(webToken);
          }
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

  return (
    <>
      <CssBaseline />

      {
        isMdUp ? (
          
// Desktop / md+
        <div
          
          style={{minHeight: "100vh", width: "100%", backgroundColor: "#f5f5f5", overflow:"auto" }}
        >
          <HeroSection />
        </div>

        ):(
<Container
        maxWidth="sm"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
         <AdvisorIntro 
            onBotClick={onClick}
            showInitialExample={cookies.token}
          />
      </Container>

        )

        
      }
    
      </>
  
  );
};

export default Main;
