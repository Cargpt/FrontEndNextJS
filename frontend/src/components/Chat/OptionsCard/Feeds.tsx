"use client";
import { Box, Paper, Typography, CircularProgress, Chip } from "@mui/material";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { axiosInstance1 } from "@/utils/axiosInstance";
import FeedDialog from "./FeedDialog";
import { formatExpectedLaunch, formatInternational } from "@/utils/services";
import { useChats } from "@/Context/ChatContext";

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
  const { setMessages } = useChats();

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

  const categories = [
  [1, "Upcoming"],
  [10, "Latest"],

  [2, "Most Searched"],
  [3, "Best Mileage"],
  [4, "Best Market Resale"],
  [5, "Best Electric"],
  [6, "Best Diesel"],
  [7, "Best Resale"],
  [8, "Popular"],
  [9, "Trending"],
  [11, "luxury"],
] as const;

  console.log("groupedCarsData", groupedCarsData)
  return (
    <>
      <Box
        sx={{
       width: "25%",
        ml: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        overflowY: "auto",
        maxHeight: "95vh",

        // Optional: Scrollbar styling
        scrollbarWidth: "thin",
        scrollbarColor: "transparent transparent",
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(0,0,0,0.1)",
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "transparent",
        },
      
        }}
      >
        {categories.map((tag, index) => {
          const cars = groupedCarsData[tag[1]] || [];
          if (cars.length === 0) return null; // Skip rendering if no cars in this category
          return (
                      <Paper
            elevation={0}
            sx={{
              p: 2,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              pt: tag[1] !== "Upcoming" ? 0 : "4.2rem", 
              pb:0
            }}
            key={tag[1]}
          >
            <Typography
              sx={{
                py: 1,
                px: 1,
                fontSize:"12px",
                fontWeight:"700",
                color: "text.primary",
                textTransform: "capitalize",
              }}
            >
              {tag[1] === "Latest" ? "News Feeds" : `${[tag[1]]} Cars`}
            </Typography>
            <Box
              ref={(el: HTMLDivElement | null) => {
                scrollRefs.current[tag[1]] = el;
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
              {cars.length > 0 &&(
                [...cars, ...cars, ...cars].map((car, index) => (
                  <Paper
                    key={`${tag[1]}-${car.modelId}-${car.variantName}-${index}`}
                    elevation={2}
                    onClick={async () => {
                      if (tag[1] === "Upcoming") {
                        setDialog({ open: true, type: "feed", carData: car });
                      } else {
                        const userMessage = {
                          id: String(Date.now()),
                          message: "Show car that fit my references",
                          sender: "user" as const,
                          render: "text" as const,
                        };
                        setMessages((prevMessages) => [...prevMessages, userMessage]);

                        const variantID = car.variantID;
                        if (variantID) {
                          try {
                            const response = await axiosInstance1.post("/api/cargpt/compare/", { car_ids: [variantID] });
                            console.log("Compare API Response:", response);
                            setMessages((prevMessages) => [
                              ...prevMessages,
                              {
                                id: String(Date.now() + 1),
                                sender: "bot",
                                render: "carComponent" as const, // New render type for Car.tsx
                                data: { "comparedCars": response.data }, // Wrap the response data in an object
                              },
                            ]);
                          } catch (error) {
                            console.error("Error calling compare API:", error);
                            setDialog({ open: true, type: "feed", carData: car });
                          }
                        } else {
                          console.warn("variantID is undefined for car:", car);
                          setDialog({ open: true, type: "feed", carData: car });
                        }
                      }
                    }}
                    sx={{
                      p: 2,
                      minWidth: "341px",
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
                      cursor: "pointer",
                      height:"60px"
                    }}
                  >
                    {/* Ribbon */}
                    {tag[1] === "Latest" && (
                      <Box
                        sx={{
                          position: "absolute",
                          right: -2,
                          top: 38,
                          backgroundColor: "rgb(25, 118, 210)",
                          color: "#fff",
                          fontWeight: "bold",
                          fontSize: "10px",
                          padding: "6px 32px",
                          borderBottomLeftRadius: "8px",
                          transform: "rotate(45deg)",
                          transformOrigin: "bottom right",
                        }}
                      >
                        { tag[1] }
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

                      {
                        tag[1] === "Upcoming" ? 
                        <Typography sx={{fontSize: "12px", color: "text.primary", mt:1}}>
                        {car.brandName} {car.modelName} 
                      </Typography>
                      :
                       <Typography sx={{ color: "text.primary", fontSize: "12px",  }}>
                        {car.brandName} {car.modelName} {car.variantName}
                      </Typography>
                      }

                      {
                        tag[1] === "Upcoming" ? 
                        (<Typography
                        variant="body2"
                        color="text.primary"
                        sx={{ fontSize: "10px", fontWeight:"700" }}
                        >
                        ₹ {formatInternational(Number(car?.price_min) ?? Number(car?.price_min))} -  ₹ {formatInternational(Number(car?.price_max) ?? Number(car?.price_max))}
                        <span style={{color: "text.secondary", fontSize:"10px", paddingLeft:"13px"}}>Estimated Price</span>


                        </Typography>)

                        :
                        (
                           <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{ fontSize: "10px", fontWeight:"700" }}
                      >
                        ₹ {formatInternational(car.price ?? car?.price)}
                      </Typography>
                        )
                      }

{tag[1] === "Upcoming" && car.datetime && (
  <Chip
    label={formatExpectedLaunch(car.datetime)}
    size="small"
        variant="outlined"
    sx={{
      fontSize: "9px",
      fontWeight: 500,
      bgcolor: "transparent",   // light gray background
      color: "text.secondary",        // dark gray text
      border:"none",  // subtle border
      marginTop:"4px"
    }}

  />
)}
                     
                     
                    </Box>
                  </Paper>
                ))
              )}
            </Box>
          </Paper>
          )
        })}
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
