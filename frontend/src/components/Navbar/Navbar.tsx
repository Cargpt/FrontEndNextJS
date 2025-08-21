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

  const handleLocation = (isClose: boolean) => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await axiosInstance1.post('/api/cargpt/coordinate-to-city/', {
            lat: latitude,
            lng: longitude,
          });

          const cityName = res?.city;
          if (cityName) {
            setCity(cityName);
            setCookie('currentCity', cityName, {
              path: '/',
              maxAge: 60 * 60 * 24 * 365,
            });
            setCookie('locationPermissionAcknowledged', true, {
              path: '/',
              maxAge: 60 * 60 * 24 * 365,
            });

            if (isClose) toggleCity();
          }
        } catch (error) {
          console.error('Failed to fetch city from coordinates', error);
        }
      },
      (error) => {
        console.warn('Location permission denied', error);
        removeCookie('currentCity');
        setCookie('locationPermissionAcknowledged', true, {
          path: '/',
          maxAge: 60 * 60 * 24 * 365,
        });
        setLocationDenied(true);
      }
    );
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
          borderTop: `1px solid ${theme.palette.divider}`,
          boxShadow: "none",
          paddingTop: `env(safe-area-inset-bottom)`,
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
            }}
          >
            AICarAdvisor
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
