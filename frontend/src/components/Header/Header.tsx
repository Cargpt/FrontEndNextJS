"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useCookies } from "react-cookie";
import { useRouter } from "next/navigation";
import { IconButton } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import Badge from "@mui/material/Badge";
import ClickAwayListener from "@mui/material/ClickAwayListener";

import { useFCMWebPush } from "@/hooks/useFCMWebPush";

import styles from "./Header.module.scss";

import Sidebar from "../Sidebar/Sidebar";

const Header = () => {
  const [cookies, setCookie] = useCookies(["token", "user", "selectedOption"]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { notifications, setNotifications } = useFCMWebPush();
  const [showDropdown, setShowDropdown] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const readCount = notifications.filter((n) => n.read).length;

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

  const handleBellClick = () => {
    setShowDropdown((prev) => !prev);
    if (!showDropdown) {
      // Mark all as read
      const updated = notifications.map((n) => ({ ...n, read: true }));
      setNotifications(updated);
    }
  };

  const handleClickAway = () => {
    setShowDropdown(false);
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
            <img src="/assets/AICarAdvisor2.png" alt="Logo" width={160} height={32} />
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
            <ClickAwayListener onClickAway={handleClickAway}>
              <div className={styles.iconButton} style={{ position: "relative" }}>
                <Badge badgeContent={unreadCount} color="error">
                  <Image
                    src={"/assets/bell.svg"}
                    alt="Notification"
                    width={24}
                    height={24}
                    className={styles.notificationIcon}
                    onClick={handleBellClick}
                    style={{ cursor: "pointer" }}
                  />
                </Badge>
                {showDropdown && (
                  <div className={styles.notificationDropdown}>
                    <div style={{ padding: "8px", fontWeight: 500 }}>
                      Unread: {unreadCount} | Read: {readCount}
                    </div>
                    {notifications.length === 0 ? (
                      <div className={styles.noNotifications}>No notifications</div>
                    ) : (
                      notifications.map((n, idx) => (
                        <div
                          key={idx}
                          className={`${styles.notificationItem} ${n.read ? styles.read : styles.unread}`}
                        >
                          <div style={{ fontWeight: "bold" }}>{n.title}</div>
                          <div>{n.body}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </ClickAwayListener>
          </div>
        </div>
      </header>

      <Sidebar open={drawerOpen} onClose={handleDrawerClose} />
    </>
  );
};

export default Header;
