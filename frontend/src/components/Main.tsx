import React, { useEffect } from "react";
import {
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { useCookies } from "react-cookie";
import { v4 as uuidv4 } from "uuid";
import { Token } from "@mui/icons-material";
import AdvisorIntro from "./AdvisorIntro/AdvisorIntro";
import HeroSection from "./HeroSection/HeroSection";
import { axiosInstance } from "@/utils/axiosInstance";


const Main: React.FC = () => {
    const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md")); 

  const onClick = () => {};

    const [cookies, setCookie] = useCookies(["selectedOption", "token"]);

  const handleGuestLogin = async () => {
    const uniqueUserId = uuidv4();

    const payload = {
      userId: uniqueUserId, // Include unique user ID
    };

    const response = await axiosInstance.post(
      `/api/cargpt/createUser/`,
      payload,
      {}
    );

    if (response.token) {
      // localStorage.setItem("auth_token", response.token);

      setCookie("token", response.token, { path: "/", maxAge: 365 * 60 * 60 }); // Store the token
      // localStorage.setItem("auth_token", response.token);
    } else {
    }
  };

  useEffect(() => {
    if (!cookies.token) handleGuestLogin();
  }, []);
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
