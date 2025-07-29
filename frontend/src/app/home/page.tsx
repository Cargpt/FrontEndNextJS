// ...existing code...

import React from "react";
import ChatBox from "../../components/Chat/OptionsCard";
import FixedBottomMessage from "../../components/common/FixedBottomMessage";

// ...existing code...

const HomePage = () => {
  return (
    <>
      {/* <AdvisorIntro showInitialExample={true} onBotClick={() => {}} /> */}
      <ChatBox />
      <FixedBottomMessage message="AiCarAdvisor can make mistakes. Check important info. See Cookie Preferences."/>
    </>
  );
};

export default HomePage;
