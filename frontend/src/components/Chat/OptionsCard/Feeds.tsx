"use client";
import { Box, Paper, Typography, CircularProgress } from "@mui/material";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { axiosInstance1 } from "@/utils/axiosInstance";

const Feeds = () => {
  const [dealers, setDealers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const scrollInterval = setInterval(() => {
      scrollContainer.scrollBy({ left: scrollContainer.clientWidth, behavior: "smooth" });
    }, 3000);

    return () => clearInterval(scrollInterval);
  }, [dealers]);

  const displayedDealers = useMemo(() => {
    if (dealers.length === 0) return [];
    return [...dealers, ...dealers, ...dealers];
  }, [dealers]);

  if (loading) {
    return (
      <Paper sx={{ p: 2, width: "100%", height: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2, width: "100%", height: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Error: {error.message}
      </Paper>
    );
  }

  return (
    <Box sx={{ width: "25%", ml: 2, display: "flex", flexDirection: "column", gap: 2, overflowY: "auto", maxHeight: "90vh" }}>
      <Paper elevation={0} sx={{ p: 2, width: "100%", display: "flex", flexDirection: "column", marginTop: "3.2rem" }}>
        <Typography sx={{ py: 1, px: 1, fontWeight: "bold", fontSize: "1rem" }}>News Feeds</Typography>
        <Box
          ref={scrollRef}
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
          {dealers.length > 0 ? (
            displayedDealers.map((dealer, index) => (
              <Paper
                key={`${dealer.CarID}-${index}`}
                elevation={2}
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
                }}
              >
                {/* Ribbon */}
                <Box
                  sx={{
                    position: "absolute",
                    right: -1,
                    backgroundColor: "rgb(25, 118, 210)",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "12px",
                    padding: "6px 20px",
                    borderBottomLeftRadius: "8px",
                    transform: "rotate(45deg)",
                    transformOrigin: "bottom right",
                  }}
                >
                  New Launch
                </Box>

                {/* Image */}
                <Box sx={{ width: "120px", height: 90, overflow: "hidden", borderRadius: 2 }}>
                  <img src={dealer?.Images?.[0]?.CarImageURL || ""} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </Box>

                {/* Details */}
                <Box sx={{ display: "flex", flexDirection: "column", ml: 1 }}>
                  <Typography sx={{ fontWeight: "bold", fontSize: "16px" }}>
                    {dealer.Brand} {dealer.Model} {dealer.Variant}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "14px" }}>
                    ₹ {dealer.Price?.toLocaleString?.() ?? dealer.Price}
                  </Typography>
                </Box>
              </Paper>
            ))
          ) : (
            <Typography>No cars found.</Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Feeds;
