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
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  TextField,
  InputAdornment,
  IconButton as MuiIconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import BrandName from '@/components/common/BrandName';
import { KeyboardBackspaceSharp } from '@mui/icons-material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import HistoryIcon from '@mui/icons-material/History';
import ChatIcon from '@mui/icons-material/Chat';
import SearchIcon from '@mui/icons-material/Search';
import RestoreFromTrashOutlined from '@mui/icons-material/RestoreFromTrashOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { useColorMode } from '@/Context/ColorModeContext';
import { axiosInstance1 } from '@/utils/axiosInstance';
import AskLocation from '../Header/AskLocation';
import CityInputDialog from '../Header/CityInputForm';
import { Geolocation } from '@capacitor/geolocation';
import { useChats } from '@/Context/ChatContext';
import { useSnackbar } from '@/Context/SnackbarContext';

type Props = {
  backToPrevious: () => void;
};

type HistoryItem = { id?: string; title: string; value: string };

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
  const { setMessages } = useChats();
  const { showSnackbar } = useSnackbar();
  
  const [enterCitydialogOpen, setEnterCityDialogOpen] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [city, setCity] = useState<string | null>(null);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [histories, setHistories] = useState<HistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [pendingDelete, setPendingDelete] = useState<HistoryItem | null>(null);

  const toggleCity = () => setEnterCityDialogOpen((prev) => !prev);
  const onCloseLocationPopup = () => setLocationDenied(false);
  const toggleHistoryDrawer = () => setHistoryDrawerOpen((prev) => !prev);

  const handleBookmarkClick = () => {
    if (cookies.user) {
      router.push("/bookmarks");
    }
  };

  // Fetch history data
  useEffect(() => {
    let isMounted = true;
    if (!(cookies.user && cookies.token)) return;
    
    const fetchHistories = async () => {
      try {
        setIsLoadingHistory(true);
        const response = await axiosInstance1.get("/api/cargpt/history/");
        if (!isMounted) return;
        const items: HistoryItem[] = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];
        setHistories(items);
      } catch (e) {
        setHistories([]);
      } finally {
        if (isMounted) setIsLoadingHistory(false);
      }
    };

    if (!cookies.user) {
      setHistories([]);
      return () => {
        isMounted = false;
      };
    }
    
    fetchHistories();
    return () => {
      isMounted = false;
    };
  }, [cookies.user, cookies.token]); // Removed historyDrawerOpen dependency to fetch on mount/refresh

  const handleHistoryItemClick = (h: HistoryItem) => {
    try {
      const parsed = JSON.parse(h.value);
      if (Array.isArray(parsed)) {
        const flagged = (parsed as any[]).map((m) => ({ ...m, fromHistory: true }));
        setMessages(flagged);
      } else if (parsed && Array.isArray(parsed.messages)) {
        const flagged = (parsed.messages as any[]).map((m: any) => ({ ...m, fromHistory: true }));
        setMessages(flagged);
      } else {
        setMessages([
          {
            id: String(Date.now()),
            sender: "user",
            render: "text",
            message: h.title,
            fromHistory: true,
          } as any,
        ]);
      }
    } catch {
      setMessages([
        {
          id: String(Date.now()),
          sender: "user",
          render: "text",
          message: h.title,
          fromHistory: true,
        } as any,
      ]);
    }
    // Close drawer after selection
    setHistoryDrawerOpen(false);
  };

  const handleDeleteHistory = async (h: HistoryItem) => {
    if (!cookies.token || !h?.id) return;
    
    try {
      await axiosInstance1.delete(`/api/cargpt/history/${h.id}/`);
      setHistories((prev) => prev.filter((x) => x.id !== h.id));
      showSnackbar("History deleted successfully", {
        vertical: "bottom",
        horizontal: "center",
        color: "success",
      });
    } catch (e) {
      showSnackbar("Failed to delete history", {
        vertical: "bottom",
        horizontal: "center",
        color: "error",
      });
    }
  };

  const requestDeleteHistory = (h: HistoryItem) => {
    setPendingDelete(h);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (pendingDelete) {
      await handleDeleteHistory(pendingDelete);
    }
    setConfirmOpen(false);
    setPendingDelete(null);
  };

  const cancelDelete = () => {
    setConfirmOpen(false);
    setPendingDelete(null);
  };

  const refreshHistory = () => {
    if (cookies.user && cookies.token) {
      // Clear current history and set loading state
      setHistories([]);
      setIsLoadingHistory(true);
      
      // Manually fetch history data
      const fetchHistories = async () => {
        try {
          const response = await axiosInstance1.get("/api/cargpt/history/");
          const items: HistoryItem[] = Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response)
            ? response
            : [];
          setHistories(items);
        } catch (e) {
          setHistories([]);
        } finally {
          setIsLoadingHistory(false);
        }
      };
      
      fetchHistories();
    }
  };

  // Filter history based on search query
  const filteredHistory = histories.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  // Refresh history when page becomes visible (refresh, tab focus, etc.)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && cookies.user && cookies.token) {
        // Small delay to ensure cookies are properly loaded
        setTimeout(() => {
          refreshHistory();
        }, 100);
      }
    };

    const handleFocus = () => {
      if (cookies.user && cookies.token) {
        // Small delay to ensure cookies are properly loaded
        setTimeout(() => {
          refreshHistory();
        }, 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [cookies.user, cookies.token]);

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
            <Tooltip title="View Bookmarks" placement="bottom" arrow>
              <IconButton onClick={handleBookmarkClick} edge="end" aria-label="favorite" sx={{ mr: 1 }}>
                <FavoriteBorderIcon sx={{ color: '#fff' }} />
              </IconButton>
            </Tooltip>
          )}

          {/* History Icon */}
          <Tooltip title="Chat History" placement="bottom" arrow>
            <IconButton onClick={toggleHistoryDrawer} edge="end" aria-label="history">
              <HistoryIcon sx={{ color: '#fff' }} />
            </IconButton>
          </Tooltip>
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

      {/* History Drawer */}
      <Drawer
        anchor="right"
        open={historyDrawerOpen}
        onClose={toggleHistoryDrawer}
        PaperProps={{
          sx: {
            width: 300,
            backgroundColor: mode === "dark" ? "#1a1a1a" : "#f5f5f5",
            color: mode === "dark" ? "#ffffff" : "#000000",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Chat History
            </Typography>
                         <Box sx={{ display: 'flex', gap: 1 }}>
               <Tooltip title="Refresh History" placement="bottom" arrow>
                 <IconButton onClick={refreshHistory} size="small" disabled={isLoadingHistory}>
                   <RefreshIcon />
                 </IconButton>
               </Tooltip>
               <Tooltip title="Close" placement="bottom" arrow>
                 <IconButton onClick={toggleHistoryDrawer} size="small">
                   <KeyboardBackspaceSharp />
                 </IconButton>
               </Tooltip>
             </Box>
          </Box>
          
          {/* Search Field */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search chat history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          
          <Divider />
          <List>
            {isLoadingHistory ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={32} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Loading chat history...
                </Typography>
              </Box>
            ) : filteredHistory.length > 0 ? (
              filteredHistory.map((item) => (
                                 <ListItem
                   key={item.id}
                   onClick={() => handleHistoryItemClick(item)}
                   sx={{ 
                     cursor: 'pointer',
                     borderRadius: 1,
                     mb: 1,
                     '&:hover': {
                       backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                     },
                     transition: 'background-color 0.2s ease',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'space-between',
                     gap: 1,
                   }}
                 >
                   <ListItemText
                     primary={item.title}
                     primaryTypographyProps={{
                       fontSize: 14,
                       fontWeight: 500,
                     }}
                   />
                                       {item.id && (
                      <Tooltip title="Delete History" placement="left" arrow>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent history item click
                            requestDeleteHistory(item);
                          }}
                          size="small"
                          sx={{ 
                            color: '#d32f2f',
                            '&:hover': {
                              backgroundColor: 'rgba(211, 47, 47, 0.08)',
                            }
                          }}
                        >
                          <RestoreFromTrashOutlined sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                 </ListItem>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <ChatIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  {searchQuery ? 'No matching chat history found' : 'No chat history yet'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {searchQuery ? 'Try adjusting your search terms' : 'Start a conversation to see it here'}
                </Typography>
              </Box>
            )}
          </List>
        </Box>
      </Drawer>

      {/* Confirmation Dialog for Deletion */}
      <Dialog open={confirmOpen} onClose={cancelDelete}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this chat history? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FixedHeaderWithBack;
