"use client";
import React from "react";
import Main from "../components/Main";
import Navigations from "../components/Navigations/Navigations";
import { Box, CircularProgress } from "@mui/material";
const CarOfTheDay = React.lazy(() => import("../components/Cars/CarOfTheDay"));

type Props = {};

export default function page({}: Props) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Main />

      <Navigations />
    </>
  );
}
