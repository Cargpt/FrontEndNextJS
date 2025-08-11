import React from "react";
import { Dialog, DialogContent, IconButton, useMediaQuery, useTheme } from "@mui/material";
import LoginForm from "@/components/Auth/Login";
import { KeyboardBackspaceSharp } from "@mui/icons-material";
import { useAndroidBackClose } from "@/hooks/useAndroidBackClose";

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
  showSignUp: () => void;
}

const LoginDialog: React.FC<LoginDialogProps> = ({ open, onClose, showSignUp }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  useAndroidBackClose(open, onClose);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      PaperProps={{
        sx: {
          m: 0,
          width: "100%",
          height: "100dvh",
          maxWidth: '100%',
          maxHeight: '100dvh',
          overflowX: "hidden",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          borderRadius: 0,
        },
      }}
    >
      {/* Close (Back) button */}
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top, 0px) + var(--android-top-gap, 8px) + 8px)",
          left: "calc(env(safe-area-inset-left, 0px) + 8px)",
          zIndex: 1,
          p: 1,
        }}
        aria-label="close"
      >
        <KeyboardBackspaceSharp />
      </IconButton>

      <DialogContent
        sx={{
          overflowX: "hidden",
          p: 2,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          mt: 4,
        }}
      >
        <LoginForm showSignUp={showSignUp} />
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;