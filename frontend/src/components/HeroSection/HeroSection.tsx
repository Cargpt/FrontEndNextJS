"use client"
import React from "react";
import { Box, Typography, Button, Rating } from "@mui/material";
import Slider,  { Settings } from "react-slick";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};

const HeroSection = () => {
  return (
    <Box
      sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", background: "#ffffff" }}
      component={motion.div}
      initial="hidden"
      animate="visible"
    >
      {/* Navbar */}
      <Box
        sx={{
          width: "80%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
        component={motion.div}
        variants={fadeIn}
      >
        <Box sx={{ ml: { xs: 1, sm: 1.5, md: 2 }, width: { xs: 140, sm: 160, md: 220 } }}>
          <motion.img
            src={"/assets/AICarAdvisor_transparent.png"}
            alt="Logo"
            width={220}
            height={50}
            style={{ width: "100%", height: "auto" }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
          />
        </Box>

        <Box sx={{ display: "flex" }}>
          {["Home", "Find My Car", "Car Reviews", "Compare Cars"].map((item, i) => (
            <Typography
              key={item}
              component={motion.p}
              variants={fadeInUp}
              transition={{ delay: i * 0.12 }}
              sx={{
                mx: 2,
                textDecoration: "none",
                color: "black",
                fontSize: "15px",
                fontWeight: "500",
                cursor: "pointer",
                "&:hover": { color: "#1976d2" },
              }}
            >
              {item}
            </Typography>
          ))}
        </Box>
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          width: "80%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexGrow: 1,
        }}
      >
        <Box component={motion.div} variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} sx={{ maxWidth: "50%" }}>
          <Typography variant="h3" sx={{ fontWeight: "bold", mb: 2 }} component={motion.h1} variants={fadeInUp}>
            Find Your Perfect Car<br />in Minutes —<br />Powered by AI
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }} component={motion.p} variants={fadeInUp}>
            Get personalized recommendations based on your budget, needs, and lifestyle.
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            <motion.div whileHover={{ scale: 1.03 }}>
              <Button variant="contained" sx={{ mr: 2, py: 1.5, px: 3, background: "#1976d2", "&:hover": { background: "#1565c0" } }}>
                Start My Car Match
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }}>
              <Button variant="outlined" sx={{ py: 1.5, px: 3, color: "#1976d2", borderColor: "#1976d2" }}>
                Explore Cars
              </Button>
            </motion.div>
          </Box>
        </Box>

        <Box sx={{ position: "relative", width: "50%", height: "300px" }} component={motion.div} initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <img src="/assets/cars.webp" alt="Cars" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </Box>
      </Box>

      {/* Why AI Car Advisor Section */}
      <Box sx={{ width: "80%", mt: 8, pb: 4, textAlign: "center" }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 4 }} component={motion.h2} variants={fadeInUp}>
          Why AI Car Advisor
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap" }}>
          {[
            { img: "/assets/artificial-intelligence.png", title: "Smart Matching", desc: "It finds the best cars for you" },
            { img: "/assets/google-docs.png", title: "Total Transparency", desc: "Compare specs, prices & reviews in one place" },
            { img: "/assets/stop-watch.png", title: "Save Time & Money", desc: "Skip the guesswork and avoid bad deals" },
          ].map((feature, i) => (
            <Box
              key={feature.title}
              sx={{ width: { xs: "100%", sm: "45%", md: "30%" }, mb: 4, p: 2, borderRadius: 2, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
              component={motion.div}
              variants={fadeInUp}
              transition={{ delay: i * 0.12 }}
              whileHover={{ translateY: -6 }}
            >
              <img src={feature.img} alt={feature.title} width={60} height={60} />
              <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold" }}>{feature.title}</Typography>
              <Typography variant="body2" sx={{ color: "rgba(0,0,0,0.7)" }}>{feature.desc}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* New: How It Works Section */}
      <Box sx={{ width: "80%", mt: 8, pb: 4, textAlign: "center" }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 4 }} component={motion.h2} variants={fadeInUp}>
          How It Works
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap" }}>
          {[ 
            { img: "/assets/search.png", title: "1. AI Search", desc: "Enter your budget, lifestyle, and preferences" },
            { img: "/assets/AIRecommendedCar.png", title: "2. Recommendations", desc: "Our AI suggests the best cars for you", crop: true },
            { img: "/assets/test-drive.png", title: "3. Test & Buy", desc: "Book a test drive and get exclusive deals" },
          ].map((step, i) => (
            <Box
              key={step.title}
              sx={{ width: { xs: "100%", sm: "45%", md: "30%" }, mb: 4, p: 2, borderRadius: 2, background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}
              component={motion.div}
              variants={fadeInUp}
              transition={{ delay: i * 0.14 }}
              whileHover={{ translateY: -6 }}
            >
              {step.crop ? (
                <Box sx={{ width: 60, height: 60, overflow: 'hidden', borderRadius: 1, mx: 'auto' }}>
                  <img src={step.img} alt={step.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
                </Box>
              ) : (
                <img src={step.img} alt={step.title} width={60} height={60} />
              )}
              <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold" }}>{step.title}</Typography>
              <Typography variant="body2" sx={{ color: "rgba(0,0,0,0.7)" }}>{step.desc}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* New: Testimonials Section (Slider) */}
      <Box sx={{ width: "80%", mt: 8, pb: 4, textAlign: "center" }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 4 }} component={motion.h2} variants={fadeInUp}>
          What Our Users Say
        </Typography>

        {(() => {
          const reviews = [
            { img: "/assets/user1.png", name: "Rahul Sharma", review: "AI Car Advisor made car shopping stress-free and fun!", rating: 5 },
            { img: "/assets/user2.png", name: "Priya Verma", review: "I saved two weeks of research and found my dream car.", rating: 4.5 },
            { img: "/assets/user3.png", name: "Amit Patel", review: "Super accurate recommendations. Highly recommended!", rating: 4.8 },
            { img: "/assets/avatar.png", name: "Neha Gupta", review: "Loved the comparison and price insights – very helpful.", rating: 4.7 },
            { img: "/assets/avator_main2.png", name: "Rohit Mehta", review: "Booking a test drive was seamless right from the app.", rating: 4.6 },
            { img: "/assets/user1.png", name: "Ananya Rao", review: "Clean UI and great suggestions based on my budget.", rating: 4.4 },
          ];
          const settings:Settings = {
            dots: true,
            arrows: false,
            infinite: true,
            autoplay: true,
            autoplaySpeed: 3500,
            speed: 500,
            slidesToShow: 3,
            slidesToScroll: 1,
            responsive: [
              { breakpoint: 1200, settings: { slidesToShow: 3 } },
              { breakpoint: 900, settings: { slidesToShow: 2 } },
              { breakpoint: 600, settings: { slidesToShow: 1 } },
            ],
          } as const;
          return (
            <Slider {...settings}>
              {reviews.map((user) => (
                <Box key={user.name} sx={{ px: 1.5, outline: 'none' }}>
                  <Box sx={{ p: 3, borderRadius: 2, background: "#fafafa", boxShadow: "0 4px 12px rgba(0,0,0,0.06)", minHeight: 180, textAlign: 'center', display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                    <img src={user.img} alt={user.name} width={56} height={56} style={{ borderRadius: "50%", display: 'block' }} />
                    <Typography variant="h6" sx={{ mt: 1.5, fontWeight: "bold" }}>{user.name}</Typography>
                    <Rating value={user.rating} precision={0.5} readOnly size="small" sx={{ mt: 0.5 }} />
                    <Typography variant="body2" sx={{ mt: 1, color: "rgba(0,0,0,0.7)" }}>{user.review}</Typography>
                  </Box>
                </Box>
              ))}
            </Slider>
          );
        })()}
      </Box>

      {/* New: Call to Action Section */}
      <Box
        sx={{
          width: "100%",
          background: "#f5f5f5",
          py: 6,
          textAlign: "center",
          mt: 8,
        }}
        component={motion.div}
        variants={fadeIn}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }} component={motion.h2} variants={fadeInUp}>
          Ready to Find Your Perfect Car?
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }} component={motion.p} variants={fadeInUp}>
          Start now and let AI match you with the best car deals!
        </Typography>
        <motion.div variants={fadeInUp}>
          <Button variant="contained" sx={{ py: 1.5, px: 4, fontSize: "16px", fontWeight: "bold", background: "#1976d2", "&:hover": { background: "#1565c0" } }}>
            Get Started
          </Button>
        </motion.div>
      </Box>
    </Box>
  );
};

export default HeroSection;
