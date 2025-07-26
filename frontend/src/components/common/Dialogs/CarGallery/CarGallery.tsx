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
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { axiosInstance1 } from "@/utils/axiosInstance";
import useApi from "@/hooks/useApi";

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
          background: "#eeeeef",
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
            minWidth: "unset",
            padding: 0,
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
                  <Image
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
          </>
        ) : (
          <Typography>No images found.</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CarGallery;
