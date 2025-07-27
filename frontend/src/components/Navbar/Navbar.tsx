import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import CssBaseline from '@mui/material/CssBaseline';
import { KeyboardBackspaceSharp } from '@mui/icons-material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'; // Outlined heart
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/navigation';

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
  return (
    <>
      <CssBaseline />
      <AppBar position="fixed">
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