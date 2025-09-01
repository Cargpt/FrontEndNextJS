// import FixedBottomMessage from '@/components/common/FixedBottomMessage'
// import Header from '@/components/Header/Header'
// import ProfilePage from '@/components/Profile/ProfilePage'
// import React from 'react'

// type Props = {}

// function page({}: Props) {
//   return (
//     <>
//               <Header />

//     <ProfilePage/>
//                 <FixedBottomMessage  message="By messaging AiCarAdvisor, you agree to our Terms and have read our Privacy Policy. See Cookie Preferences.
//             "/>

//     </>

//   )
// }

// export default page


"use client";

import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import { useState } from "react";
import Main from "../../components/Main";
import FixedBottomMessage from "@/components/common/FixedBottomMessage";
import { Capacitor } from "@capacitor/core";
import BottomNavigationBar from "@/components/Header/BottomNavigation";
import ProfilePage from "@/components/Profile/ProfilePage";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

    const isNativeApp = Capacitor.isNativePlatform();

  return (
    <>
    {
      !isNativeApp &&
    
        <Header />
      
    }
    
      <ProfilePage />
        {
          !isNativeApp ?(
            <FixedBottomMessage  message="By messaging AiCarAdvisor (TM), you agree to our Terms and have read our Privacy Policy. See Cookie Preferences.
            "/>

          ) : (
            <BottomNavigationBar />
          )

        }  
          
           




    </>
  );
}
