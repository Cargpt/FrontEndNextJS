import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import { axiosInstance } from "@/utils/axiosInstance";
import { useSnackbar } from "@/Context/SnackbarContext";

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ open, onClose }) => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { showSnackbar } = useSnackbar();

  const handleSendMessage = async () => {
    if (!name || !mobile || !message) {
      showSnackbar("Please fill out all required fields.", {
        vertical: "bottom",
        horizontal: "center",
      });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name,
        mobile,
        message,
      };
      await axiosInstance.post("/api/cargpt/contact/", payload);
      showSnackbar("Your message has been sent successfully!", {
        vertical: "bottom",
        horizontal: "center",
      });
      setName("");
      setMobile("");
      setMessage("");
      onClose();
    } catch (error) {
      showSnackbar("There was an error sending your message. Please try again.", {
        vertical: "bottom",
        horizontal: "center",
      });
      console.error("Error sending contact message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: "10px" } }}
    >
      <DialogTitle sx={{ textAlign: "center", pt: 4, fontSize: "24px" }}>
        Contact Us
      </DialogTitle>
      <DialogContent>
        <Box
          component="form"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            p: 2,
          }}
        >
          <TextField
            label="Your Name *"
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Mobile No *"
            variant="outlined"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
          <TextField
            label="Message *"
            variant="outlined"
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          justifyContent: "flex-end",
          pb: 3,
          gap: 2,
          flexWrap: "wrap",
          px: 2,
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            color: "grey.700",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          CANCEL
        </Button>
        <Button
          onClick={handleSendMessage}
          variant="contained"
          disabled={loading}
          sx={{
            background: "linear-gradient(to right, #F87171, #FBBF24)",
            color: "white",
            borderRadius: "8px",
            px: 4,
            py: 1.5,
            fontWeight: "bold",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            "&:hover": {
              background: "linear-gradient(to right, #F87171, #FBBF24)",
              filter: "brightness(0.95)",
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            },
          }}
        >
          {loading ? "SENDING..." : "SEND MESSAGE"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactModal; 