// ...existing code...

import React from "react";
import ChatBox from "../../components/Chat/OptionsCard/OptionsCard";
import FixedBottomMessage from "../../components/common/FixedBottomMessage";
import Link from "next/link";

// ...existing code...

const HomePage = () => {
  return (
    <>
      {/* <AdvisorIntro showInitialExample={true} onBotClick={() => {}} /> */}
      <ChatBox />

      
      <FixedBottomMessage message="AiCarAdvisor (TM) can make mistakes. Check important info. See Cookie Preferences."/>
    </>
  );
};

export default HomePage;
