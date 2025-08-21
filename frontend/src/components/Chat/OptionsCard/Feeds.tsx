"use client";
import { Box, Paper, Typography, CircularProgress } from "@mui/material";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { axiosInstance1 } from "@/utils/axiosInstance";
import FeedDialog from "./FeedDialog";

interface typeProps {
  open: boolean;
  type: string | null;
  carData?: any; // Add carData to the interface
}

const Feeds = () => {
  const [carsData, setCarsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [dialog, setDialog] = useState<typeProps>({ open: false, type: null });
  const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const fetchDealers = async () => {
      try {
        const response = await axiosInstance1.get("/api/cargpt/carsdata/");
        setCarsData(response || []);
        console.log("API Response Data:", response);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDealers();
  }, []);

  useEffect(() => {
    Object.entries(scrollRefs.current).forEach(([tag, scrollContainer], index) => {
      if (!scrollContainer) return;

      const delay = 3000 + index * 1000; 
      const scrollInterval = setInterval(() => {
        scrollContainer.scrollBy({
          left: scrollContainer.clientWidth,
          behavior: "smooth",
        });
      }, delay);

      return () => clearInterval(scrollInterval);
    });
  }, [carsData]);

  const groupedCarsData = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    carsData.forEach((car) => {
      car.tags.forEach((tag: string) => {
        if (!groups[tag]) {
          groups[tag] = [];
        }
        groups[tag].push(car);
      });
    });
    return groups;
  }, [carsData]);

  console.log("Grouped Cars Data:", groupedCarsData);

  if (loading) {
    return (
      <Paper
        sx={{
          p: 2,
          width: "100%",
          height: "300px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper
        sx={{
          p: 2,
          width: "100%",
          height: "300px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Error: {error.message}
      </Paper>
    );
  }

  return (
    <>
      <Box
        sx={{
          width: "25%",
          ml: 2,
          display: "flex",
          flexDirection: "column",
          marginTop: "3.2rem",
        }}
      >
        {Object.entries(groupedCarsData).map(([tag, cars], index) => (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              pt: index !== 0 ? 0 : undefined, 
            }}
            key={tag}
          >
            <Typography
              sx={{
                py: 1,
                px: 1,
                fontWeight: "bold",
                fontSize: "1rem",
                textTransform: "capitalize",
              }}
            >
              {tag === "Latest" ? "News Feeds" : `${tag} Cars`}
            </Typography>
            <Box
              ref={(el: HTMLDivElement | null) => {
                scrollRefs.current[tag] = el;
              }}
              sx={{
                display: "flex",
                flexDirection: "row",
                overflowX: "hidden",
                scrollSnapType: "x mandatory",
                scrollBehavior: "smooth",
                "&::-webkit-scrollbar": { display: "none" },
                gap: "20px",
              }}
            >
              {cars.length > 0 ? (
                [...cars, ...cars, ...cars].map((car, index) => (
                  <Paper
                    key={`${tag}-${car.modelId}-${car.variantName}-${index}`}
                    elevation={2}
                    onClick={() => setDialog({ open: true, type: "feed", carData: car })}
                    sx={{
                      p: 2,
                      minWidth: "280px",
                      maxWidth: "341px",
                      flexShrink: 0,
                      borderRadius: 2,
                      border: "1px solid #e0e0e0",
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      position: "relative",
                      overflow: "hidden",
                      scrollSnapAlign: "start",
                      cursor: "pointer"
                    }}
                  >
                    {/* Ribbon */}
                    {tag === "Latest" && (
                      <Box
                        sx={{
                          position: "absolute",
                          right: -2,
                          top: 38,
                          backgroundColor: "rgb(25, 118, 210)",
                          color: "#fff",
                          fontWeight: "bold",
                          fontSize: "12px",
                          padding: "6px 32px",
                          borderBottomLeftRadius: "8px",
                          transform: "rotate(45deg)",
                          transformOrigin: "bottom right",
                        }}
                      >
                        {tag}
                      </Box>
                    )}

                    {/* Image */}
                    <Box
                      sx={{
                        width: "120px",
                        height: 90,
                        overflow: "hidden",
                        borderRadius: 2,
                      }}
                    >
                      <img
                        src={car?.image?.CarImageURL || ""}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </Box>

                    {/* Details */}
                    <Box
                      sx={{ display: "flex", flexDirection: "column", ml: 1 }}
                    >
                      <Typography sx={{ fontWeight: "bold", fontSize: "16px" }}>
                        {car.brandName} {car.modelName} {car.variantName}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "14px" }}
                      >
                        ₹ {car.price?.toLocaleString?.() ?? car.price}
                      </Typography>
                    </Box>
                  </Paper>
                ))
              ) : (
                <Typography>No cars found for {tag}.</Typography>
              )}
            </Box>
          </Paper>
        ))}
      </Box>
      {dialog.type === "feed" && (
        <FeedDialog
          open={dialog.open}
          onClose={() => setDialog({ open: false, type: null })}
          carData={dialog.carData} 
          backToPrevious={() => setDialog({ open: false, type: null })}
        />
      )}
    </>
  );
};

export default Feeds;
