import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
} from '@mui/material';

type AllowLocationHelpProps = {
  open: boolean;
  onClose: () => void;
};

const AllowLocationHelp: React.FC<AllowLocationHelpProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>How to Enable Location Access</DialogTitle>
      <DialogContent>
        <DialogContentText component="div">
          <Box component="ul" sx={{ pl: 2, mb: 0 }}>
            <li>Click the 🔒 icon in your browser’s address bar.</li>
            <li>Find and set <strong>Location</strong> to <strong>Allow</strong>.</li>
            <li>Refresh the page to detect your location again.</li>
          </Box>

          <Box sx={{ mt: 2, fontWeight: 500 }}>Mobile Instructions:</Box>
          <Box component="ul" sx={{ pl: 2 }}>
            <li>Open your phone’s <strong>Settings</strong>.</li>
            <li>Go to <strong>Apps &gt; Browser (e.g., Chrome)</strong>.</li>
            <li>Tap <strong>Permissions &gt; Location</strong> and allow access.</li>
          </Box>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AllowLocationHelp;
