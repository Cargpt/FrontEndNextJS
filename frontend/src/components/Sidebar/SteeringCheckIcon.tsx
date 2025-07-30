import React from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

const SteeringCheckIcon: React.FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 512 512">
      {/* Steering wheel outer circle */}
      <circle
        cx="256"
        cy="256"
        r="192"
        stroke="currentColor"
        strokeWidth="24"
        fill="none"
      />
      {/* Center circle */}
      <circle cx="256" cy="256" r="24" fill="currentColor" />
      {/* Top arc */}
      <path
        d="M160 256a96 96 0 01192 0"
        stroke="currentColor"
        strokeWidth="16"
        fill="none"
      />
      {/* Bottom arc */}
      <path
        d="M176 312c20-28 140-28 160 0"
        stroke="currentColor"
        strokeWidth="16"
        fill="none"
      />
      {/* Check circle */}
      <circle cx="384" cy="128" r="48" fill="currentColor" />
      {/* Checkmark */}
      <path
        d="M368 128l12 12 24-24"
        stroke="#fff"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
};

export default SteeringCheckIcon;
