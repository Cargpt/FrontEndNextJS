"use client";

import * as React from "react";
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useTheme,
  useMediaQuery,
  Badge,
} from "@mui/material";

import HomeIcon from "@mui/icons-material/Home";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';

import { useRouter } from "next/navigation";
import { useColorMode } from "@/Context/ColorModeContext";
import { useNotifications } from "@/Context/NotificationContext";
import { useCookies } from "react-cookie";
import { Capacitor } from "@capacitor/core";
import Sidebar from "../Sidebar/Sidebar";

const BottomNavigationBar = () => {
  const router = useRouter();
  const { mode } = useColorMode();
  const theme = useTheme();
  const { notifications } = useNotifications();

  const unreadCount = notifications.filter((n: { read: boolean }) => !n.read).length;

  const [value, setValue] = React.useState(0);

  // Determine if device is native and platform is Android
  const isNative = Capacitor.isNativePlatform();
  const isAndroid = Capacitor.getPlatform() === "android";

  // Responsive display: Only show on small screens
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Show BottomNavigation only if on mobile or native platform
  const shouldShowBottomNav = isMobile || isNative;

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    switch (newValue) {
      case 0:
        router.push("/");
        break;
      case 1:
        if (cookies.user) {
          router.push("/bookmarks");
        } else {
          alert("Please log in to view bookmarks.");
        }
        break;
      case 2:
        router.push("/notifications");
        break;
      case 3:
        router.push("/profile");
        break;
    }

  };
  const [cookies, setCookie] = useCookies(["token", "user", "selectedOption"]);

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const { setNotifications } = useNotifications();

  const handleDrawerOpen = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);
  const handleBookmarkClick = () => {
    if (cookies.user) {
      setCookie("selectedOption", "I know exactly what I want", { path: "/" });
      router.push("/bookmarks");
    } else {
      alert("Please log in to view bookmarks.");
    }
  };


  if (!shouldShowBottomNav) return null;

  return (
    <Paper   sx={{
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    borderTop: `1px solid ${theme.palette.divider}`,
    background: mode === "dark"
      ? theme.palette.background.paper
      : "#f5f5f5",
    boxShadow: "none",
    paddingBottom: isNative && isAndroid
      ? 'max(env(safe-area-inset-bottom, 0px), 2vh)'
      : 'env(safe-area-inset-bottom, 0px)',
    boxSizing: "border-box",
  }}

      elevation={0}
    >
      <BottomNavigation value={value} onChange={handleChange} showLabels sx={{
    background: mode === "dark"
    ? theme.palette.background.paper
    : "#f5f5f5",

      }}>
        <BottomNavigationAction label="Home" icon={<HomeIcon />} />
        {
          cookies.user &&
          <BottomNavigationAction  label="Bookmarks" icon={<FavoriteBorderIcon />} />


        }
        <BottomNavigationAction
          label="Alerts"
          icon={
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsNoneIcon />
            </Badge>
          }
        />
        {
          cookies.user && (
            <BottomNavigationAction label="Profile" icon={<AccountCircleIcon />} />
          )
        }


<BottomNavigationAction
            onClick={handleDrawerOpen}

            showLabel
            label="Menu"
            icon={<MenuOutlinedIcon sx={{ color: mode=="dark"? 'white' :'black'}} />}
          
          />
        
      
      </BottomNavigation>

    

      <Sidebar open={drawerOpen} onClose={handleDrawerClose} />
          </Paper>
  );
};

export default BottomNavigationBar;
