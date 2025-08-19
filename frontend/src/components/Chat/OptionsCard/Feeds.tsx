"use client";
import { Box, Paper, Typography, CircularProgress } from "@mui/material";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { axiosInstance1 } from "@/utils/axiosInstance";

const Feeds = () => {
  const [dealers, setDealers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  const [error, setError] = useState<any>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchDealers = async () => {
      try {
        const response = await axiosInstance1.get("/api/cargpt/info/");
        setDealers(response.data || []);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDealers();
  }, []);

  // IntersectionObserver for infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && visibleCount < dealers.length) {
        setVisibleCount((prev) => prev + 3);
      }
    },
    [visibleCount, dealers.length]
  );

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "20px",
      threshold: 1.0,
    };

    const observer = new IntersectionObserver(handleObserver, option);
    if (sentinelRef.current) observer.observe(sentinelRef.current);

    return () => {
      if (sentinelRef.current) observer.unobserve(sentinelRef.current);
    };
  }, [handleObserver]);

  if (loading) {
    return (
      <Paper
        elevation={3}
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
        elevation={3}
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
    <Box
      sx={{
        width: "25%",
        ml: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        overflowY: "auto",
        maxHeight: "90vh",
        scrollbarWidth: "thin", // Firefox
        scrollbarColor: "transparent transparent", // Firefox
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "transparent",
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "transparent",
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundImage: "none",
          marginTop: "3.2rem",
        }}
      >
        <Typography
          sx={{
            py: 1,
            px: 1,
            fontWeight: "bold",
            fontSize: "1.7rem",
          }}
        >
          News Feeds
        </Typography>

        {dealers.length > 0 ? (
          <>
            {dealers.slice(0, visibleCount).map((dealer) => (
              <Paper
                key={dealer.CarID}
                elevation={2}
                sx={{
                  p: 2,
                  mb: 1,
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                }}
              >
                {/* Image with ribbon */}
                <Box
                  sx={{
                    width: "100%",
                    height: 90,
                    overflow: "hidden",
                    borderRadius: 2,
                    position: "relative",
                  }}
                >
                  <img
                    src={dealer?.Images?.[0]?.CarImageURL || ""}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />

                  {/* Folded Ribbon Tag top-right */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: 120,
                      height: 40,
                      overflow: "visible",
                      pointerEvents: "none",
                      zIndex: 2,
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        right: -40,
                        top: 5,
                        backgroundColor: "#1976d2",
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: "12px",
                        padding: "6px 0",
                        textAlign: "center",
                        width: 160,
                        transform: "rotate(45deg)",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
                        userSelect: "none",
                        fontFamily: "Arial, sans-serif",
                        cursor: "default",
                        zIndex: 10,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Latest Launch
                    </Box>
                  </Box>
                </Box>

                {/* Car Details */}
                <Typography sx={{ fontWeight: "bold", fontSize: "16px" }}>
                  {dealer.Brand} {dealer.Model} {dealer.Variant}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "14px" }}
                >
                  ₹ {dealer.Price?.toLocaleString?.() ?? dealer.Price}
                </Typography>
              </Paper>
            ))}

            {/* Sentinel Element */}
            <div ref={sentinelRef} style={{ height: 1 }} />
          </>
        ) : (
          <Typography>No cars found.</Typography>
        )}
      </Paper>
    </Box>
  );
};

export default Feeds;
