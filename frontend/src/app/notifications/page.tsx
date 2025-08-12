"use client";

import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  Stack,
  useTheme,
  Tooltip,
  BottomNavigationAction,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { useRouter } from "next/navigation";
import { useNotifications } from "../../Context/NotificationContext";
import KeyboardBackspaceSharpIcon from '@mui/icons-material/KeyboardBackspaceSharp';
import { Capacitor } from "@capacitor/core";

const NotificationsPage = () => {
  const { notifications, setNotifications } = useNotifications();
  const router = useRouter();
  const theme = useTheme();

  const markAsRead = (index: number) => {
    setNotifications((prev) =>
      prev.map((notification, i) =>
        i === index ? { ...notification, read: true } : notification
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const hasNotifications = notifications?.length > 0;
 const isNative = Capacitor.isNativePlatform()
  return (
    <Box sx={{ backgroundColor: theme.palette.background.default, minHeight: "100vh" }}>
      {/* App Bar */}
      
      <AppBar
      position="fixed" elevation={0} sx={{
        paddingTop: `env(safe-area-inset-bottom)`,

         }} 
         >
  <Toolbar>
    <IconButton edge="start" color="inherit" onClick={()=>router.back()} aria-label="back">
      <KeyboardBackspaceSharpIcon />
    </IconButton>
    <Typography variant="h6" fontWeight="bold" sx={{ ml: 2 }}>
      Nofications
    </Typography>
  </Toolbar>
</AppBar>

      {/* Notifications Container */}
      <Box
        sx={{
          height: "80vh",
          maxWidth: "700px",
          margin: "40px auto",
          padding: "24px",
          backgroundColor: theme.palette.background.paper,
          borderRadius: "12px",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 0 12px rgba(255, 255, 255, 0.1)"
              : "0 0 12px rgba(0, 0, 0, 0.1)",
          border: `1px solid ${theme.palette.divider}`,
          overflowY: "auto",
        }}
      >
        {!hasNotifications ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              minHeight: "300px",
            }}
          >
            <Typography
              variant="body1"
              sx={{
                textAlign: "center",
                color: theme.palette.text.secondary,
                fontStyle: "italic",
              }}
            >
              🎉 No new notifications.
            </Typography>
          </Box>
        ) : (
          <List sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {notifications.map((notification, index) => (
              <ListItem key={index} disableGutters>
                <Card
                  sx={{
                    width: "100%",
                    backgroundColor: notification.read
                      ? theme.palette.action.hover
                      : theme.palette.mode === "dark"
                      ? "#2a2e35"
                      : "#f5f7fa",
                    borderLeft: `6px solid ${
                      notification.read ? theme.palette.divider : theme.palette.primary.main
                    }`,
                    transition: "background-color 0.3s ease",
                    "&:hover": {
                      backgroundColor: notification.read
                        ? theme.palette.action.selected
                        : theme.palette.mode === "dark"
                        ? "#343a40"
                        : "#e6edf5",
                    },
                  }}
                >
                  <CardContent>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      spacing={2}
                    >
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: notification.read
                              ? theme.palette.text.primary
                              : theme.palette.primary.dark,
                            marginBottom: "4px",
                          }}
                        >
                          {notification.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          {notification.body}
                        </Typography>
                      </Box>

                      {!notification.read && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={() => markAsRead(index)}
                          sx={{
                            height: "32px",
                            textTransform: "none",
                            fontWeight: 500,
                          }}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </ListItem>
            ))}
          </List>
        )}

        {
          isNative &&
          <BottomNavigationAction/>
        }
      </Box>
    </Box>
  ); 
};   

export default NotificationsPage;
