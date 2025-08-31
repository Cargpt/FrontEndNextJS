"use client";

import { useEffect, useState } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { Snackbar } from "@mui/material";

// Extend navigator type for exitApp
declare global {
  interface Navigator {
    app?: {
      exitApp: () => void;
    };
  }
}

type Props = {
  children: React.ReactNode;
};

export default function BackExitHandler({ children }: Props) {
  const [lastBackPress, setLastBackPress] = useState<number>(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    if (Capacitor.getPlatform() !== "android") return;

    let listenerHandle: { remove: () => void } | undefined;

    const setupListener = async () => {
      listenerHandle = await CapacitorApp.addListener("backButton", () => {
        if (window.location.pathname === "/") {
          const now = Date.now();
          if (now - lastBackPress < 2000) {
            navigator.app?.exitApp();
          } else {
            setLastBackPress(now);
            setOpenSnackbar(true);
          }
        } else {
          window.history.back();
        }
      });
    };

    setupListener();

    return () => {
      listenerHandle?.remove();
    };
  }, [lastBackPress]);

  return (
    <>
      {children}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={() => setOpenSnackbar(false)}
        message="Press back again to exit"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
}
