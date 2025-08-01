"use client";

import React from "react";
import { useNotifications } from "../../Context/NotificationContext";
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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";

const NotificationsPage = () => {
  const { notifications, setNotifications } = useNotifications();
  const router = useRouter();

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

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Top Navbar */}
      <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="back"
            onClick={() => router.back()}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div">
            
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
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 0 12px rgba(0, 0, 0, 0.1)",
          border: "1px solid #ddd",
          overflowY: "auto",
        }}
      >
        {notifications?.length > 0 && (
          <Button
            variant="contained"
            color="error"
            onClick={clearAllNotifications}
            sx={{ marginBottom: "24px" }}
          >
            Clear All
          </Button>
        )}

        {(!notifications || notifications.length === 0) ? (
          <Typography
            variant="body1"
            sx={{
              textAlign: "center",
              color: "#666",
              fontStyle: "italic",
              marginTop: "40px",
            }}
          >     Nnotifications.
            🎉 No new notifications.
          </Typography>
        ) : (
          <List sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {notifications.map((notification, index) => (
              <ListItem key={index} disableGutters>
                <Card
                  sx={{
                    width: "100%",
                    backgroundColor: notification.read
                      ? "#f9f9f9"
                      : "#e8f4fd",
                    borderLeft: `6px solid ${
                      notification.read ? "#b0bec5" : "#2196f3"
                    }`,
                    transition: "background-color 0.3s ease",
                    "&:hover": {
                      backgroundColor: notification.read
                        ? "#f0f0f0"
                        : "#d2eafc",
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
                              ? "#424242"
                              : "#0d47a1",
                            marginBottom: "4px",
                          }}
                        >
                          {notification.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#555", lineHeight: 1.6 }}
                        >
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
      </Box>
    </Box>
  );
};

export default NotificationsPage;
