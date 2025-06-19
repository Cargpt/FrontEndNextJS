"use client";

import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";
import { useState } from "react";
import Main from "../components/Main";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <Header />
      <Main />
      <Footer />
    </>
  );
}
