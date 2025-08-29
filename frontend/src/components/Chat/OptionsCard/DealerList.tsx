"use client";
import { Box, Paper, Typography, CircularProgress } from "@mui/material";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { axiosInstance1 } from "@/utils/axiosInstance";
import { useCookies } from "react-cookie";
import { useRouter } from "next/navigation";

const DealerList = () => {
  const [dealers, setDealers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [visibleCount, setVisibleCount] = useState(3);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
const [cookies]=useCookies(['currentCity'])
const router =useRouter()

const fetchDealers = async () => {
    try {
      const response = await axiosInstance1.post("/api/dealers/city-dealers/", {
        city: cookies?.currentCity || "Noida",
      });
      console.log("API Response:", response.data);
      setDealers(response || []);
    } catch (err: any) {
      console.error("Error fetching dealers:", err);
      if (err?.status === 401) {
        router.push("/"); // ✅ redirect to home
      } else {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
   
    fetchDealers();
  }, [cookies.currentCity]);

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
            fontSize: "16px",
            color: "text.primary",
          }}
        >
          Local dealers around you
        </Typography>

        {dealers.length > 0 ? (
          <>
            {dealers.slice(0, visibleCount).map((dealer) => (
              <Paper
                key={dealer.id}
                elevation={2}
                sx={{
                  p: 2,
                  mb: 1,
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                  height:"90px"
                }}
              >
                <Typography sx={{ color: "text.primary", fontSize: "12px" }}>
                  {dealer.name}
                </Typography>
                {/* <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "14px" }}
                >
                  {dealer.address}
                </Typography> */}

                {dealer.phone && (
                  <Typography variant="body2" color="primary.main" sx={{ fontSize: "11px" }}>
                    📞 {dealer.phone}
                  </Typography>
                )}

                {dealer.hours && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: dealer.hours.includes("Open") ? "green" : "red",
                      fontWeight: 700,
                      fontSize:"10px"
                    }}
                  >
                    🕒 {dealer.hours}
                  </Typography>
                )}

                {(dealer.rating || dealer.review_count) && (
                  <Typography variant="body2" color="text.secondary" 
                   sx={{ fontSize: "10px",  }}
                  >
                    ⭐ {dealer.rating ?? "N/A"}{" "}
                    {dealer.review_count
                      ? `(${dealer.review_count} reviews)`
                      : ""}

                     
                  </Typography>
                )}
              </Paper>
            ))}

            {/* Infinite scroll trigger */}
            <div ref={sentinelRef} style={{ height: 1 }} />
          </>
        ) : (
          <Typography>No dealers found for {cookies?.currentCity || "Noida"}.</Typography>
        )}
      </Paper>
    </Box>
  );
};

export default DealerList;
