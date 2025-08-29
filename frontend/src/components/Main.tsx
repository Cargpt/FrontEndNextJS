import React from "react";
import {
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { useCookies } from "react-cookie";

import { Token } from "@mui/icons-material";
import AdvisorIntro from "./AdvisorIntro/AdvisorIntro";
import HeroSection from "./HeroSection/HeroSection";


const Main: React.FC = () => {
  const [cookies] = useCookies(["token"]);
    const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md")); 

  const onClick = () => {};
  return (
    <>
      <CssBaseline />

      {
        isMdUp ? (
          
// Desktop / md+
        <div
          
          style={{minHeight: "100vh", width: "100%", backgroundColor: "#f5f5f5", overflow:"auto" }}
        >
          <HeroSection />
        </div>

        ):(
<Container
        maxWidth="sm"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
         <AdvisorIntro 
            onBotClick={onClick}
            showInitialExample={cookies.token}
          />
      </Container>

        )

        
      }
    
      </>
  
  );
};

export default Main;
