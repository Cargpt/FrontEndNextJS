"use client";

import React, { useState } from "react";
import { AppBar, Box, Toolbar, IconButton, useTheme } from "@mui/material";
import Image from "next/image";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone"; // Bell icon
import ThemeToggle from "../Theme/ThemeToggle";
import Sidebar from "../Sidebar/Sidebar";
import { useCookies } from "react-cookie";
import { useRouter } from "next/navigation";
import { useColorMode } from "@/Context/ColorModeContext";

const Header: React.FC = () => {
  const theme = useTheme();
  const [cookies, setCookie] = useCookies(["token", "user", "selectedOption"]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
const {mode}=useColorMode()
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
        backgroundColor: theme.palette.background.paper,
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        py: 1,
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
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <Image src="/assets/list.svg" alt="Menu" width={24} height={24} />
          </Box>

          {/* Logo */}
          <Box
            sx={{
              ml: { xs: 1, sm: 1.5, md: 2 },
              width: { xs: 140, sm: 160, md: 220 },
              height: "auto",
            }}
          >
            <Image
              src={mode==="dark"? "/assets/AICarAdvisor_transparent.png": "/assets/AICarAdvisor.png"}
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
                backgroundColor: "#eeeeef",
                borderRadius: "50%",
                display: "flex",
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
              backgroundColor: theme.palette.background.paper,
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <IconButton size="small">
              <NotificationsNoneIcon
                sx={{
                  width: { xs: 18, sm: 20, md: 24 },
                  height: { xs: 18, sm: 20, md: 24 },
                  color: "#555",
                }}
              />
            </IconButton>
          </Box>

          {/* Theme Toggle */}
          <Box
            sx={{
              width: { xs: 32, sm: 36, md: 40 },
              height: { xs: 32, sm: 36, md: 40 },
              backgroundColor: "#eeeeef",
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
