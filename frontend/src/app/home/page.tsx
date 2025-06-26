
import React from "react";
import ChatBox from "../../components/Chat/OptionsCard";
import { cookies } from "next/headers";
const Page =async () => {
const cookieStore = await cookies()
const selectedOption = cookieStore.get('selectedOption')?.value || 'I need advisor support';

  return (
    <>
      {/* <AdvisorIntro showInitialExample={true} onBotClick={() => {}} /> */}
<ChatBox />
    </>
  );
};

export default Page;
