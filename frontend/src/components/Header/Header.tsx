"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useCookies } from "react-cookie";
import { useRouter } from "next/navigation";
import { IconButton } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

import styles from "./Header.module.scss";

import logo from "../../../public/assets/AICarAdvisor.png";
import Hamburger from "../../../public/assets/list.svg";
import Notification from "../../../public/assets/bell.svg";

import Sidebar from "../Sidebar/Sidebar";
import { useLocalizationContext } from "@mui/x-date-pickers/internals";

const Header = () => {
  const [cookies, setCookie] = useCookies(["token", "user", "selectedOption"]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();

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
              <Image src={Hamburger} alt="Menu" className={styles.menuIcon} />
            </div>
            <Image src={logo} alt="Logo" className={styles.carLogo} />
          </div>

          {/* Right: Bookmark + Notification */}
          <div className={styles.rightIcons}>
            {cookies.user && 
            
           
            <div className={styles.iconButton}>
              <IconButton onClick={handleBookmarkClick}>
                <FavoriteBorderIcon sx={{ color: "#555" }} />
              </IconButton>
            </div>
             }
            <div className={styles.iconButton}>
              <Image
                src={Notification}
                alt="Notification"
                className={styles.notificationIcon}
              />
            </div>
          </div>
        </div>
      </header>

      <Sidebar open={drawerOpen} onClose={handleDrawerClose} />
    </>
  );
};

export default Header;
