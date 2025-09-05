"use client";

import React from "react";
import BrandName from "@/components/common/BrandName";
import { Box, Typography, Link as MuiLink } from "@mui/material";
import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <footer>
      <Box
        sx={{
          bgcolor: "rgba(238, 238, 239, 1)",
          paddingX: "10px",
          textAlign: "center",
         
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          width: "100%",
          overflow: "hidden",
          zIndex: 1000,
          paddingBottom: `0px`,

        }}
      >
        <Typography variant="body2" color="text.secondary">
          &copy; {new Date().getFullYear()} <BrandName />. All Rights Reserved.
        </Typography>
        <Box sx={{ mt: 1 }}>
          <MuiLink component={Link} href="/about" sx={{ mx: 2 }}>
            About Us
          </MuiLink>
          <MuiLink component={Link} href="/contact" sx={{ mx: 2 }}>
            Contact
          </MuiLink>
          <MuiLink component={Link} href="/privacy" sx={{ mx: 2 }}>
            Privacy Policy
          </MuiLink>
        </Box>
      </Box>
    </footer>
  );
};

export default Footer;
