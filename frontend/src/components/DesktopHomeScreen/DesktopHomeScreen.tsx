"use client"
import React from 'react'
import { Box, Typography, Button } from "@mui/material";
import Image from 'next/image';
import Link from 'next/link';

const DesktopHomeScreen = () => {
  return (
    <Box sx={{
      width: "100%",
      // height: "100vh", // Remove fixed height to allow content to dictate height
      background: "none", // Remove background color
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      pt: 0, // Reduced padding top
    }}>
      {/* Navbar */}
      <Box sx={{
        width: "80%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 4, // Reduced margin bottom
      }}>
             <Box
            sx={{
              ml: { xs: 1, sm: 1.5, md: 2 },
              width: { xs: 140, sm: 160, md: 220 },
              height: "auto",
            }}
          >
            <img 
            loading="lazy"
              src={"/assets/AICarAdvisor_transparent.png"}
              alt="Logo"
              width={220}
              height={50}
              style={{ width: "100%", height: "auto" }}
            />
          </Box>
        <Box sx={{display: "flex"}}>
          <Typography sx={{ mx: 2, textDecoration: "none", color: "black", fontSize: "15px", fontWeight: "500" }}>Home</Typography>
          <Typography sx={{ mx: 2, textDecoration: "none", color: "black", fontSize: "15px", fontWeight: "500" }}>Find My Car</Typography>
          <Typography sx={{ mx: 2, textDecoration: "none", color: "black", fontSize: "15px", fontWeight: "500" }}>Car Reviews</Typography>
          <Typography sx={{ mx: 2, textDecoration: "none", color: "black", fontSize: "15px", fontWeight: "500" }}>Compare Cars</Typography>
        </Box>
      </Box>

      {/* Hero Section */}
      <Box sx={{
        width: "80%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexGrow: 1,
      }}>
        <Box sx={{ maxWidth: "50%" }}>
          <Typography variant="h3" sx={{ fontWeight: "bold", mb: 2 }}>
            Find Your Perfect Car<br />in Minutes —<br />Powered by AI
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            Get personalized recommendations based on your budget, needs, and lifestyle.
          </Typography>
          <Button variant="contained" sx={{ mr: 2, py: 1.5, px: 3 }}>Start My Car Match</Button>
          <Button variant="outlined" sx={{ py: 1.5, px: 3 }}>Explore Cars</Button>
        </Box>
        <Box sx={{ position: "relative", width: "50%", height: "300px" }}> {/* Reduced height */}
          <Image src="/assets/cars.webp" alt="Cars" layout="fill" objectFit="contain" />
        </Box>
      </Box>

      {/* Why AI Car Advisor Section */}
      <Box sx={{
        width: "80%",
        mt: 8,
        pb: 4,
        textAlign: "center",
      }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 4 }}>Why AI Car Advisor</Typography>
        <Box sx={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap" }}>
          <Box sx={{ width: "30%", mb: 4 }}>
            <Image src="/assets/artificial-intelligence.png" alt="Smart Matching" width={60} height={60} />
            <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold" }}>Smart Matching</Typography>
            <Typography variant="body2">It finds the best cars for you</Typography>
          </Box>
          <Box sx={{ width: "30%", mb: 4 }}>
            <Image src="/assets/google-docs.png" alt="Total Transparency" width={60} height={60} />
            <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold" }}>Total Transparency</Typography>
            <Typography variant="body2">Compare specs, prices & reviews in one place</Typography>
          </Box>
          <Box sx={{ width: "30%", mb: 4 }}>
            <Image src="/assets/stop-watch.png" alt="Save Time & Money" width={60} height={60} />
            <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold" }}>Save Time & Money</Typography>
            <Typography variant="body2">Skip the guesswork and avoid bad deals</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default DesktopHomeScreen;