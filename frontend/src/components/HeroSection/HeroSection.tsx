"use client"
import React from "react";
import { Box, Typography, Button, Rating, useScrollTrigger, IconButton, Badge, Menu, MenuItem, ListItemText, useTheme } from "@mui/material";
import Slider,  { Settings } from "react-slick";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import BrandName from "@/components/common/BrandName";
import { useCookies } from "react-cookie";
import ThemeToggle from "@/components/Theme/ThemeToggle";
import { useColorMode } from "@/Context/ColorModeContext";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNotifications } from "@/Context/NotificationContext";
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";
import AskLocation from "@/components/Header/AskLocation";
import CityInputForm from "@/components/Header/CityInputForm";
import { axiosInstance1 } from "@/utils/axiosInstance";
import { useChats } from "@/Context/ChatContext";
import LoginDialog from "@/components/common/Dialogs/LoginDialog";
import SignupDialog from "@/components/Auth/SignupDialog";
import { useLoginDialog } from "@/Context/LoginDialogContextType";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};

const HeroSection = () => {
  const scrolled = useScrollTrigger({ disableHysteresis: true, threshold: 10 });
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();
  const [cookies, setCookie, removeCookie] = useCookies(["selectedOption", "currentCity", "locationPermissionAcknowledged", "user"]);
  const { notifications } = useNotifications();
  const unreadCount = notifications.filter((n: { read: boolean }) => !n.read).length;
  const isNative = Capacitor.isNativePlatform();
  const [enterCitydialogOpen, setEnterCityDialogOpen] = React.useState(false);
  const [locationDenied, setLocationDenied] = React.useState(false);
  const [city, setCity] = React.useState<string | null>(null);
  const toggleCity = () => setEnterCityDialogOpen(!enterCitydialogOpen);
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  const openMenu = (e: React.MouseEvent<HTMLElement>) => setMenuAnchor(e.currentTarget);
  const closeMenu = () => setMenuAnchor(null);
  const { open: openLoginDialoge, hide, show } = useLoginDialog();
  const [showSignUpState, setshowSignUpState] = React.useState<boolean>(false);
  const showSignUP = () => { setshowSignUpState(true); hide(); };
  const hideSignUP = () => setshowSignUpState(false);
  const handleLogout = () => {
    removeCookie('user', { path: '/' });
    closeMenu();
    router.push('/');
  };
  const { toggleColorMode } = useColorMode();

  const goFindMyCar = () => {
    setCookie("selectedOption", "I know exactly what I want", { path: "/" });
    router.push("/home");
  };
  const goResearch = () => {
    setCookie("selectedOption", "I need advisor support", { path: "/" });
    router.push("/home");
  };
  const goAskAI = () => {
    setCookie("selectedOption", "Ask AI", { path: "/" });
    router.push("/home");
  };

  const handleBookmarkClick = () => {
    if ((cookies as any).user) {
      setCookie("selectedOption", "I know exactly what I want", { path: "/" });
      router.push("/bookmarks");
    } else {
      alert("Please log in to view bookmarks.");
    }
  };

  const onCLoseLocationPopup = () => setLocationDenied(false);
  const handleLocationAcknowledge = () => {
    setCookie("locationPermissionAcknowledged", true, { path: "/", maxAge: 60 * 60 * 24 * 365 });
    setLocationDenied(false);
  };

  const getUserLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
    try {
      if (isNative) {
        const permission = await Geolocation.requestPermissions();
        if ((permission as any).location !== 'granted') return null;
        const position = await Geolocation.getCurrentPosition();
        return { latitude: position.coords.latitude, longitude: position.coords.longitude };
      } else if (navigator.geolocation) {
        return await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
            () => reject(null)
          );
        });
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleLocation = async (isClose: boolean) => {
    const coords = await getUserLocation();
    if (!coords) {
      setLocationDenied(true);
      setCookie("currentCity", "", { path: "/" });
      setCookie("locationPermissionAcknowledged", true, { path: "/", maxAge: 60 * 60 * 24 * 365 });
      return;
    }
    try {
      const res = await axiosInstance1.post("/api/cargpt/coordinate-to-city/", { lat: coords.latitude, lng: coords.longitude });
      if ((res as any)?.city) {
        setCity((res as any).city);
        setCookie("currentCity", (res as any).city, { path: "/", maxAge: 60 * 60 * 24 * 365 });
        if (isClose) toggleCity();
        setCookie("locationPermissionAcknowledged", true, { path: "/", maxAge: 60 * 60 * 24 * 365 });
      }
    } catch {}
  };

  React.useEffect(() => {
    // Auto-try location if not set and not acknowledged
    const hasCity = (cookies as any).currentCity;
    const acknowledged = (cookies as any).locationPermissionAcknowledged;
    if (!hasCity && !acknowledged && !enterCitydialogOpen) {
      handleLocation(false);
    }
    // Keep local state in sync if cookie changes externally
    if (hasCity && hasCity !== city) {
      setCity(hasCity as string);
    }
  }, [(cookies as any).currentCity, (cookies as any).locationPermissionAcknowledged, enterCitydialogOpen]);

  const handleCitySubmit = (cityValue: string) => {
    setCity(cityValue);
    setCookie("currentCity", cityValue, { path: "/", maxAge: 60 * 60 * 24 * 365 });
    toggleCity();
  };

const {messages, setMessages} = useChats();
  const CompareCar = () => {
    setCookie("selectedOption", "Compare Car.", { path: "/" });
    const compareIntroMessage = {
      id: String(Date.now()),
      message: "Please select cars to compare.",
      render: "text" as const,
      sender: "user" as const,
    };
    const msgs :Message[]=  [
      ...messages,
      compareIntroMessage,
      {
        id: String(Date.now() + 1),
        render: "compareVsSelector" as const,
        sender: "bot" as const,
        message: ""
      }
    ]
    setMessages(msgs);
    router.push("/home");

  }
  return (
    <Box
      sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", background: theme.palette.background.default }}
      component={motion.div}
      initial="hidden"
      animate="visible"
    >
      {/* Navbar (fixed + animated on scroll) */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          width: "100%",
          background: scrolled ? (isDark ? "rgba(10,10,10,0.7)" : "rgba(255,255,255,0.9)") : "transparent",
          boxShadow: scrolled ? "0 4px 12px rgba(0,0,0,0.08)" : "none",
          backdropFilter: scrolled ? "saturate(180%) blur(8px)" : "none",
          transition: "all 220ms ease",
          paddingTop: 'env(safe-area-inset-top)', // Add padding for status bar
        }}
        data-testid="navbar"
        className="navbar-fixed"
      >
        <Box
          component={motion.div}
          variants={fadeIn}
          sx={{
            width: "80%",
            mx: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: scrolled ? 1 : 2,
          }}
        >
        <Box sx={{ ml: { xs: 1, sm: 1.5, md: 2 }, width: { xs: 140, sm: 160, md: 220 } }}>
          <motion.img
            src={"/assets/logo.jpeg"}
            alt="Logo"
            width={220}
            height={50}
            style={{ width: "100%", height: "auto" }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          {["Home", "Find My Car", "Compare Car", "Ask AI"].map((item, i) => (
            <Typography
              key={item}
              component={motion.p}
              variants={fadeInUp}
              transition={{ delay: i * 0.12 }}
              sx={{
                mx: 2,
                textDecoration: "none",
                color: item === "Home" ? theme.palette.primary.main : theme.palette.text.primary,
                fontSize: "15px",
                fontWeight: item === "Home" ? 700 : 500,
                cursor: "pointer",
                pb: 0.5,
                borderBottom: item === "Home" ? `2px solid ${theme.palette.primary.main}` : "none",
                "&:hover": { color: theme.palette.primary.main },
              }}
              aria-current={item === "Home" ? "page" : undefined}
              onClick={() => {
                if (item === "Find My Car") {
                  goFindMyCar();
                } else if (item === "Ask AI") {
                  goAskAI();
                }
                else if (item === "Compare Car") {
                  CompareCar();
                }
              }}
            >
              {item}
            </Typography>
          ))}
          {/* Location and menu */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: 2 }}>
            <Box onClick={toggleCity} sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1, borderRadius: 2, cursor: "pointer" }}>
              <LocationOnOutlinedIcon sx={{ color: "#555", fontSize: 20 }} />
              <Box sx={{ fontSize: 14, color: theme.palette.text.primary }}>{city || (cookies as any).currentCity || "Select City"}</Box>
            </Box>
            <IconButton onClick={openMenu} size="small" sx={{ bgcolor: "#eeeeef" }}>
              <MenuOutlinedIcon sx={{ color: "#555" }} />
            </IconButton>
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
              {!(cookies as any).user && (
                <MenuItem onClick={() => { show(); closeMenu(); }}>
                  <ListItemText primary="Sign In" />
                </MenuItem>
              )}
              {(cookies as any).user && (
                <MenuItem onClick={() => { router.push('/profile'); closeMenu(); }}>
                  <AccountCircleOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
                  <ListItemText primary="Profile" />
                </MenuItem>
              )}
              {(cookies as any).user && (
                <MenuItem onClick={() => { router.push('/booked-test-drive'); closeMenu(); }}>
                  <ListItemText primary="Booked Test Drive" />
                </MenuItem>
              )}
              <MenuItem onClick={() => { handleBookmarkClick(); closeMenu(); }} disabled={!(cookies as any).user}>
                <FavoriteBorderIcon fontSize="small" sx={{ mr: 1 }} />
                <ListItemText primary="Bookmarks" />
              </MenuItem>
              <MenuItem onClick={() => { router.push('/notifications'); closeMenu(); }}>
                <Badge badgeContent={unreadCount} max={999} color="error" sx={{ mr: 1 }}>
                  <NotificationsNoneIcon fontSize="small" />
                </Badge>
                <ListItemText primary="Notifications" />
              </MenuItem>
              <MenuItem onClick={() => { toggleColorMode(); closeMenu(); }} disableRipple>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}>
                  <ThemeToggle />
                  <Typography variant="body2">Light / Dark Mode</Typography>
                </Box>
              </MenuItem>
              {(cookies as any).user && (
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                  <ListItemText primary="Logout" />
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Box>
        </Box>
      </Box>

      {/* Spacer to offset fixed header height (more margin before first section) */}
      <Box sx={{ height: { xs: 72, sm: 88 }, width: '100%' }} />

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
              <Button onClick={goFindMyCar} variant="contained" sx={{ mr: 2, py: 1.5, px: 3, background: "#1976d2", "&:hover": { background: "#1565c0" } }}>
                Start My Car Match
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }}>
              <Button onClick={goResearch} variant="outlined" sx={{ py: 1.5, px: 3, color: "#1976d2", borderColor: "#1976d2" }}>
                Explore Cars
              </Button>
            </motion.div>
          </Box>
        </Box>

        <Box sx={{ position: "relative", width: "50%", height: "300px" }} component={motion.div} initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <img src="/assets/cars.webp" alt="Cars" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </Box>
      </Box>

      {/* Why AiCarAdvisor™ Section */}
      <Box sx={{ width: "80%", mt: 8, pb: 4, textAlign: "center" }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 4 }} component={motion.h2} variants={fadeInUp}>
          Why <BrandName />
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap" }}>
          {[
            { img: "/assets/artificial-intelligence.png", title: "Smart Matching", desc: "It finds the best cars for you" },
            { img: "/assets/google-docs.png", title: "Total Transparency", desc: "Compare specs, prices & reviews in one place" },
            { img: "/assets/stop-watch.png", title: "Save Time & Money", desc: "Skip the guesswork and avoid bad deals" },
          ].map((feature, i) => (
            <Box
              key={feature.title}
              sx={{ width: { xs: "100%", sm: "45%", md: "30%" }, mb: 4, p: 2, borderRadius: 2, background: isDark ? theme.palette.background.paper : "#f9f9f9", boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.35)" : "0 4px 12px rgba(0,0,0,0.06)" }}
              component={motion.div}
              variants={fadeInUp}
              transition={{ delay: i * 0.12 }}
              whileHover={{ translateY: -6 }}
            >
              <img src={feature.img} alt={feature.title} width={60} height={60} />
              <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold" }}>{feature.title}</Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{feature.desc}</Typography>
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
              sx={{ width: { xs: "100%", sm: "45%", md: "30%" }, mb: 4, p: 2, borderRadius: 2, background: theme.palette.background.paper, boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.35)" : "0 4px 12px rgba(0,0,0,0.04)" }}
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
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{step.desc}</Typography>
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
            { img: "/assets/user1.png", name: "Rahul Sharma", review: "AiCarAdvisor made car shopping stress-free and fun!", rating: 5 },
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
                  <Box sx={{ p: 3, borderRadius: 2, background: isDark ? theme.palette.background.paper : "#fafafa", boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.35)" : "0 4px 12px rgba(0,0,0,0.06)", minHeight: 180, textAlign: 'center', display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                    {/* <img src={user.img} alt={user.name} width={56} height={56} style={{ borderRadius: "50%", display: 'block' }} /> */}
                    <Typography variant="h6" sx={{ mt: 1.5, fontWeight: "bold" }}>{user.name}</Typography>
                    <Rating value={user.rating} precision={0.5} readOnly size="small" sx={{ mt: 0.5 }} />
                    <Typography variant="body2" sx={{ mt: 1, color: theme.palette.text.secondary }}>{user.review}</Typography>
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
          background: isDark ? theme.palette.background.paper : "#f5f5f5",
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
          <Button onClick={goFindMyCar} variant="contained" sx={{ py: 1.5, px: 4, fontSize: "16px", fontWeight: "bold", background: "#1976d2", "&:hover": { background: "#1565c0" } }}>
            Get Started
          </Button>
        </motion.div>
      </Box>

      {/* Location dialogs */}
      <AskLocation
        show={locationDenied}
        onClose={onCLoseLocationPopup}
        onAcknowledge={handleLocationAcknowledge}
      />
      <CityInputForm
        open={enterCitydialogOpen}
        onSubmit={handleCitySubmit}
        onClose={toggleCity}
        handleLocation={handleLocation}
      />
      {/* Auth dialogs */}
      <LoginDialog showSignUp={showSignUP} open={openLoginDialoge} onClose={hide} />
      <SignupDialog open={showSignUpState} onClose={hideSignUP} onSuccess={() => {}} />
    </Box>
  );
};

export default HeroSection;
