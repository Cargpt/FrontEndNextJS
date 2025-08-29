"use client";

import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";
import { useState } from "react";
import Main from "../components/Main";
import FixedBottomMessage from "@/components/common/FixedBottomMessage";
import { Capacitor } from "@capacitor/core";
import BottomNavigationBar from "@/components/Header/BottomNavigation";
import HeroSection from "@/components/HeroSection/HeroSection";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

    const isNativeApp = Capacitor.isNativePlatform();

  return (
    <>
    {/* {
      !isNativeApp &&
    
        <Header />
      
    } */}
    {
      
      
            <Main />


    }
    
        {
          !isNativeApp ?(
            <FixedBottomMessage  message="By messaging AiCarAdvisor, you agree to our Terms and have read our Privacy Policy. See Cookie Preferences.
            "/>

          ) : (
            <BottomNavigationBar />
          )

        }  
          
           




    </>
  );
}
