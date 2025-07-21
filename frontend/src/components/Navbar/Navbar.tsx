import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import CssBaseline from '@mui/material/CssBaseline';
import { KeyboardBackspaceSharp } from '@mui/icons-material';
type Props={
    backToPrevious:()=>void;
}

const FixedHeaderWithBack: React.FC <Props>= ({backToPrevious}) => {

  

  return (
    <>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={backToPrevious} aria-label="back">
            <KeyboardBackspaceSharp />
          </IconButton>
         
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* Spacer to push content below fixed AppBar */}
      
    </>
  );
};

export default FixedHeaderWithBack;
