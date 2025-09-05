"use client";
import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { Capacitor } from '@capacitor/core';
import { statusBarManager } from '@/utils/statusBarManager';

interface StatusBarProps {
  showSpacer?: boolean;
  showOverlay?: boolean;
}

const StatusBar: React.FC<StatusBarProps> = ({ 
  showSpacer = false, // Disabled by default to avoid any interference
  showOverlay = false // Disabled by default to avoid any interference
}) => {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
  }, []);

  // Only render on native platforms
  if (!isNative) {
    return null;
  }

  return (
    <>
      {/* Status bar spacer to prevent content overlap - minimal height */}
      {showSpacer && (
        <Box 
          className="status-bar-spacer"
          sx={{
            height: '0px',
            minHeight: '0px',
            maxHeight: '0px',
            background: 'transparent',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: -1, // Negative z-index to ensure it's behind everything
            pointerEvents: 'none',
            overflow: 'hidden', // Prevent any overflow
          }}
        />
      )}
      
      {/* Status bar overlay for better visual integration - only when explicitly enabled */}
      {showOverlay && (
        <Box 
          className="status-bar-overlay"
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '0px',
            zIndex: -1, // Negative z-index to ensure it's behind everything
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        />
      )}
    </>
  );
};

export default StatusBar;
