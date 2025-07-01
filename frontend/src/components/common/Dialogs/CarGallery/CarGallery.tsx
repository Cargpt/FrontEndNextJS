import { KeyboardBackspaceSharp } from "@mui/icons-material";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { axiosInstance1 } from "@/utils/axiosInstance";

type CarGalleryProps = {
  open: boolean;
  onClose: () => void;
  carId?: number;
};

const CarGallery: React.FC<CarGalleryProps> = ({ open, onClose, carId }) => {
  const [loading, setLoading] = useState(false);
  const [carDetails, setCarDetails] = useState<any>(null);

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
    } else {
      console.log("⏸️ Not fetching - open:", open, "carId:", carId);
    }
  }, [open, carId]);

  const [nav1, setNav1] = useState<any>(null);
  const [nav2, setNav2] = useState<any>(null);
  const slider1 = useRef<any>(null);
  const slider2 = useRef<any>(null);
  const images = carDetails?.images || [];
  console.log("Images array:", images);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: "90%", md: "60%" },
          maxWidth: "700px",
          height: { xs: "100vh", sm: "90vh", md: "80vh" },
          maxHeight: "90vh",
          m: { xs: 0, sm: "auto" },
          borderRadius: { xs: 0, sm: 2 },
        },
      }}
    >
      <DialogTitle sx={{ background: "#eeeeef" }}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", left: 8, top: 8 }}
        >
          <KeyboardBackspaceSharp onClick={onClose} sx={{cursor: "pointer"}} />
        </IconButton>
        <Typography
          sx={{ position: "relative", textAlign: "center", fontWeight: 700 }}
        >
          {carDetails &&
            `${carDetails.Brand || ""} ${carDetails.ModelName || ""}`}
        </Typography>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          height: "100%",
          p: 3,
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
            {/* main image slider */}
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
                  <Image
                    src={img.CarImageURL}
                    alt={`car-image-${index}`}
                    width={600}
                    height={400}
                    style={{
                      objectFit: "contain",
                      width: "100%",
                      maxHeight: "60vh",
                      borderRadius: "10px",
                    }}
                  />
                </Box>
              ))}
            </Slider>

            {/* thumbnails slider */}
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
                <Box key={index} sx={{ p: 1, cursor: "pointer" }}>
                  <Image
                    src={img.CarImageURL}
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