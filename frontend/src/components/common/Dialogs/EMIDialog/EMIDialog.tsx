import { Close } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Typography,
} from "@mui/material";
import React from "react";

type EMIDialogProps = {
  open: boolean;
  onClose: () => void;
};

const EMIDialog: React.FC<EMIDialogProps> = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "80%",
          maxWidth: "1000px",
          height: "80vh",
          maxHeight: "90vh",
        },
      }}
    >
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{ position: "absolute", right: 8, top: 8 }}
      >
        <Close />
      </IconButton>
      <DialogContent
        dividers
        sx={{
          overflowY: "auto",
          maxHeight: "calc(80vh - 120px)",
        }}
      >
        <Typography variant="body1">
          Here you can show EMI-related information.
        </Typography>
        <Typography variant="body1">
          Here you can display user sentiment analysis or feedback.
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default EMIDialog;
