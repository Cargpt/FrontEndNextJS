'use client';

import React, { useState } from "react";
import ChatBox from "../../components/Chat/OptionsCard";
import FixedBottomMessage from "../../components/common/FixedBottomMessage";
import SignupDialog from "@/components/Auth/SignupDialog";
import { useRouter } from "next/navigation";

const HomePage = () => {
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const router = useRouter();

  const handleOpenSignup = () => {
    setShowSignupDialog(true);
  };

  const handleCloseSignup = () => {
    setShowSignupDialog(false);
  };

  const handleSignupSuccess = () => {
    setShowSignupDialog(false);
    router.push("/login"); // Redirect to login after successful signup
  };

  return (
    <>
      {/* This button is for demonstration. You can trigger the dialog from anywhere. */}
      <button onClick={handleOpenSignup}>Open Signup</button>
      <ChatBox />
      <FixedBottomMessage message="CarGPT can make mistakes. Check important info. See Cookie Preferences."/>
      <SignupDialog
        open={showSignupDialog}
        onClose={handleCloseSignup}
        onSuccess={handleSignupSuccess}
      />
    </>
  );
};

export default HomePage;
