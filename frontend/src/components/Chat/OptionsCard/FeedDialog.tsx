import { KeyboardBackspaceSharp } from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  Typography,
  useMediaQuery,
  useTheme,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Toolbar,
} from "@mui/material";
import React from "react";

type FeedDialogProps = {
  open: boolean;
  onClose: () => void;
  carData?: any;
  backToPrevious: () => void;
};

const FeedDialog: React.FC<FeedDialogProps> = ({
  open,
  onClose,
  carData,
  backToPrevious,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  console.log("FeedDialog carData:", carData);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      scroll="paper"
    PaperProps={{
        sx: {
            width: { xs: "100%", md: "80%" },
            maxWidth: "1000px",
            height: isSmallScreen ? "100dvh" : "auto",
            maxHeight: isSmallScreen ? "100dvh" : "90vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: 6,
          },
        }}
    >
      <DialogTitle
        sx={{
          backgroundColor: "rgb(25, 118, 210) !important",
          color: "white",
          display: "flex",
          alignItems: "center",
        }}
      >
        <IconButton edge="start" onClick={backToPrevious} aria-label="back">
          <KeyboardBackspaceSharp />
        </IconButton>
        <Typography>Feed Details</Typography>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        {carData?.image && (
          <Box
            sx={{
              width: "100%",
              maxWidth: 300,
              height: 200,
              overflow: "hidden",
              borderRadius: 2,
            }}
          >
            <img
              src={carData.image.CarImageURL}
              alt={`${carData.brandName} ${carData.modelName}`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Box>
        )}
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", textAlign: "center" }}
        >
          {carData?.brandName} {carData?.modelName} {carData?.variantName}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ textAlign: "center" }}
        >
          Price: ₹ {carData?.price?.toLocaleString?.() ?? carData?.price}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedDialog;
