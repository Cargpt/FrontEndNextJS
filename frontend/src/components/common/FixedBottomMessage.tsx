"use client"
import React, { useState } from "react";
import { Box, Link } from "@mui/material";
import CookiePolicyDialog from "./CookiePolicyDialog";
import PrivacyPolicyDialog from "./PrivacyPolicyDialog";

type Props = {
  message: string;
};

const FixedBottomMessage: React.FC<Props> = ({ message }) => {
  const [cookieOpen, setCookieOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const handleCookieOpen = () => setCookieOpen(true);
  const handleCookieClose = () => setCookieOpen(false);
  const handlePrivacyOpen = () => setPrivacyOpen(true);
  const handlePrivacyClose = () => setPrivacyOpen(false);

  // Split message for both links
  // Example message: 'By messaging CarGPT, you agree to our Terms and have read our Privacy Policy. See Cookie Preferences.'
  const privacyIndex = message.indexOf('Privacy Policy');
  const cookieIndex = message.indexOf('See Cookie Preferences');

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          left: 0,
          bottom: 0,
          width: '100%',
          bgcolor: 'background.paper',
          color: 'text.secondary',
          textAlign: 'center',
          py: 1,
          boxShadow: 3,
          zIndex: 1300,
          fontSize: { xs: '12px', sm: '14px' },
        }}
      >
        {/* Before Privacy Policy link */}
        {privacyIndex !== -1 ? message.slice(0, privacyIndex) : message}
        {/* Privacy Policy link */}
        {privacyIndex !== -1 && (
          <Link component="button" type="button" sx={{ ml: 0.5 }} underline="always" color="primary" onClick={handlePrivacyOpen}>
            Privacy Policy
          </Link>
        )}
        {/* Between Privacy Policy and Cookie Preferences */}
        {privacyIndex !== -1 && cookieIndex !== -1 && message.slice(privacyIndex + 'Privacy Policy'.length, cookieIndex)}
        {/* Cookie Preferences link */}
        {cookieIndex !== -1 && (
          <Link component="button" type="button" sx={{ ml: 0.5 }} underline="always" color="primary" onClick={handleCookieOpen}>
            See Cookie Preferences
          </Link>
        )}
        {/* After Cookie Preferences */}
        {cookieIndex !== -1 && message.slice(cookieIndex + 'See Cookie Preferences'.length)}
      </Box>
      <CookiePolicyDialog open={cookieOpen} onClose={handleCookieClose} />
      <PrivacyPolicyDialog open={privacyOpen} onClose={handlePrivacyClose} />
    </>
  );
};

export default FixedBottomMessage;

