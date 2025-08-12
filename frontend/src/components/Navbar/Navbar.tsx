import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import CssBaseline from '@mui/material/CssBaseline';
import { KeyboardBackspaceSharp } from '@mui/icons-material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'; // Outlined heart
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/navigation';
import { useTheme } from '@mui/material';
import { Capacitor } from '@capacitor/core';
import { useColorMode } from '@/Context/ColorModeContext';

type Props = {
  backToPrevious: () => void;
};

const FixedHeaderWithBack: React.FC<Props> = ({ backToPrevious }) => {
  const [cookies, setCookie, removeCookie]=useCookies(['token', 'user','selectedOption']); // Initialize cookies, if needed

  const router = useRouter();
  const handleBookmarkClick = () => {
    if(cookies.user){
      // removeCookie("selectedOption", { path: "/" });

      router.push('/bookmarks'); // Navigate to bookmarks page

    }
  }
  
  const theme=useTheme()
  const isNative = Capacitor.isNativePlatform()
  const isAndroid = Capacitor.getPlatform() === 'android'
const {mode}=useColorMode()
  return (
    <>
      <CssBaseline />
      <AppBar
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderTop: `1px solid ${theme.palette.divider}`,
        
        boxShadow: "none",
        paddingTop: `env(safe-area-inset-bottom)`,
        boxSizing: "border-box",
      }}
    
          elevation={0}
        

      >
        <Toolbar sx={{
                      left: 'calc(env(safe-area-inset-left, 0px) + 8px)',
                      zIndex: 3,
                      border: "none",
        }}>
          <IconButton edge="start"  onClick={backToPrevious} aria-label="back">
            <KeyboardBackspaceSharp />
          </IconButton>
          {
            cookies.user &&
            (<IconButton onClick={handleBookmarkClick} edge="end" sx={{ ml: 'auto' }} aria-label="favorite">
            <FavoriteBorderIcon />
          </IconButton>)

          }
          {/* Outlined white heart icon on the right */}
          
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* Spacer to push content below fixed AppBar */}
    </>
  );
};

export default FixedHeaderWithBack;