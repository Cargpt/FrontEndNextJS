"use client";

import React, { useState } from "react";
import { Box, Typography, Link as MuiLink } from "@mui/material";
import Link from "next/link";
import ContactModal from "../common/Dialogs/ContactModal/ContactModal";

const Footer: React.FC = () => {
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const handleContactModalOpen = () => {
    setContactModalOpen(true);
  };

  const handleContactModalClose = () => {
    setContactModalOpen(false);
  };
  return (
    <footer>
      <Box
        sx={{
          bgcolor: "rgba(238, 238, 239, 1)",
          padding: "10px",
          textAlign: "center",
          height: "70px",
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          width: "100%",
          overflow: "hidden",
          zIndex: 1000,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          &copy; {new Date().getFullYear()} AICarAdvisor. All Rights Reserved.
        </Typography>
        <Box sx={{ mt: 1 }}>
          <MuiLink component={Link} href="/about" sx={{ mx: 2 }}>
            About Us
          </MuiLink>
          <MuiLink
            component="button"
            onClick={handleContactModalOpen}
            sx={{ mx: 2, cursor: "pointer", textDecoration: "underline" }}
          >
            Contact
          </MuiLink>
          <MuiLink component={Link} href="/privacy" sx={{ mx: 2 }}>
            Privacy Policy
          </MuiLink>
        </Box>
      </Box>
      <ContactModal
        open={contactModalOpen}
        onClose={handleContactModalClose}
      />
    </footer>
  );
};

export default Footer;
