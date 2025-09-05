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
  Menu,
  MenuItem,
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
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LogoutIcon from '@mui/icons-material/Logout';
import { useCookies } from 'react-cookie';
import { useRouter, useSearchParams } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { useColorMode } from '@/Context/ColorModeContext';
import { axiosInstance1 } from '@/utils/axiosInstance';
import AskLocation from '../Header/AskLocation';
import CityInputDialog from '../Header/CityInputForm';
import { Geolocation } from '@capacitor/geolocation';
import { useChats } from '@/Context/ChatContext';
import { useSnackbar } from '@/Context/SnackbarContext';
import { safeAreaBoth } from '../Header/BottomNavigation';

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
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isNative = Capacitor.isNativePlatform();
  const isAndroid = Capacitor.getPlatform() === "android";
  const { mode, toggleColorMode } = useColorMode();
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
  const [dropdownAnchorEl, setDropdownAnchorEl] = useState<null | HTMLElement>(null);

  const toggleCity = () => setEnterCityDialogOpen((prev) => !prev);
  const onCloseLocationPopup = () => setLocationDenied(false);
  const toggleHistoryDrawer = () => setHistoryDrawerOpen((prev) => !prev);
  
  const handleDropdownOpen = (event: React.MouseEvent<HTMLElement>) => {
    setDropdownAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setDropdownAnchorEl(null);
  };

  const handleBookmarkClick = () => {
    if (cookies.user) {
      router.push("/bookmarks");
    }
    handleDropdownClose();
  };

  const handleNotificationsClick = () => {
    router.push("/notifications");
    handleDropdownClose();
  };

  const handleProfileClick = () => {
    router.push("/profile");
    handleDropdownClose();
  };

  const handleBookedTestDriveClick = () => {
    router.push("/booked-test-drive");
    handleDropdownClose();
  };

  const handleLogout = () => {
    removeCookie("user", { path: "/" });
    removeCookie("token", { path: "/" });
    removeCookie("selectedOption", { path: "/" });
    router.push("/");
    handleDropdownClose();
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
    const locationFromShare = searchParams.get('share') === 'location';

    if (
      !cookies.currentCity &&
      !cookies.locationPermissionAcknowledged &&
      locationFromShare
    ) {
      setEnterCityDialogOpen(true);
    } else if (
      !cookies.currentCity &&
      !cookies.locationPermissionAcknowledged &&
      !enterCitydialogOpen &&
      !locationFromShare
    ) {
      handleLocation(false);
    }
  }, [cookies.currentCity, cookies.locationPermissionAcknowledged, searchParams]);

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

          {/* Spacer pushes location and menu to right */}
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
              padding: '4px 8px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <LocationOnOutlinedIcon sx={{ fontSize: 18, color: '#fff' }} />
            <Typography variant="body2" sx={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>
              {cookies.currentCity ?? 'Select City'}
            </Typography>
          </Box>

          {/* 3-Dots Menu */}
          <Tooltip title="More options" placement="bottom" arrow>
            <IconButton
              onClick={handleDropdownOpen}
              edge="end"
              aria-label="more options"
              sx={{ color: '#fff' }}
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Toolbar /> {/* spacer for fixed header */}
      
      {/* 3-Dots Dropdown Menu */}
      <Menu
        anchorEl={dropdownAnchorEl}
        open={Boolean(dropdownAnchorEl)}
        onClose={handleDropdownClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            backgroundColor: mode === "dark" ? "#1a1a1a" : "#ffffff",
            color: mode === "dark" ? "#ffffff" : "#000000",
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Chat History */}
        <MenuItem onClick={toggleHistoryDrawer} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <HistoryIcon sx={{ fontSize: 20, color: 'primary.main' }} />
          </ListItemIcon>
          <ListItemText 
            primary="Chat History" 
            primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
          />
        </MenuItem>

        {/* Bookmarks */}
        {cookies.user && (
          <MenuItem onClick={handleBookmarkClick} sx={{ py: 1.5 }}>
            <ListItemIcon>
              <FavoriteBorderIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Bookmarks" 
              primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
            />
          </MenuItem>
        )}

        {/* Notifications */}
        {cookies.user && (
          <MenuItem onClick={handleNotificationsClick} sx={{ py: 1.5 }}>
            <ListItemIcon>
              <NotificationsIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Notifications" 
              primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
            />
          </MenuItem>
        )}

        <Divider />

        {/* Profile */}
        {cookies.user && (
          <MenuItem onClick={handleProfileClick} sx={{ py: 1.5 }}>
            <ListItemIcon>
              <PersonIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Profile" 
              primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
            />
          </MenuItem>
        )}

        {/* Booked Test Drive */}
        {cookies.user && (
          <MenuItem onClick={handleBookedTestDriveClick} sx={{ py: 1.5 }}>
            <ListItemIcon>
              <DirectionsCarIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Booked Test Drive" 
              primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
            />
          </MenuItem>
        )}

        <Divider />

        {/* Theme Toggle */}
        <MenuItem onClick={toggleColorMode} sx={{ py: 1.5 }}>
          <ListItemIcon>
            {mode === 'dark' ? (
              <Brightness7Icon sx={{ fontSize: 20, color: 'primary.main' }} />
            ) : (
              <Brightness4Icon sx={{ fontSize: 20, color: 'primary.main' }} />
            )}
          </ListItemIcon>
          <ListItemText 
            primary={mode === 'dark' ? 'Light Mode' : 'Dark Mode'} 
            primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
          />
        </MenuItem>

        {/* Logout */}
        {cookies.user && (
          <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
            <ListItemIcon>
              <LogoutIcon sx={{ fontSize: 20, color: '#d32f2f' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              primaryTypographyProps={{ fontSize: 14, fontWeight: 500, color: '#d32f2f' }}
            />
          </MenuItem>
        )}
      </Menu>

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
        <Box sx={{ p: 2,  ...safeAreaBoth("50px","56px")}}>
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
