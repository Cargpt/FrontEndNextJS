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
};

type Props = {
  bookmarks?: Car[];
};

const Variants: React.FC<Props> = () => {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const router = useRouter();
  const [cookies] = useCookies(["selectedOption", "user"]);
  const { mode } = useColorMode();
  const theme = useTheme();
  const isNative = Capacitor.isNativePlatform();
  const [isPlayingIndex, setIsPlayingIndex] = useState<number | null>(null);
  const { handleBookmark, setCars, cars } = useChats();
  const [isAutoplayPaused, setIsAutoplayPaused] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false); // play/pause toggle


  const onBack = () => router.back();

  const onclick = async (car: Car) => {
    await handleBookmark(car);
    router.push("/home");
  };

  const fetchBookmarks = async () => {
    const response = await axiosInstance1.get("/api/cargpt/bookmark/detailed/");
    setBookmarks(response);
  };

  useEffect(() => {
    if (cookies.user) {
      fetchBookmarks();
    }
  }, [cookies.user]);

  const getAudioUrl = async (car: Car) => {
    console.log("car", car);
    try {
      const response = await axiosInstance1.get(
        `/api/cargpt/cars/${car.CarID}/tts/`
      );
      return response.tts_file;
    } catch (error) {
      console.error("Error fetching audio URL:", error);
      return "";
    }
  };

  // 🔊 Auto-play bookmarks audio sequentially
  useEffect(() => {
    if (bookmarks.length === 0) return;

    const currentCar = bookmarks[currentIndex];
    if (!currentCar) return;

    let isCancelled = false;

    const playAudio = async () => {
      try {
        const audioUrl = await getAudioUrl(currentCar);
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

          // cleanup
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
  }, [bookmarks, currentIndex]);




   // 🔊 Autoplay from 0 on mount, then sequentially
   useEffect(() => {
    if (bookmarks.length === 0) return;
    playAudioAtIndex(currentIndex);

    // cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, bookmarks]);

  // Core play function
  // Core play function
  const playAudioAtIndex = async (index: number) => {
    const car = bookmarks[index];
    if (!car) return;

    const audioUrl = await getAudioUrl(car);
    if (!audioUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    // if switching audio, stop current
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
    // If clicked same playing car
    if (isPlayingIndex === car.CarID) {
      if (isPlaying) {
        audioRef.current?.pause(); // pause
        setIsPlaying(false);
      } else {
        try {
          await audioRef.current?.play(); // resume
          setIsPlaying(true);
        } catch (err) {
          console.warn("Resume failed:", err);
        }
      }
      return;
    }

    // else: play new one
    await playAudioAtIndex(index);
  };


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
          {bookmarks?.map((car, index:number) => (
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
    >
      
      {isPlayingIndex === car.CarID && isPlaying ? (
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
    ₹{formatInternational(car.Price)}
  </Typography>
</CardContent>

              </Card>
            </Box>
          ))}
        </Box>
      </Box>

      {isNative && <BottomNavigationAction />}
    </Box>
  );
};

export default Variants;
