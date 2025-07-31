import { useColorMode } from "@/Context/ColorModeContext";
import { axiosInstance1 } from "@/utils/axiosInstance";
import { CheckCircle, KeyboardBackspaceSharp } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";

type SentimentDialogProps = {
  open: boolean;
  onClose: () => void;
  carId?: number;
};

type CarDetailsType = {
  AI_REVIEW?: {
    ReviewSummary: string;
  };
};

const SentimentDialog: React.FC<SentimentDialogProps> = ({
  open,
  onClose,
  carId,
}) => {
  const [carDetails, setCarDetails] = useState<CarDetailsType | null>(null);
  const [loading, setLoading] = useState(false);
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
      console.error("Error fetching car details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && carId) {
      fetchCarDetailsWithState(carId);
    }
  }, [open, carId]);

  const reviewData = (() => {
    const raw = carDetails?.AI_REVIEW?.ReviewSummary || "";
    const obj: {
      totalReviews?: string;
      summary?: string;
      sentiment?: string;
      issues?: string[];
      benefits?: string[];
    } = {};

    const sections = raw
      .split("<strong>")
      .map((s) => s.replace(/<\/strong>/g, ""));
    sections.forEach((section) => {
      if (section.includes("Total Reviews")) {
        obj.totalReviews = section.split(":")[1]?.trim().split("\n")[0];
      }
      if (section.includes("Review Summary")) {
        obj.summary = section.split(":")[1]?.trim().split("\n")[0];
      }
      if (section.includes("Sentiment")) {
        obj.sentiment = section.split(":")[1]?.trim().split("\n")[0];
      }
      if (section.includes("Issues")) {
        obj.issues = section
          .split(":")[1]
          ?.split("*")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      }
      if (section.includes("Benefits")) {
        obj.benefits = section
          .split(":")[1]
          ?.split("*")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      }
    });

    return obj;
  })();


  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed"; // prevent bounce scroll on mobile
      document.body.style.width = "100%"; // fix layout shift
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
    
      <DialogTitle sx={{ background:  mode=="dark" ? "": "#eeeeef" }}>
       <Button
          variant="outlined"
          onClick={onClose}
          sx={{ position: "absolute", left: 1, top: 12,  zIndex:20, border:"none" }}
        >
          <KeyboardBackspaceSharp />
        </Button>
        <Typography
          sx={{ position: "relative", textAlign: "center", fontWeight: 700 }}
        >
          AI Generated User Review Summary
        </Typography>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          overflowY: "auto",
          height: "100%",
          p: 3,
        }}
      >
        {loading ? (
          <Typography>Loading user review summary...</Typography>
        ) : carDetails && reviewData ? (
          <Box>
            {/* Total Reviews */}
            {reviewData.totalReviews && (
              <Typography
                sx={{ fontWeight: "bold", color: mode=="dark" ? "#fff": "#000", mb: 1 }}
                variant="subtitle1"
              >
                Total Reviews:
                <Typography
                  component="span"
                  sx={{ color: mode=="dark"? "#fff" : "#000", fontSize: "14px", paddingLeft: "5px" }}
                >
                  {reviewData.totalReviews}
                </Typography>
              </Typography>
            )}

            {/* Review Summary */}
            {reviewData.summary && (
              <Typography
                sx={{ fontWeight: 700, color: mode=="dark"? "#fff" : "#000", mt: 2 }}
                variant="subtitle1"
              >
                Review Summary:
                <Typography
                  component="span"
                  sx={{
                    color: mode=="dark"? "#fff" : "black",
                    fontWeight: 400,
                    fontSize: "14px",
                    paddingLeft: "5px",
                  }}
                >
                  {reviewData.summary}
                </Typography>
              </Typography>
            )}

            {/* Sentiment */}
            {reviewData.sentiment && (
              <Typography
                sx={{ fontWeight: 700, color: mode=="dark"? "#fff" : "#000", mt: 2 }}
                variant="subtitle1"
              >
                Sentiment:
                <Typography
                  component="span"
                  sx={{
                    color: mode=="dark"? "#fff" : "black",
                    fontWeight: 400,
                    fontSize: "14px",
                    paddingLeft: "5px",
                  }}
                >
                  {reviewData.sentiment}
                </Typography>
              </Typography>
            )}

            {/* Issues */}
            {reviewData.issues && reviewData.issues.length > 0 && (
              <>
                <Typography
                  sx={{ fontWeight: 700, color:mode=="dark"? "#fff" : "#000", mt: 3 }}
                  variant="subtitle1"
                >
                  Issues:
                </Typography>
                <Box
                  component="ul"
                  sx={{ pl: 3, listStyle: "none", m: 0, p: 0 }}
                >
                  {reviewData.issues.map((issue, index) => (
                    <Box
                      component="li"
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 1,
                        borderRadius: "8px",
                        px: 1,
                        py: 0.5,
                      }}
                    >
                      <CheckCircle
                        sx={{ color: mode=="dark"? "#fff" : "#000", fontSize: 16, mr: 1 }}
                      />
                      <Typography variant="body2" sx={{ fontSize: "14px" }}>
                        {issue}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </>
            )}

            {/* Benefits */}
            {reviewData.benefits && reviewData.benefits.length > 0 && (
              <>
                <Typography
                  sx={{ fontWeight: 700, color: mode=="dark"? "#fff" : "#000", mt: 3 }}
                  variant="subtitle1"
                >
                  Benefits:
                </Typography>
                <Box
                  component="ul"
                  sx={{ pl: 3, listStyle: "none", m: 0, p: 0 }}
                >
                  {reviewData.benefits.map((benefit, index) => (
                    <Box
                      component="li"
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 1,
                        borderRadius: "8px",
                        px: 1,
                        py: 0.5,
                      }}
                    >
                      <CheckCircle
                        sx={{ color: mode=="dark"? "#fff" : "#000", fontSize: 16, mr: 1 }}
                      />
                      <Typography variant="body2" sx={{ fontSize: "14px" }}>
                        {benefit}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </Box>
        ) : (
          <Typography>No review summary available.</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SentimentDialog;
