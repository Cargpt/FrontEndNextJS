import React from "react";
import { Dialog, DialogContent } from "@mui/material";
import LoginForm from "@/components/Auth/Login";

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
}

const LoginDialog: React.FC<LoginDialogProps> = ({ open, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogContent>
      <LoginForm />
    </DialogContent>
  </Dialog>
);

export default LoginDialog;