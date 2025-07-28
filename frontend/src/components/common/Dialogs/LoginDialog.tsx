import React from "react";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import LoginForm from "@/components/Auth/Login";
import { KeyboardBackspaceSharp } from "@mui/icons-material";

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
  showSignUp: () => void;
}

const LoginDialog: React.FC<LoginDialogProps> = ({ open, onClose, showSignUp }) => (
<Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          m: 1,
          width: "100%",
          maxWidth: "400px",
          height: { xs: "100vh", sm: "auto" },
          maxHeight: "100vh",
          overflowX: "hidden",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Close (Back) button */}
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 8,
          left: 8,
          zIndex: 1,
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
          mt: 4, // Add margin-top to avoid overlapping with IconButton
        }}
      >
        <LoginForm showSignUp={showSignUp}/>
      </DialogContent>
    </Dialog>

);

export default LoginDialog;