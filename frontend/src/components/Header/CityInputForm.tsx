import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  IconButton,
  Box,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { motion } from "framer-motion";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (city: string) => void;
  handleLocation: (isClose:boolean)=>void;
};

const CityInputDialog: React.FC<Props> = ({ open, onClose, onSubmit, handleLocation }) => {
  const [city, setCity] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;

    setSubmitted(true);
    onSubmit?.(city);
    setTimeout(() => {
      onClose();
      setSubmitted(false)
      setCity("")
    }, 800);
  };

  

const handleClose = ()=>{
setLocationError("")
setCity("")
onClose()
}
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        component: motion.div,
        initial: { opacity: 0, y: 50 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 30 },
        transition: { duration: 0.4, ease: "easeOut" },
        sx: {
          borderRadius: 3,
          px: 2,
          py: 2,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, pr: 4 }}>
        Enter Your City
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: "absolute", right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            fullWidth
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            autoFocus
            margin="normal"
            variant="outlined"
            InputProps={{
              sx: {
                borderRadius: 2,
              },
            }}
          />

          {locationError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {locationError}
            </Typography>
          )}

          {submitted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Typography
                variant="body2"
                color="success.main"
                sx={{ mt: 2, textAlign: "center" }}
              >
                Thank you! You entered: <strong>{city}</strong>
              </Typography>
            </motion.div>
          )}

            {/* Bottom: Use Location Button */}
        <Box sx={{pb: 1, display:"flex", justifyContent:"start"}} >
          <Button
            fullWidth
            
            variant="outlined"
            onClick={()=>handleLocation(true)}
            startIcon={
              loadingLocation ? <CircularProgress size={16} /> : <MyLocationIcon />
            }
            disabled={loadingLocation}
            sx={{
              mt: 1,
              textTransform: "none",
              fontWeight: 500,
              borderRadius: 2,
              border:"none",
              justifyContent:"left"
            }}
          >
            Use your current location
          </Button>
        </Box>

        </DialogContent>

      
        <DialogActions sx={{ px: 3, pb: 2 }}>
         
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ textTransform: "none", fontWeight: 500 }}
          >
            Submit
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CityInputDialog;
