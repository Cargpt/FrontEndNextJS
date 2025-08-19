"use client";
import { Box, Paper } from "@mui/material";
import React from "react";

const DealerList = () => {
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
          height: "300px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Dealer List
      </Paper>
      {/* You can add more components here for the right sidebar */}
    </Box>
  );
};

export default DealerList;
