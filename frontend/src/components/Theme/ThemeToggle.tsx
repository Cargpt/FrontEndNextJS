import React from "react";
import { Box, IconButton, Tooltip, useTheme } from "@mui/material";
import Brightness7Icon from "@mui/icons-material/Brightness7"; // Sun
import Brightness4Icon from "@mui/icons-material/Brightness4"; // Moon
import { useColorMode } from "@/Context/ColorModeContext";

const ThemeToggle = () => {
  const { mode, toggleColorMode } = useColorMode();
  const theme= useTheme()

  return (
    <Tooltip title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}>
      {/* <IconButton onClick={toggleColorMode} 
      
      sx={{"background": theme.palette.background.paper}} size="large">
        {mode === "light" ? (
          <Brightness4Icon sx={{ color: "gray" }}
          
          />  // Moon gray
        ) : (
          <Brightness7Icon sx={{ color: "gold" }} />  // Sun yellow
        )}
      </IconButton> */}


       <Box
            sx={{
              width: { xs: 32, sm: 36, md: 40 },
              height: { xs: 32, sm: 36, md: 40 },
              backgroundColor: theme.palette.background.paper,
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <IconButton size="small" onClick={toggleColorMode}>

                        {mode === "light" ? (
          <Brightness4Icon sx={{ color: "gray",  width: { xs: 18, sm: 20, md: 24 },
                  height: { xs: 18, sm: 20, md: 24 } }}
          
          />  // Moon gray
        ) : (
          <Brightness7Icon sx={{ color: "gold",  width: { xs: 18, sm: 20, md: 24 },
                  height: { xs: 18, sm: 20, md: 24 } }} />  // Sun yellow
        )}
              
            </IconButton>
          </Box>
    </Tooltip>
  );
};

export default ThemeToggle;
