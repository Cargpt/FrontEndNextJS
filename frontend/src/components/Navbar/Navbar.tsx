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

  return (
    <>
      <CssBaseline />
      <AppBar position="fixed"
        sx={{
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        pb: 1, // This maintains your original bottom padding
      pt: `calc(${theme.spacing(isNative? 5:0)} + env(safe-area-inset-top, 0px))`, // Adds safe area to original top padding
      background:"body2"
      }}

      >
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={backToPrevious} aria-label="back">
            <KeyboardBackspaceSharp />
          </IconButton>
          {
            cookies.user &&
            (<IconButton onClick={handleBookmarkClick} edge="end" color="inherit" sx={{ ml: 'auto' }} aria-label="favorite">
            <FavoriteBorderIcon sx={{ color: "#fff" }} />
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