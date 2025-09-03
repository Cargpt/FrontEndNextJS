"use client";

import React from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Divider,
  useTheme,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ElectricCarIcon from "@mui/icons-material/ElectricCar";
import InsightsIcon from "@mui/icons-material/Insights";
import SecurityIcon from "@mui/icons-material/Security";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { useRouter } from "next/navigation";
import { useColorMode } from "@/Context/ColorModeContext";
import { motion } from "framer-motion";
import BrandName from "@/components/common/BrandName";
import CountUp from "react-countup";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function AboutContent(): React.ReactElement {
  const theme = useTheme();
  const { mode } = useColorMode();
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: mode === "dark" ? theme.palette.background.paper : "grey.100",
      }}
    >
      {/* Blue Navbar */}
      <AppBar position="static" sx={{ bgcolor: "#1976d2", mb: 1 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="back" onClick={() => router.back()}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            About <BrandName />
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        {/* Header Section */}
        <Stack spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
          {/* Subtitle Chip (fade in) */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            <Chip
              label={
                <span>
                  About <BrandName />
                </span>
              }
              color="primary"
              variant={mode === "dark" ? "filled" : "outlined"}
              sx={{ fontWeight: 700 }}
            />
          </motion.div>

          {/* Heading */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.7 }}
          >
            <Typography variant="h3" component="h1" fontWeight={900}>
              About Us
            </Typography>
          </motion.div>

          {/* Description */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.9 }}
          >
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 900, textAlign: "center" }}
            >
              <BrandName /> is your intelligent automotive companion. We leverage
              advanced AI to help you discover the perfect car tailored to your
              needs and budget. From personalized recommendations and detailed
              comparisons to up-to-date market insights, we make car shopping
              smarter, faster, and hassle-free.
            </Typography>
          </motion.div>
        </Stack>

        {/* Mission + Stats */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
          }}
        >
          {/* Mission */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ duration: 1 }}
          >
            <Card elevation={0} sx={{ height: "100%", borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h5" fontWeight={800} gutterBottom>
                  Our Mission
                </Typography>
                <Typography color="text.secondary">
                  We empower buyers with trustworthy insights and clear
                  guidance, reducing the stress of decision-making and saving
                  time at every step of the journey.
                </Typography>
                <Divider sx={{ my: 3 }} />
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2,
                  }}
                >
                  <Feature
                    icon={<ElectricCarIcon color="primary" />}
                    title="Smart Matching"
                    description="AI-powered car recommendations based on your needs and usage."
                  />
                  <Feature
                    icon={<InsightsIcon color="primary" />}
                    title="Market Insights"
                    description="Real-time pricing trends and ownership cost projections."
                  />
                  <Feature
                    icon={<SecurityIcon color="primary" />}
                    title="Trust & Privacy"
                    description="Your data stays secure. We follow strict privacy best practices."
                  />
                  <Feature
                    icon={<SupportAgentIcon color="primary" />}
                    title="Human Support"
                    description="Need help? Our advisors are ready to guide you."
                  />
                </Box>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ duration: 1.2 }}
          >
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 3,
                p: 2,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                  width: "100%",
                }}
              >
                <Stat value="250K+" label="Comparisons run" />
                <Stat value="98%" label="User satisfaction" />
                <Stat value="50+" label="Brands covered" />
                <Stat value="24/7" label="Support availability" />
                <Stat value="2 min" label="Average recommendation time" />
                <Stat value="10,000+" label="Cars compared per month" />
              </Box>
            </Card>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
}

/* Stat Component */
function Stat({ value, label }: { value: string; label: string }) {
  const theme = useTheme();

  const numberMatch = value.match(/^\d+[,.]?\d*/);
  const isAnimated = !!numberMatch && !value.includes("/");

  let end = 0;
  let suffix = "";
  if (isAnimated && numberMatch) {
    end = Number(numberMatch[0].replace(/,/g, ""));
    suffix = value.slice(numberMatch[0].length);
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.8 }}
      variants={fadeInUp}
      transition={{ duration: 0.7 }}
    >
      <Box
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          p: 3,
          textAlign: "center",
        }}
      >
        <Typography variant="h4" fontWeight={900} gutterBottom>
          {isAnimated ? (
            <CountUp
              start={0}
              end={end}
              duration={2}
              separator=","
              suffix={suffix}
              enableScrollSpy
              scrollSpyDelay={0}
            />
          ) : (
            value
          )}
        </Typography>
        <Typography color="text.secondary">{label}</Typography>
      </Box>
    </motion.div>
  );
}

/* Feature item */
function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      transition={{ duration: 0.7 }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        {icon}
        <Box>
          <Typography fontWeight={700}>{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
      </Stack>
    </motion.div>
  );
}
