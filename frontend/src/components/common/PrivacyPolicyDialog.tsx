import React from "react";
import { Dialog, DialogTitle, DialogContent, Button, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { KeyboardBackspaceSharp } from "@mui/icons-material";

interface PrivacyPolicyDialogProps {
  open: boolean;
  onClose: () => void;
}

const PrivacyPolicyDialog: React.FC<PrivacyPolicyDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={fullScreen ? {
        sx: {
          width: '100vw',
          m: 0,
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
        }
      } : {}}
    >
      <DialogTitle
        sx={{
          bgcolor: theme.palette.mode == "dark"? "dark":"grey.100",
          position: "sticky",
          top: 0,
          zIndex: 2,
          textAlign: "center",
          fontWeight: 700,
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            position: "absolute",
            left: 15,
            top: 12,
            zIndex: 3,
            border: "none",
          }}
        >
          <KeyboardBackspaceSharp />
        </Button>
        Privacy Policy
      </DialogTitle>
      <DialogContent
        sx={fullScreen ? {
          flex: 1,
          overflowY: 'auto',
          pb: 2,
          minHeight: 0,
        } : {}}
      >
        <Typography gutterBottom>
          This is the Privacy Policy for AiCarAdvisor. We value your privacy and are committed to protecting your personal information. This dialog summarizes our practices regarding data collection, usage, and protection.
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>What We Collect:</Typography>
        <ul>
          <li>Personal information you provide (e.g., name, email, mobile number, preferences).</li>
          <li>Your location information (for personalized recommendations and services).</li>
          <li>Usage data and analytics to improve our services.</li>
          <li>Cookies and similar technologies for personalization and security.</li>
        </ul>
        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>How We Use Your Data:</Typography>
        <ul>
          <li>To provide and improve AiCarAdvisor services.</li>
          <li>To personalize your experience and recommendations.</li>
          <li>To communicate important updates and offers.</li>
        </ul>
        <Typography sx={{ mt: 2 }}>
          For full details, please read our complete Privacy Policy on our website. You can contact us for any privacy-related questions.
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicyDialog;
