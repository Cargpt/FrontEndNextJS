"use client"
import React, { useState } from "react";
import { Box, Link, useTheme } from "@mui/material";
import CookiePolicyDialog from "./CookiePolicyDialog";
import PrivacyPolicyDialog from "./PrivacyPolicyDialog";
import BrandName from "./BrandName";
import { Capacitor } from "@capacitor/core";

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
  const brandIndex = message.indexOf('AiCarAdvisor (TM)');
  
  const theme = useTheme();
  const isNative = Capacitor.isNativePlatform();

  // Helper function to render text with proper brand name
  const renderTextWithBrand = (text: string) => {
    if (brandIndex === -1) return text;
    
    const beforeBrand = text.slice(0, brandIndex);
    const afterBrand = text.slice(brandIndex + 'AiCarAdvisor (TM)'.length);
    
    return (
      <>
        {beforeBrand}
        <BrandName />
        {afterBrand}
      </>
    );
  };

  // Helper function to render text without brand name (for segments that shouldn't have it)
  const renderTextWithoutBrand = (text: string) => {
    // Remove any "AiCarAdvisor (TM)" occurrences from the text
    return text.replace(/AiCarAdvisor \(TM\)/g, 'AiCarAdvisor');
  };
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
          pt: 1,
      
          boxShadow: 3,
          zIndex: 3,
          fontSize: { xs: '12px', sm: '14px' },
          paddingBottom: isNative 
          ? 'max(env(safe-area-inset-bottom, 0px), 4.2vh)'
          : 'env(safe-area-inset-bottom, 0px)',          // Add bottom safe-area inset, not top

        }}
      >
        {/* Before Privacy Policy link */}
        {privacyIndex !== -1 ? renderTextWithBrand(message.slice(0, privacyIndex)) : renderTextWithBrand(message)}
        {/* Privacy Policy link */}
        {privacyIndex !== -1 && (
          <Link component="button" type="button" sx={{ ml: 0.5 }} underline="always" color="primary" onClick={handlePrivacyOpen}>
            Privacy Policy
          </Link>
        )}
        {/* Between Privacy Policy and Cookie Preferences */}
        {privacyIndex !== -1 && cookieIndex !== -1 && renderTextWithoutBrand(message.slice(privacyIndex + 'Privacy Policy'.length, cookieIndex))}
        {/* Cookie Preferences link */}
        {cookieIndex !== -1 && (
          <Link component="button" type="button" sx={{ ml: 0.5 }} underline="always" color="primary" onClick={handleCookieOpen}>
            See Cookie Preferences
          </Link>
        )}
        {/* After Cookie Preferences */}
        {cookieIndex !== -1 && renderTextWithoutBrand(message.slice(cookieIndex + 'See Cookie Preferences'.length))}
      </Box>
      <CookiePolicyDialog open={cookieOpen} onClose={handleCookieClose} />
      <PrivacyPolicyDialog open={privacyOpen} onClose={handlePrivacyClose} />
    </>
  );
};

export default FixedBottomMessage;

