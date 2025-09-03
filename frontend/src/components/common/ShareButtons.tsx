"use client";
import React, { useState } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";
import ShareIcon from "@mui/icons-material/Share";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Share } from "@capacitor/share";
import { useColorMode } from "@/Context/ColorModeContext";

interface ShareButtonsProps {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({
  title = "Find Your Perfect Car with AiCarAdvisor™",
description = "Get AI-powered car recommendations, compare specs & prices, and book test drives instantly.",
  url,
  image = "https://aicaradvisor.com/assets/AICarAdvisor.png",
}) => {
  const { mode } = useColorMode();
  const theme = useTheme();
  const isLarge = useMediaQuery(theme.breakpoints.up("lg")); // Large screens
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const currentUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  // ✅ Native share (Capacitor / Web Share API) with fallback
  const handleNativeShare = async () => {
    try {
      await Share.share({
        title,
        text: description,
        url: currentUrl,
        dialogTitle: "Share AiCarAdvisor",
      });
    } catch (err) {
      // Fallback: WhatsApp link
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
        `${title}\n\n${description}\n\n${currentUrl}`
      )}`;
      window.open(whatsappUrl, "_blank");
    }
  };

  // ✅ WhatsApp share
  const shareOnWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
      `${title}\n\n${description}\n\n${currentUrl}`
    )}`;
    window.open(whatsappUrl, "_blank");
    handleClose();
  };

  // ✅ Facebook share
  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      currentUrl
    )}`;
    window.open(facebookUrl, "_blank");
    handleClose();
  };

  // ✅ Copy link
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setShowCopySuccess(true);
      handleClose();
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = currentUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setShowCopySuccess(true);
      handleClose();
    }
  };

  return (
    <>
      {isLarge ? (
        // 🔹 Large screens → Dropdown with WhatsApp + FB + Copy
        <>
          <Tooltip title="Share">
            <IconButton
              onClick={handleClick}
              size="small"
              sx={{
                color: mode === "dark" ? "#fff" : "#666",
                "&:hover": {
                  bgcolor:
                    mode === "dark"
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.1)",
                },
              }}
            >
              <ShareIcon />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            PaperProps={{
              sx: {
                minWidth: 200,
                mt: 1,
                "& .MuiMenuItem-root": { py: 1.5, px: 2 },
              },
            }}
          >
            <MenuItem onClick={shareOnWhatsApp}>
              <ListItemIcon>
                <WhatsAppIcon sx={{ color: "#25D366" }} />
              </ListItemIcon>
              <ListItemText primary="Share on WhatsApp" />
            </MenuItem>

            <MenuItem onClick={shareOnFacebook}>
              <ListItemIcon>
                <FacebookIcon sx={{ color: "#1877F2" }} />
              </ListItemIcon>
              <ListItemText primary="Share on Facebook" />
            </MenuItem>

            <MenuItem onClick={copyLink}>
              <ListItemIcon>
                <ContentCopyIcon />
              </ListItemIcon>
              <ListItemText primary="Copy Link" />
            </MenuItem>
          </Menu>
        </>
      ) : (
        // 🔹 Small screens & App → Native share (with fallback)
        <Tooltip title="Share">
          <IconButton
            onClick={handleNativeShare}
            sx={{
              bgcolor: "#1877F2",
              color: "white",
              "&:hover": { bgcolor: "#166FE5" },
              width: 40,
              height: 40,
            }}
          >
            <ShareIcon />
          </IconButton>
        </Tooltip>
      )}

      {/* ✅ Snackbar for Copy Success */}
      <Snackbar
        open={showCopySuccess}
        autoHideDuration={3000}
        onClose={() => setShowCopySuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowCopySuccess(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Link copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

export default ShareButtons;
