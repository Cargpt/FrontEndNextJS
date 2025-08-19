"use client";
import { Box, Paper, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { axiosInstance1 } from "@/utils/axiosInstance";

const DealerList = () => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchDealers = async () => {
      try {
        const response = await axiosInstance1.post(
          "/api/dealers/city-dealers/",
          { city: "kanpur" }
        );
        console.log("API Response:", response);
        console.log("API Response Data:", response.data);
        setDealers(response);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDealers();
  }, []);

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
        Loading Dealers...
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

  console.log(dealers)
  return (
    <Box
      sx={{
        width: "20%",
        minWidth: "150px",
        ml: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {/* Dealer List */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          width: "100%", // Make the card take full width
          height: "300px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {dealers?.length > 0 ? (
          <div>
            {dealers.map((dealer: any) => (
              <Paper
                key={dealer.id}
                elevation={2}
                sx={{
                  p: 2, // Increased padding
                  mb: 2, // Increased margin-bottom
                  borderRadius: 2, // Slightly more rounded corners
                  backgroundColor: "#ffffff", // A clean white background
                  border: "1px solid #e0e0e0", // Subtle border
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5, // Small gap between text elements
                }}
              >
                <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>{dealer.name}</Typography>
                <Typography variant="body2" color="text.secondary">{dealer.address}</Typography>
                <Typography variant="body2" color="primary.main">{dealer.phone}</Typography>
              </Paper>
            ))}
          </div>
        ) : (
          <Typography>No dealers found for Kanpur.</Typography>
        )}
      </Paper>
      {/* You can add more components here for the right sidebar */}
    </Box>
  );
};

export default DealerList;
