import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CssBaseline from "@mui/material/CssBaseline";
import { KeyboardBackspaceSharp } from "@mui/icons-material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useCookies } from "react-cookie";
import { useRouter } from "next/navigation";
import { useTheme } from "@mui/material";
import { Capacitor } from "@capacitor/core";
import { useColorMode } from "@/Context/ColorModeContext";

type Props = {
  backToPrevious: () => void;
};

const FixedHeaderWithBack: React.FC<Props> = ({ backToPrevious }) => {
  const [cookies] = useCookies(["token", "user", "selectedOption"]);
  const router = useRouter();
  const theme = useTheme();
  const isNative = Capacitor.isNativePlatform();
  const isAndroid = Capacitor.getPlatform() === "android";
  const { mode } = useColorMode();

  const handleBookmarkClick = () => {
    if (cookies.user) {
      router.push("/bookmarks");
    }
  };

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
        <Toolbar
          sx={{
            left: "calc(env(safe-area-inset-left, 0px) + 8px)",
            zIndex: 3,
            border: "none",
          }}
        >
          {/* Back Button */}
          <IconButton edge="start" onClick={backToPrevious} aria-label="back">
            <KeyboardBackspaceSharp />
          </IconButton>

          {/* Brand Name on the left, next to back button */}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              fontWeight: 600,
              ml: 1,
              color: mode === "dark" ? "#2196f3" : "#ffffff", // Blue in dark mode, white in light mode
            }}
          >
            AICarAdvisor
          </Typography>

          {/* Spacer pushes bookmark icon to right */}
          <div style={{ flexGrow: 1 }} />

          {/* Bookmark Icon (if user is logged in) */}
          {cookies.user && (
            <IconButton
              onClick={handleBookmarkClick}
              edge="end"
              aria-label="favorite"
            >
              <FavoriteBorderIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      <Toolbar />
    </>
  );
};

export default FixedHeaderWithBack;
