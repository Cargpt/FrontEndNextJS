


"use client";
import { useEffect, useState } from "react";
import { requestFirebaseToken, listenForMessages } from "../../lib/firebase";
import { PushNotifications } from "@capacitor/push-notifications";
import { Capacitor } from "@capacitor/core";
import { Box, Button, Card, CardContent, CardMedia, TextField, Typography, Chip, Stack } from "@mui/material";
import Navbar from "../../components/Navbar/Navbar";
import { useRouter } from "next/navigation";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { axiosInstance1 } from "@/utils/axiosInstance";
import { Preferences } from '@capacitor/preferences';

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
const platform = Capacitor.getPlatform();

export default function Home() {
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [token, setToken] = useState<string>("");
  const isNative = Capacitor.isNativePlatform();
  const router = useRouter();
  const handleBack = () => router.back();
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

        PushNotifications.addListener("registration", async t => {
          setToken(t.value);
          await saveTokenIfNew(t.value);
        });
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

  console.log("token:", token);
  return (
    <Box component="main" sx={{ minHeight: "100vh", bgcolor: 'background.default' }}>
      <Navbar backToPrevious={handleBack} />
      <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1200, mx: 'auto', mt: { xs: 2, sm: 2, lg:2 }, pt: 'env(safe-area-inset-top, 0px)' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1.25, mb: 3 }}>
          <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: 16, sm: 22, md: 28 }, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component="span" sx={{ fontSize: { xs: 18, sm: 24, md: 28 } }}>📩</Box>
            Notifications
          </Typography>
          <Stack direction="row" spacing={{ xs: 0.75, sm: 1 }} alignItems="center" sx={{ flexWrap: 'wrap' }}>
            <Chip size="small" label={`💬 ${messages.length}`} color="primary" variant="outlined" />
            <Button size="small" variant="contained" color="error" startIcon={<DeleteSweepOutlinedIcon fontSize="small" />} onClick={handleClearMessages} sx={{ minWidth: 0, px: 1.25, py: 0.5, fontSize: 12 }}>
              Clear
            </Button>
          </Stack>
        </Box>

        {messages.length === 0 && (
          <Typography color="text.secondary" fontStyle="italic">No messages yet. 🔕</Typography>
        )}

        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, mt: 0.5 }}>
          {messages.map((msg, i) => (
            <Box key={i} minWidth={0}>
              <Card elevation={2} sx={{ borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', transition: "box-shadow 200ms, transform 150ms", '&:hover': { boxShadow: 8, transform: 'translateY(-2px)' } }}>
                {msg.notification?.image && (
                  <CardMedia component="img" sx={{ height: { xs: 140, sm: 160 }, borderTopLeftRadius: 12, borderTopRightRadius: 12, objectFit: 'cover' }} image={msg.notification.image} alt="Notification" />
                )}
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <NotificationsActiveOutlinedIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: { xs: 14, sm: 16 }, ...(expanded[i] ? {} : { display: '-webkit-box', WebkitLineClamp: 2 as any, WebkitBoxOrient: 'vertical', overflow: 'hidden' }) }}>
                      {msg.notification?.title || "No title"}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: 12, sm: 14 }, ...(expanded[i] ? {} : { display: '-webkit-box', WebkitLineClamp: 3 as any, WebkitBoxOrient: 'vertical', overflow: 'hidden' }) }}>
                    {msg.notification?.body || "No body"}
                  </Typography>
                  <Box sx={{ mt: 0.5, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button size="small" onClick={() => toggleExpand(i)} endIcon={<ExpandMoreIcon sx={{ transform: expanded[i] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }} />} sx={{ textTransform: 'none', px: 1 }}>
                      {expanded[i] ? 'Show less' : 'Show more'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        {/* {token && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Registration Token</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
              <TextField fullWidth multiline rows={4} value={token} InputProps={{ readOnly: true }} />
              <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={() => navigator.clipboard.writeText(token)}>Copy</Button>
            </Stack>
          </Box>
        )} */}
      </Box>
    </Box>
  );
}

