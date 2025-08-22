import { KeyboardBackspaceSharp } from "@mui/icons-material";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  CircularProgress,
  CardMedia,
  useMediaQuery,
  useTheme,
  Button,
} from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import React, { useState, useRef, useEffect } from "react";
import { useAndroidBackClose } from "@/hooks/useAndroidBackClose";
import { axiosInstance1 } from "@/utils/axiosInstance";
import useApi from "@/hooks/useApi";
import { useColorMode } from "@/Context/ColorModeContext";

type CarGalleryProps = {
  open: boolean;
  onClose: () => void;
  carId?: number;
};

const CarGallery: React.FC<CarGalleryProps> = ({ open, onClose, carId }) => {
  const [loading, setLoading] = useState(false);
  const [carDetails, setCarDetails] = useState<any>(null);
  const { data, loader, error } = useApi(
    "/api/cargpt/car-images-by-variant-model/",
    "post",
    { car_id: carId }
  );

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

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

  const [nav1, setNav1] = useState<any>(null);
  const [nav2, setNav2] = useState<any>(null);
  const slider1 = useRef<any>(null);
  const slider2 = useRef<any>(null);
  const images = data || [];

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
const {mode}=useColorMode()
  useAndroidBackClose(open, onClose);
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
          height: isSmallScreen ? "100dvh" : "auto",
          maxHeight: isSmallScreen ? "100dvh" : "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: 6,
        },
      }}
    >
      {/* Sticky Header */}
      <DialogTitle
        sx={{
          position: "sticky",
          top: 0,
          pt: 'calc(var(--android-top-gap, 0px) + env(safe-area-inset-top, 0px))',
          minHeight: 56,
          zIndex: 2,
          textAlign: "center",
          fontWeight: 700,
          
          bgcolor: theme.palette.primary.main,
    color: mode === 'dark' ? '#2196f3' : '#ffffff', // Blue in dark mode, white in light mode
          

        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            position: "absolute",
            left: 'calc(env(safe-area-inset-left, 0px) + 8px)',
            top: 'calc(env(safe-area-inset-top, 0px) + var(--android-top-gap, 8px) + 8px)',
            zIndex: 3,
            border: "none",
            minWidth: 0,
            p: 1,
                color: mode === 'dark' ? '#2196f3' : '#ffffff', // Blue in dark mode, white in light mode

          }}
        >
          <KeyboardBackspaceSharp />
        </Button>
        {carDetails &&
          `${carDetails.Brand || ""} ${carDetails.ModelName || ""}`}
      </DialogTitle>

      {/* Scrollable Content */}
      <DialogContent
        dividers
        sx={{
          overflowY: "auto",
          flexGrow: 1,
          padding: { xs: "15px 20px", sm: "20px 40px" },
          display: "flex",
          flexDirection: "column",
          gap: 2,
        
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
            <CircularProgress />
          </Box>
        ) : images.length > 0 ? (
          <>
            {/* Main Image Slider */}
            <Slider
              asNavFor={nav2}
              ref={(slider) => {
                setNav1(slider);
                slider1.current = slider;
              }}
              arrows={false}
              dots={false}
              infinite
              speed={500}
              slidesToShow={1}
              slidesToScroll={1}
              

            >
              {images.map((img: any, index: number) => (
                <Box
                  key={index}
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    mb: 2,
          
                  }}
                >
                  <CardMedia
                    component="img"
                    image={img}
                    alt={`car-img-${index}`}
                    height="294"
                    sx={{ cursor: "pointer", borderRadius: 2 }}
                  />
                </Box>
              ))}
            </Slider>

            {/* Thumbnail Slider */}
                <div
      style={{background: mode=="dark" ? "red" : "light"}}
    >

            <Slider
              asNavFor={nav1}
              ref={(slider) => {
                setNav2(slider);
                slider2.current = slider;
              }}
              slidesToShow={4}
              swipeToSlide
              focusOnSelect
              arrows={false}
              dots={false}
              infinite
              centerMode={false}
              
            >
              {images.map((img: any, index: number) => (
                <Box
                  key={index}
                  sx={{
                    p: 1,
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <img 
                  loading="lazy"
                    src={img}
                    alt={`car-thumb-${index}`}
                    width={100}
                    height={100}
                    style={{
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "2px solid #1976d2",
                    }}
                  />
                </Box>
              ))}
            </Slider>
            </div>
          </>
        ) : (
          <Typography>No images found.</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CarGallery;
