import { KeyboardBackspaceSharp } from "@mui/icons-material";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import ScoreLeftPanel from "./ScoreLeftPanel";
import ScoreRightPanel from "./ScoreRightPanel";
import { axiosInstance1 } from "@/utils/axiosInstance";

type ScoreDialogProps = {
  open: boolean;
  onClose: () => void;
  carId?: number;
};

const ScoreDialog: React.FC<ScoreDialogProps> = ({ open, onClose, carId }) => {
  const [carDetails, setCarDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeItem, setActiveItem] = useState("Engine");

  const fetchCarDetailsWithState = async (carId: number) => {
    setLoading(true);
    try {
      const response = await axiosInstance1.post("/api/car-details/", {
        car_id: carId,
      });
      setCarDetails(response?.data);
    } catch (error) {
      console.error("❌ Error fetching car details:", error);
    } finally {
      setLoading(false);
      console.log("🏁 Loading finished");
    }
  };

  useEffect(() => {
    if (open && carId) {
      fetchCarDetailsWithState(carId);
    } else {
      console.log("⏸️ Not fetching - open:", open, "carId:", carId);
    }
  }, [open, carId]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: {
            xs: "100%",
            sm: "90%",
            md: "80%",
          },
          maxWidth: "1000px",
          height: {
            xs: "100vh",
            sm: "90vh",
            md: "80vh",
          },
          maxHeight: "90vh",
          m: {
            xs: 0,
            sm: "auto",
          },
          borderRadius: {
            xs: 0,
            sm: 2,
          },
        },
      }}
    >
      <DialogTitle sx={{ background: "#eeeeef" }}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", left: 8, top: 8 }}
        >
          <KeyboardBackspaceSharp />
        </IconButton>
        <Typography
          sx={{ position: "relative", textAlign: "center", fontWeight: 700 }}
        >
          AI Car Advisor Store
        </Typography>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          overflow: "hidden",
          p: 0,
          height: "100%",
        }}
      >
        <Box display="flex" height="100%">
          <ScoreLeftPanel
            activeItem={activeItem}
            setActiveItem={setActiveItem}
            carDetails={carDetails}
          />
          <ScoreRightPanel
            activeItem={activeItem}
            carDetails={carDetails}
            loading={loading}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ScoreDialog;
