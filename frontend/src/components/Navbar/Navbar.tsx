'use client';

import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  CssBaseline,
  useTheme,
  Box,
} from '@mui/material';
import BrandName from '@/components/common/BrandName';
import { KeyboardBackspaceSharp } from '@mui/icons-material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { useColorMode } from '@/Context/ColorModeContext';
import { axiosInstance1 } from '@/utils/axiosInstance';
import AskLocation from '../Header/AskLocation';
import CityInputDialog from '../Header/CityInputForm';
import { Geolocation } from '@capacitor/geolocation';

type Props = {
  backToPrevious: () => void;
};

const FixedHeaderWithBack: React.FC<Props> = ({ backToPrevious }) => {
  const [cookies, setCookie, removeCookie] = useCookies([
    'token',
    'user',
    'selectedOption',
    'currentCity',
    'locationPermissionAcknowledged',
  ]);

  const router = useRouter();
  const theme = useTheme();
  const isNative = Capacitor.isNativePlatform();
  const isAndroid = Capacitor.getPlatform() === "android";
  const { mode } = useColorMode();
  
  const [enterCitydialogOpen, setEnterCityDialogOpen] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [city, setCity] = useState<string | null>(null);

  const toggleCity = () => setEnterCityDialogOpen((prev) => !prev);
  const onCloseLocationPopup = () => setLocationDenied(false);

  const handleBookmarkClick = () => {
    if (cookies.user) {
      router.push("/bookmarks");
    }
  };

  const getUserLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    // Detect if running in Capacitor native app

    if (isNative) {
      // Capacitor mobile app
      const permission = await Geolocation.requestPermissions();
      if (permission.location !== 'granted') return null;

      const position = await Geolocation.getCurrentPosition();
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
    } else if (navigator.geolocation) {
      // Web browser
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (err) => {
            console.warn('Web location permission denied', err);
            reject(null);
          }
        );
      });
    } else {
      console.warn("Geolocation not supported");
      return null;
    }
  } catch (err) {
    console.error("Error getting location", err);
    return null;
  }
};

  const handleLocation = async (isClose: boolean) => {
  const coords = await getUserLocation();
  if (!coords) {
    setLocationDenied(true);
    removeCookie("currentCity");
    setCookie("locationPermissionAcknowledged", true, { path: "/", maxAge: 60 * 60 * 24 * 365 });
    return;
  }

  const { latitude, longitude } = coords;

  try {
    const res = await axiosInstance1.post("/api/cargpt/coordinate-to-city/", {
      lat: latitude,
      lng: longitude,
    });

    if (res?.city) {
      setCity(res.city);
      setCookie("currentCity", res.city, { path: "/", maxAge: 60 * 60 * 24 * 365 });
      if (isClose) toggleCity();
      setCookie("locationPermissionAcknowledged", true, { path: "/", maxAge: 60 * 60 * 24 * 365 });
    }
  } catch (err) {
    console.error("Failed to fetch city from coordinates", err);
  }
};
  const handleLocationAcknowledge = () => {
    setCookie('locationPermissionAcknowledged', true, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
    setLocationDenied(false);
  };

  const handleCitySubmit = (city: string) => {
    setCity(city);
    setCookie('currentCity', city, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
  };

  useEffect(() => {
    if (
      cookies.currentCity ||
      cookies.locationPermissionAcknowledged ||
      enterCitydialogOpen
    )
      return;
    handleLocation(false);
  }, [cookies.currentCity, cookies.locationPermissionAcknowledged, enterCitydialogOpen]);

  return (
    <>
      <CssBaseline />
      <AppBar
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: "none",
          paddingTop: isNative && isAndroid
            ? 'max(env(safe-area-inset-top, 0px), 2.5vh)'
            : 'env(safe-area-inset-top, 0px)',
          boxSizing: "border-box",
        }}
        elevation={0}
      >
        <Toolbar
          sx={{
            left: "calc(env(safe-area-inset-left, 0px) + 8px)",
            zIndex: 3,
            border: "none",
          }}
        >
          {/* Back Button */}
          <IconButton edge="start" onClick={backToPrevious} aria-label="back">
            <KeyboardBackspaceSharp />
          </IconButton>

          {/* Brand Name on the left, next to back button */}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              fontWeight: 600,
              ml: 1,
              color: mode === "dark" ? "#2196f3" : "#ffffff", // Blue in dark mode, white in light mode
              display: 'flex',
              alignItems: 'baseline',
              gap: 0.5,
            }}
          >
            <BrandName />
          </Typography>

          {/* Spacer pushes bookmark icon to right */}
          <div style={{ flexGrow: 1 }} />

          {/* City Selector */}
          <Box
            onClick={toggleCity}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              cursor: 'pointer',
              mr: 2,
              backgroundColor: 'transparent',
            }}
          >
            <LocationOnOutlinedIcon sx={{ fontSize: 20, color: '#fff' }} />
            <Typography variant="body2" sx={{ color: '#fff', fontSize: 14 }}>
              {cookies.currentCity ?? 'Select City'}
            </Typography>
          </Box>

          {/* Bookmark Icon (if logged in) */}
          {cookies.user && (
            <IconButton onClick={handleBookmarkClick} edge="end" aria-label="favorite">
              <FavoriteBorderIcon sx={{ color: '#fff' }} />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <Toolbar /> {/* spacer for fixed header */}
      {/* Dialogs */}
      <CityInputDialog
        open={enterCitydialogOpen}
        onSubmit={handleCitySubmit}
        onClose={toggleCity}
        handleLocation={handleLocation}
      />
      <AskLocation
        show={locationDenied}
        onClose={onCloseLocationPopup}
        onAcknowledge={handleLocationAcknowledge}
      />
    </>
  );
};

export default FixedHeaderWithBack;
