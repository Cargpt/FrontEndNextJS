"use client";

import React, { useState } from "react";
import { AppBar, Box, Toolbar, IconButton, useTheme } from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone"; // Bell icon
import ThemeToggle from "../Theme/ThemeToggle";
import Sidebar from "../Sidebar/Sidebar";
import { useCookies } from "react-cookie";
import { useColorMode } from "@/Context/ColorModeContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import Badge from "@mui/material/Badge";
  import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';

import { useNotifications } from "../../Context/NotificationContext";
import { Capacitor } from "@capacitor/core";



const Header: React.FC = () => {


  const [cookies, setCookie] = useCookies(["token", "user", "selectedOption"]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { notifications, setNotifications } = useNotifications();
  const router = useRouter();
const {mode}=useColorMode()
  const theme = useTheme();

  const isNative = Capacitor.isNativePlatform()
  const isAndroid = Capacitor.getPlatform() === 'android'

  const unreadCount = notifications.filter((n: { read: boolean }) => !n.read).length;
  const readCount = notifications.filter((n: { read: boolean }) => n.read).length;

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

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: mode==="dark" ? theme.palette.background.paper : "#f5f6fa",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        // pb: 1,
        // Add small gap below Android status bar; add safe area for iOS
        pt: isAndroid ? theme.spacing(1) : `calc(${theme.spacing(0)} + env(safe-area-inset-top, 0px))`,
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          px: 2,
        }}
      >
        {/* Left Section: Menu + Logo */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {/* Menu Icon Container */}
          <Box
            onClick={handleDrawerOpen}
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
<MenuOutlinedIcon sx={{ color: mode=="dark"? 'white' :'black'}} />

            {/* <MenuOutlinedIcon  width={24} height={24}/> */}
            {/* <Image src="/assets/list.svg" alt="Menu" /> */}
          </Box>

          {/* Logo */}
          <Box
            sx={{
              ml: { xs: 1, sm: 1.5, md: 2 },
              width: { xs: 140, sm: 160, md: 220 },
              height: "auto",
            }}
          >
            <img 
            loading="lazy"
              src={"/assets/AICarAdvisor_transparent.png"}
              alt="Logo"
              width={220}
              height={50}
              style={{ width: "100%", height: "auto" }}
            />
          </Box>
        </Box>

        {/* Right Section: Icons */}
        <Box
          sx={{
            ml: "auto",
            display: "flex",
            alignItems: "center",
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          {/* Bookmark Icon */}
          {cookies.user && (
            <Box
              sx={{
                width: { xs: 32, sm: 36, md: 40 },
                height: { xs: 32, sm: 36, md: 40 },
                backgroundColor: mode==="dark"? "transparent": "#eeeeef",
                borderRadius: "50%",
    display: {
      xs: 'none',  // hide on extra-small
      sm: 'none',  // hide on small
      md: 'flex',  // show on medium and up
    },
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <IconButton size="small" onClick={handleBookmarkClick}>
                <FavoriteBorderIcon
                  sx={{
                    width: { xs: 18, sm: 20, md: 24 },
                    height: { xs: 18, sm: 20, md: 24 },
                    color: "#555",
                  }}
                />
              </IconButton>
            </Box>
          )}
  

          {/* Notification Bell Icon */}
          <Box
          
            sx={{
              width: { xs: 32, sm: 36, md: 40 },
              height: { xs: 32, sm: 36, md: 40 },
              backgroundColor: mode==="dark"? "transparent": "#eeeeef",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
         <Box
  sx={{
    width: { xs: 32, sm: 36, md: 40 },
    height: { xs: 32, sm: 36, md: 40 },
    backgroundColor: mode === "dark" ? "transparent" : "#eeeeef",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
  }}
>
  <IconButton size="medium" onClick={() => router.push("/notifications")}>
    <Badge
      badgeContent={unreadCount}
      max={999}
      color="error"
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      sx={{
        "& .MuiBadge-badge": {
          fontSize: "0.6rem", // make text responsive-ish
          height: { xs: 16, sm: 18 },
          minWidth: { xs: 16, sm: 18 },
        },
      }}
    >
      <NotificationsNoneIcon
        sx={{
          width: { xs: 18, sm: 20, md: 24 },
          height: { xs: 18, sm: 20, md: 24 },
          color: "#555",
        }}
      />
    </Badge>
  </IconButton>
</Box>

          </Box>

          {/* Theme Toggle */}
          <Box
            sx={{
              width: { xs: 32, sm: 36, md: 40 },
              height: { xs: 32, sm: 36, md: 40 },
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <ThemeToggle />
          </Box>


        </Box>
      </Toolbar>

      {/* Sidebar Drawer */}
      <Sidebar open={drawerOpen} onClose={handleDrawerClose} />
    </AppBar>
  );
};

export default Header;
