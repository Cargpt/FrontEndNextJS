"use client";

import React from "react";
import AskAIChat from "@/components/Chat/AskAIChat";
import { Box } from "@mui/material";

const AskAIPage = () => {

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "#faf8f0",
      }}
    >
      {/* Chat Interface */}
      <Box sx={{ flex: 1, display: "flex", justifyContent: "center", pt: 4 }}>
        <AskAIChat />
      </Box>
    </Box>
  );
};

export default AskAIPage; 