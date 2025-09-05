import { KeyboardBackspaceSharp } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import BrandName from "@/components/common/BrandName";
import { useAndroidBackClose } from "@/hooks/useAndroidBackClose";
import ScoreLeftPanel from "./ScoreLeftPanel";
import ScoreRightPanel from "./ScoreRightPanel";
import { axiosInstance1 } from "@/utils/axiosInstance";
import { useColorMode } from "@/Context/ColorModeContext";
import { Capacitor } from "@capacitor/core";
import { safeAreaBottom } from "@/components/Header/BottomNavigation";

type ScoreDialogProps = {
  open: boolean;
  onClose: () => void;
  carId?: number;
};

const ScoreDialog: React.FC<ScoreDialogProps> = ({ open, onClose, carId }) => {
  const [carDetails, setCarDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeItem, setActiveItem] = useState("Engine");

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { mode } = useColorMode();

  const fetchCarDetailsWithState = async (carId: number) => {
    setLoading(true);
    try {
      const response = await axiosInstance1.post("/api/cargpt/car-details/", {
        car_id: carId,
      });
      setCarDetails(response?.data);
    } catch (error) {
      console.error("❌ Error fetching car details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && carId) {
      fetchCarDetailsWithState(carId);
    }
  }, [open, carId]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [open]);

  useAndroidBackClose(open, onClose);
  const isNative = Capacitor.isNativePlatform();
  const isAndroid = Capacitor.getPlatform() === "android";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isSmallScreen}
      scroll="paper"
      PaperProps={{
        sx: {
          width: { xs: "100%", md: "80%" },
          maxWidth: "1000px",
          height: isSmallScreen ? "100dvh" : "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: 6,
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: theme.palette.primary.main,
          color: mode === 'dark' ? '#2196f3' : '#ffffff',
          paddingTop: isNative && isAndroid
          ? 'max(env(safe-area-inset-top, 0px), 2.5vh)'
          : 'env(safe-area-inset-top, 0px)',          minHeight: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            border: "none",
            minWidth: 0,
            p: 1,
            color: mode === 'dark' ? '#2196f3' : '#ffffff',
            flexShrink: 0
          }}
        >
          <KeyboardBackspaceSharp />
        </Button>
        
        <Typography
          sx={{
            fontWeight: 700,
            textAlign: "center",
            flex: 1,
            mx: 2
          }}
        >
          <BrandName /> Score
        </Typography>
        
        {/* Invisible spacer to balance the layout */}
        <Box sx={{ width: 40, flexShrink: 0 }} />
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          
          flexGrow: 1,
          display: "flex",
          p: 0,
          height: "100%",

        }}
        
      >
        <Box display="flex" flex={1} height="100%" overflow="hidden" >
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
