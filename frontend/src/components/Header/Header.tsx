"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useCookies } from "react-cookie";
import { useRouter } from "next/navigation";
import { IconButton } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

import styles from "./Header.module.scss";


import Sidebar from "../Sidebar/Sidebar";

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
              <Image src={"/assets/list.svg"} alt="Menu" className={styles.menuIcon} height={32} width={32} />
            </div>
            <Image src={"/assets/AICarAdvisor.png"} alt="Logo" className={styles.carLogo}  width={160} height={160}/>
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
                src={"/assets/bell.svg"}
                alt="Notification"
                width={24}
                height={24}
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
