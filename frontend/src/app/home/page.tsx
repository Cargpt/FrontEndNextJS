'use client'

import React from "react";
import ChatBox from "../../components/Chat/OptionsCard";
import Support from "../../components/Chat/Support";
import { useBotType } from "../../Context/BotTypeContext";
import AdvisorIntro from "../../components/AdvisorIntro/AdvisorIntro";

const Page = () => {
  const { botType } = useBotType();

  return (
    <>
      {/* <AdvisorIntro showInitialExample={true} onBotClick={() => {}} /> */}
      {botType.includes("want") && <ChatBox />}
      {botType.includes("support") && <Support />}
    </>
  );
};

export default Page;
