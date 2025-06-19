import React, { useState, useRef, useEffect } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import styles from "./Header.module.scss";
import logo from "../../../public/assets/AICarAdvisor.png";
import Hamburger from "../../../public/assets/list.svg";
import Notification from "../../../public/assets/bell.svg";
import Image from "next/image";
import Sidebar from "../Sidebar/Sidebar";

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.menues}>
            <div className={styles.menuContainer}>
              <Image
                src={Hamburger}
                alt="list"
                className={styles.menuIcon}
                onClick={handleDrawerOpen}
              />
            </div>
            <Image src={logo} alt="Logo" className={styles.carLogo} />
          </div>
          <div className={styles.notificationContainer}>
            <div className={styles.notificationContainerNew}>
              <Image
                src={Notification}
                alt="notify"
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
