import React from "react";
import {
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import LoginForm from "./Auth/Login";
import { useCookies } from "react-cookie";

import { Token } from "@mui/icons-material";
import AdvisorIntro from "./AdvisorIntro/AdvisorIntro";

const theme = createTheme({
  palette: {
    mode: "light", // Change to 'dark' for dark mode
  },
});

const Main: React.FC = () => {
  const [cookies] = useCookies(["token"]);
  const onClick = () => {};
  return (
    <ThemeProvider theme={theme}>
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
    </ThemeProvider>
  );
};

export default Main;
