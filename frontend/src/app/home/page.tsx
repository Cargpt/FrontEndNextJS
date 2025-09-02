import React, { Suspense } from "react";
import ChatBox from "../../components/Chat/OptionsCard/OptionsCard";
import FixedBottomMessage from "../../components/common/FixedBottomMessage";
import Link from "next/link";
import { CircularProgress, Box } from "@mui/material";

const HomePage = () => {
  return (
    <Suspense fallback={
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    }>
      <>
        {/* <AdvisorIntro showInitialExample={true} onBotClick={() => {}} /> */}
        <ChatBox />
        
        <FixedBottomMessage message="AiCarAdvisor (TM) can make mistakes. Check important info. See Cookie Preferences."/>
      </>
    </Suspense>
  );
};

export default HomePage;
