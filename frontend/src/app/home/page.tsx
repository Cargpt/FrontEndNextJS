// ...existing code...

import React from "react";
import ChatBox from "../../components/Chat/OptionsCard";
import FixedBottomMessage from "../../components/common/FixedBottomMessage";
import Link from "next/link";

// ...existing code...

const HomePage = () => {
  return (
    <>
      {/* <AdvisorIntro showInitialExample={true} onBotClick={() => {}} /> */}
      <ChatBox />
      <FixedBottomMessage message="AiCarAdvisor can make mistakes. Check important info. See Cookie Preferences."/>
      <div className="flex justify-center mt-4">
        <Link href="/notifications" legacyBehavior>
          <button className="px-4 py-2 bg-blue-500 text-white rounded">
            View Notifications
          </button>
        </Link>
      </div>
    </>
  );
};

export default HomePage;
