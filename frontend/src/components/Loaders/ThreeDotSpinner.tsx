import React from 'react';
import { Box } from '@mui/material';

const ThreeDotSpinner = () => {
  const dotStyle = {
    width: 4,
    height: 4,
    backgroundColor: '#fff', // white dots
    borderRadius: '50%',
    animation: 'bounce 0.6s infinite ease-in-out',
  };

  return (
    <>
      <style>
        {`
          @keyframes bounce {
            0%, 80%, 100% {
              transform: scale(0.8);
              opacity: 0.6;
            }
            40% {
              transform: scale(1.2);
              opacity: 1;
            }
          }
        `}
      </style>

      <Box
        sx={{
          display: 'inline-flex',
          gap: '2px',
          alignItems: 'center',
          marginLeft: '8px', // spacing from button text
        }}
      >
        <Box sx={{ ...dotStyle, animationDelay: '0s' }} />
        <Box sx={{ ...dotStyle, animationDelay: '0.1s' }} />
        <Box sx={{ ...dotStyle, animationDelay: '0.2s' }} />
      </Box>
    </>
  );
};

export default ThreeDotSpinner;
