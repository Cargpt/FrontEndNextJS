import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface CookiePolicyDialogProps {
  open: boolean;
  onClose: () => void;
}

const CookiePolicyDialog: React.FC<CookiePolicyDialogProps> = ({ open, onClose }) => {
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
      <DialogTitle>Cookie Preferences</DialogTitle>
      <DialogContent
        sx={fullScreen ? {
          flex: 1,
          overflowY: 'auto',
          pb: 2,
          minHeight: 0,
        } : {}}
      >
        <Typography gutterBottom>
          AiCarAdvisor uses cookies and similar technologies to enhance your experience, analyze site usage, and deliver personalized content. You can manage your cookie preferences below. For more details, please read our full Cookie Policy.
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>Types of Cookies:</Typography>
        <ul>
          <li><strong>Essential Cookies:</strong> Required for basic site functionality.</li>
          <li><strong>Analytics Cookies:</strong> Help us understand site usage and improve performance.</li>
          <li><strong>Personalization Cookies:</strong> Enable personalized content and recommendations.</li>
          <li><strong>Advertising Cookies:</strong> Used to deliver relevant ads and measure ad effectiveness.</li>
        </ul>
        <Typography sx={{ mt: 2 }}>
          You can change your preferences at any time. For more information, see our <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CookiePolicyDialog;
