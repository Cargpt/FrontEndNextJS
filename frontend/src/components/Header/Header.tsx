"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCookies } from "react-cookie";
import { useRouter } from "next/navigation";
import { IconButton } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import Badge from "@mui/material/Badge";

import { useNotifications } from "../../Context/NotificationContext";

import styles from "./Header.module.scss";

import Sidebar from "../Sidebar/Sidebar";

const Header = () => {
  const [cookies, setCookie] = useCookies(["token", "user", "selectedOption"]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { notifications, setNotifications } = useNotifications();
  const router = useRouter();

  const unreadCount = notifications.filter((n: { read: boolean }) => !n.read).length;
  const readCount = notifications.filter((n: { read: boolean }) => n.read).length;

  const handleDrawerOpen = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);
  const handleBookmarkClick = () => {
    if (cookies.user) {
      setCookie("selectedOption", "I know exactly what I want", { path: "/" }); // Clear selected option cookie
      router.push("/bookmarks");
    } else {
      alert("Please log in to view bookmarks.");
    }
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          {/* Left: Hamburger + Logo */}
          <div className={styles.menues}>
            <div className={styles.menuContainer} onClick={handleDrawerOpen}>
              <Image src={"/assets/list.svg"} alt="Menu" className={styles.menuIcon} height={32} width={32} />
            </div>
            <img src="/assets/AICarAdvisor.png" alt="Logo" width={160} height={32} />
          </div>

          {/* Right: Bookmark + Notification */}
          <div className={styles.rightIcons}>
            {cookies.user && (
              <div className={styles.iconButton}>
                <IconButton onClick={handleBookmarkClick}>
                  <FavoriteBorderIcon sx={{ color: "#555" }} />
                </IconButton>
              </div>
            )}
            <Link href="/notifications">
              <div className={styles.iconButton} style={{ position: "relative" }}>
                <Badge badgeContent={unreadCount} color="error">
                  <Image
                    src={"/assets/bell.svg"}
                    alt="Notification"
                    width={24}
                    height={24}
                    className={styles.notificationIcon}
                    style={{ cursor: "pointer" }}
                  />
                </Badge>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <Sidebar open={drawerOpen} onClose={handleDrawerClose} />
    </>
  );
};

export default Header;
