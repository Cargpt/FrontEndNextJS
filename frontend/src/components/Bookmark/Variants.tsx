"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Stack,
  AppBar,
  Toolbar,
  IconButton,
  BottomNavigationAction,
  Skeleton,
  CircularProgress,
} from "@mui/material";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import KeyboardBackspaceSharpIcon from "@mui/icons-material/KeyboardBackspaceSharp";
import CloseIcon from "@mui/icons-material/Close";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useRouter } from "next/navigation";
import { useChats } from "@/Context/ChatContext";
import { useCookies } from "react-cookie";
import { axiosInstance1 } from "@/utils/axiosInstance";
import { formatInternational } from "@/utils/services";
import { useColorMode } from "../../Context/ColorModeContext";
import { useTheme } from "@mui/material/styles";
import { Capacitor } from "@capacitor/core";
import VolumeUpOutlinedIcon from '@mui/icons-material/VolumeUpOutlined';
import VolumeOffOutlinedIcon from '@mui/icons-material/VolumeOffOutlined';

type Car = {
  id: number;
  image: string;
  name: string;
  variant: string;
  price: string;
  CarAudioURL?: string;
  CarID: number;
  BrandName?: string;
  ModelName?: string;
  VariantName?: string;
  Price?: number;
  CarImageDetails?: Array<{ CarImageURL: string }>;
};

type Props = {
  bookmarks?: Car[];
};
// Bookmar
const Variants: React.FC<Props> = () => {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [ttsLoadingCards, setTtsLoadingCards] = useState<Set<number>>(new Set());

  const router = useRouter();
  const [cookies] = useCookies(["selectedOption", "user"]);
  const { mode } = useColorMode();
  const theme = useTheme();
  const isNative = Capacitor.isNativePlatform();
  const [isPlayingIndex, setIsPlayingIndex] = useState<number | null>(null);
  const { handleBookmark, setCars, cars } = useChats();
  const [isAutoplayPaused, setIsAutoplayPaused] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const onBack = () => router.back();

  const onclick = async (car: Car) => {
    await handleBookmark(car);
    router.push("/home");
  };

  const fetchBookmarks = async () => {
    try {
      setIsInitialLoading(true);
      
      const response = await axiosInstance1.get("/api/cargpt/bookmark/detailed/");
      
      if (response && Array.isArray(response)) {
        setBookmarks(response);
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      setBookmarks([]);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    if (cookies.user) {
      fetchBookmarks();
    }
  }, [cookies.user]);

  const getAudioUrl = async (car: Car, index: number) => {
    console.log("car", car);
    try {
      // Set loading state for this specific car
      setTtsLoadingCards(prev => new Set(prev).add(index));
      
      const response = await axiosInstance1.get(
        `/api/cargpt/cars/${car.CarID}/tts/`
      );
      
      // Remove loading state after successful fetch
      setTtsLoadingCards(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
      
      return response.tts_file;
    } catch (error) {
      console.error("Error fetching audio URL:", error);
      
      // Remove loading state on error
      setTtsLoadingCards(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
      
      return "";
    }
  };

  // Auto-play bookmarks audio sequentially
  useEffect(() => {
    if (bookmarks.length === 0) return;

    const currentCar = bookmarks[currentIndex];
    if (!currentCar) return;

    let isCancelled = false;

    const playAudio = async () => {
      try {
        const audioUrl = await getAudioUrl(currentCar, currentIndex);
        if (!audioUrl || isCancelled) return;

        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current
            .play()
            .catch((err) =>
              console.warn("Autoplay failed (user interaction required):", err)
            );

          const handleEnded = () => {
            if (currentIndex < bookmarks.length - 1) {
              setCurrentIndex((prev) => prev + 1);
            }
          };

          audioRef.current.addEventListener("ended", handleEnded);

          return () => {
            audioRef.current?.removeEventListener("ended", handleEnded);
            isCancelled = true;
          };
        }
      } catch (err) {
        console.error("Failed to fetch audio URL:", err);
      }
    };

    playAudio();
  }, [bookmarks]);

  // Autoplay from 0 on mount, then sequentially
  useEffect(() => {
    if (bookmarks.length === 0) return;
    playAudioAtIndex(currentIndex);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, [bookmarks]);

  // Core play function
  const playAudioAtIndex = async (index: number) => {
    const car = bookmarks[index];
    if (!car) return;

    const audioUrl = await getAudioUrl(car, index);
    if (!audioUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    audioRef.current.pause();
    audioRef.current.src = audioUrl;
    
    try {
      await audioRef.current.play();
      setIsPlayingIndex(car.CarID);
      setIsPlaying(true);
      setCurrentIndex(index);
    } catch (err) {
      console.warn("Autoplay failed:", err);
      return;
    }

    audioRef.current.onended = () => {
      setIsPlaying(false);
      setIsPlayingIndex(null);
      if (index < bookmarks.length - 1) {
        playAudioAtIndex(index + 1);
      }
    };

    audioRef.current.onpause = () => {
      setIsPlaying(false);
    };
  };

  // Toggle play/pause when user clicks
  const handlePlayClick = async (car: Car, index: number) => {
    if (isPlayingIndex === car.CarID) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        try {
          await audioRef.current?.play();
          setIsPlaying(true);
        } catch (err) {
          console.warn("Resume failed:", err);
        }
      }
      return;
    }

    await playAudioAtIndex(index);
  };

  // Render skeleton card for loading state
  const renderSkeletonCard = (key: string | number) => (
    <Box
      key={key}
      sx={{
        flex: {
          xs: "1 1 48%",
          sm: "1 1 48%",
          md: "1 1 48%",
          lg: "1 1 31%",
        },
        maxWidth: 380,
        minWidth: 200,
      }}
    >
      <Card
        sx={{
          borderRadius: 3,
          bgcolor: mode === "dark" ? "#444" : "#fff",
          overflow: "hidden",
        }}
      >
        <Skeleton 
          variant="rectangular" 
          height={160}
          sx={{
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        />
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="circular" width={36} height={36} />
          </Stack>
          <Skeleton variant="text" width="40%" height={20} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="30%" height={20} />
        </CardContent>
      </Card>
    </Box>
  );

  // Render actual car card
  const renderCarCard = (car: Car, index: number) => (
    <Box
      key={car.id}
      sx={{
        flex: {
          xs: "1 1 48%",
          sm: "1 1 48%",
          md: "1 1 48%",
          lg: "1 1 31%",
        },
        maxWidth: 380,
        minWidth: 200,
        cursor: "pointer",
      }}
      onClick={() => onclick(car)}
    >
                    <Card
         sx={{
           borderRadius: 3,
           boxShadow: "0 4px 16px rgba(25, 118, 210, 0.08)",
           position: "relative",
           transition: "box-shadow 0.2s",
           "&:hover": {
             boxShadow: "0 8px 24px rgba(25, 118, 210, 0.18)",
           },
           bgcolor: mode === "dark" ? "#444" : "#fff",
         }}
       >
         {/* Remove (Cross) Button */}
         <IconButton
           onClick={(e) => {
             e.stopPropagation();
             // TODO: remove bookmark logic here
           }}
           sx={{
             position: "absolute",
             top: 8,
             right: 8,
             zIndex: 1,
             color: mode === "dark" ? "primary.main" : "primary.main",
           }}
           aria-label="remove bookmark"
         >
           <CloseIcon fontSize="small" />
         </IconButton>

         <CardMedia
           component="img"
           height="160"
           image={
             car?.CarImageDetails?.[0]?.CarImageURL ||
             "/assets/card-img.png"
           }
           alt={car.name}
           sx={{
             borderTopLeftRadius: 12,
             borderTopRightRadius: 12,
             objectFit: "cover",
           }}
         />
         <CardContent>
           <Stack
             direction="row"
             alignItems="center"
             justifyContent="space-between"
             mb={1}
           >
             {/* Car Name */}
             <Typography
               variant="h6"
               fontWeight="bold"
               sx={{ color: mode === "dark" ? "#fff" : "inherit" }}
             >
               {car?.BrandName} {car?.ModelName}
             </Typography>

             {/* Small Play Button inline with car name */}
             <IconButton
               onClick={async (e) => {
                 e.stopPropagation();
                 handlePlayClick(car, index);
               }}
               sx={{ width: 36, height: 36 }}
               aria-label="play audio"
               disabled={ttsLoadingCards.has(index)}
             >
               {ttsLoadingCards.has(index) ? (
                 <CircularProgress size={20} />
               ) : isPlayingIndex === car.CarID && isPlaying ? (
                 <VolumeUpOutlinedIcon fontSize="small" />
               ) : (
                 <VolumeOffOutlinedIcon fontSize="small" />
               )}
             </IconButton>
           </Stack>

           {/* Variant */}
           <Typography variant="body2" color="text.secondary" mb={0.5}>
             {car?.VariantName}
           </Typography>

           {/* Price */}
           <Typography variant="body2" color="primary" fontWeight="bold">
             ₹{formatInternational(car.Price || 0)}
           </Typography>
         </CardContent>
       </Card>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: mode === "dark" ? theme.palette.background.paper : "grey.100",
      }}
    >
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="auto" />

      {/* Sticky Navbar */}
      <AppBar position="fixed" elevation={0} color="primary">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onBack}
            aria-label="back"
          >
            <KeyboardBackspaceSharpIcon />
          </IconButton>
          <Typography variant="h6" fontWeight="bold" sx={{ ml: 2 }}>
            Bookmarks
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ pt: 8, py: 4, px: { xs: 2, md: 6 } }}>
        <Stack direction="row" alignItems="center" gap={1} mb={4}>
          <BookmarkBorderIcon sx={{ color: "#1976d2", fontSize: 32 }} />
          <Typography variant="h5" fontWeight="bold" color="primary">
            Bookmarked Cars
          </Typography>
        </Stack>
        
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            justifyContent: { xs: "center", md: "flex-start" },
          }}
        >
          {isInitialLoading ? (
            // Show skeleton cards while initially loading
            Array.from({ length: 6 }).map((_, index) => renderSkeletonCard(`skeleton-${index}`))
          ) : bookmarks?.length > 0 ? (
            bookmarks.map((car, index) => renderCarCard(car, index))
          ) : (
            // Empty state when no bookmarks
            <Box
              sx={{
                width: "100%",
                textAlign: "center",
                py: 8,
                color: mode === "dark" ? "text.secondary" : "text.primary",
              }}
            >
              <BookmarkBorderIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" gutterBottom>
                No bookmarks yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start bookmarking cars to see them here
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {isNative && <BottomNavigationAction />}
    </Box>
  );
};

export default Variants;
