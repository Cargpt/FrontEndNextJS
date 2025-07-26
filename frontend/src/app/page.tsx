"use client";

import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";
import { useState } from "react";
import Main from "../components/Main";
import FixedBottomMessage from "@/components/common/FixedBottomMessage";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <Header />
      <Main />
            <FixedBottomMessage  message="By messaging CarGPT, you agree to our Terms and have read our Privacy Policy. See Cookie Preferences.
            "/>

    </>
  );
}
