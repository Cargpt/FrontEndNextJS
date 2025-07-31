import React from "react";
import {
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from "@mui/material";

import { useCookies } from "react-cookie";

import { Token } from "@mui/icons-material";
import AdvisorIntro from "./AdvisorIntro/AdvisorIntro";


const Main: React.FC = () => {
  const [cookies] = useCookies(["token"]);
  const onClick = () => {};
  return (
    <>
      <CssBaseline />
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
      </>
  
  );
};

export default Main;
