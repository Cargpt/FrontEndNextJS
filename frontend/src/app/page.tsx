// "use client";
// import React from "react";
// import HeroSection from '@/components/HeroSection/HeroSection';
// import PermissionsRequest from '@/components/common/PermissionsRequest';

// export default function HomePage() {
//   const handlePermissionsComplete = (permissions: any) => {
//     console.log('Permissions completed:', permissions);
//     // You can store this in localStorage or context for future use
//     localStorage.setItem('permissions-granted', JSON.stringify(permissions));
//   };

//   return (
//     <div>
//       <PermissionsRequest 
//         showOnLoad={true}
//         autoRequest={false}
//         onComplete={handlePermissionsComplete}
//       />
//       <HeroSection />
//     </div>
//   );
// }




"use client";
import React, { useEffect } from 'react';
import HeroSection from '@/components/HeroSection/HeroSection';
import { permissionsManager } from '@/utils/permissionsManager';
import { Box, CircularProgress } from '@mui/material';
import Main from '@/components/Main';
import Navigations from '@/components/Navigations/Navigations';

export default function HomePage() {
  useEffect(() => {
    const requestAllPermissions = async () => {
      try {
        console.log('Automatically requesting permissions...');
        
        // Request all permissions automatically
        const result = await permissionsManager.requestPermissions({
          location: true,
          notifications: true
        });
        
        console.log('Permissions result:', result);
        
        // Store permissions in localStorage for future use
        localStorage.setItem('permissions-granted', JSON.stringify(result));
        
        // Log which permissions were granted/denied
        Object.entries(result).forEach(([permission, status]) => {
          console.log(`${permission}: ${status}`);
        });
        
      } catch (error) {
        console.error('Failed to request permissions:', error);
      }
    };

    // Request permissions when component mounts
    requestAllPermissions();
  }, []);

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }
  return (
    <>
    <Main />

    <Navigations />
  </>
  );
  }
