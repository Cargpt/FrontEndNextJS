"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Card,
  CardContent,
  Divider,
  Paper,
  CircularProgress,
  Chip,
  Avatar,
  IconButton,
  useTheme,
  useMediaQuery,
  Skeleton,
  Badge,
} from "@mui/material";
import {
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Event as EventIcon,
} from "@mui/icons-material";
import { axiosInstance1 } from "@/utils/axiosInstance";
import { safeAreaBottom } from "../Header/BottomNavigation";
import { Capacitor } from "@capacitor/core";

interface Booking {
  id: number;
  name: string;
  mobile: string;
  state: string;
  city: string;
  preferred_datetime: string;
  status: string;
  brand_name: string;
  model_name: string;
  variant_name: string;
  pincode: string;
}

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  pending: {
    color: "#ff9800",
    icon: <PendingIcon sx={{ fontSize: 16 }} />,
    label: "Pending"
  },
  confirmed: {
    color: "#2196f3",
    icon: <CheckIcon sx={{ fontSize: 16 }} />,
    label: "Confirmed"
  },
  completed: {
    color: "#4caf50",
    icon: <CheckIcon sx={{ fontSize: 16 }} />,
    label: "Completed"
  },
  cancelled: {
    color: "#f44336",
    icon: <CancelIcon sx={{ fontSize: 16 }} />,
    label: "Cancelled"
  },
};

const TestDriveDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axiosInstance1.get("/api/core/test-drive-booking/");
        setBookings(response);
        setSelectedBooking(response[0] || null);
      } catch (error) {
        console.error("Failed to fetch bookings", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const getStatusConfig = (status: string) => {
    return statusConfig[status.toLowerCase()] || statusConfig.pending;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary">
          Loading your test drive bookings...
        </Typography>
      </Box>
    );
  }

  if (bookings.length === 0) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
        flexDirection="column"
        gap={3}
        textAlign="center"
        p={4}
      >
        <CarIcon sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.5 }} />
        <Typography variant="h5" color="text.secondary" gutterBottom>
          No Test Drive Bookings Yet
        </Typography>
        <Typography variant="body1" color="text.secondary" maxWidth="400px">
          You haven't booked any test drives yet. Book your first test drive to see it here!
        </Typography>
      </Box>
    );
  }

  const isNative = Capacitor.isNativePlatform()
  return (
    <Box 
      sx={{
        p: { xs: 2, md: 4 },
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
        ...safeAreaBottom("5rem")  
      }}
    >
      {/* Header Section */}
      <Box mb={4} textAlign="center">
        <Typography 
          variant={isNative ? "h4" : "h5"} 
          gutterBottom 
          sx={{ 
            fontWeight: 700,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
            mt: isNative ? "15px":"5px",
          }}
        >
          Test Drive Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and track all your test drive bookings
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
        {/* Right Panel: Booking List - Shows on top for small screens */}
        <Box sx={{ 
          flex: { xs: '1', lg: '1' }, 
          minWidth: { lg: '300px' },
          order: { xs: 1, lg: 2 },
          boxShadow: 'none'
        }}>
          <Card 
            elevation={8}
            sx={{
              borderRadius: 3,
              background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
              border: `1px solid ${theme.palette.divider}`,
              height: 'fit-content',
              position: { xs: 'static', lg: 'sticky' },
              top: 20,
              boxShadow: 'none'

            }}
          >
            <Box
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
                color: 'white',
                p: 3,
                textAlign: 'center',
                minHeight: '120px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Your Bookings
              </Typography>
              <Chip 
                label={`${bookings.length} Total`}
                size="small"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white', 
                  mt: 1,
                  fontWeight: 600
                }}
              />
            </Box>

            <Box sx={{ maxHeight: { xs: '50vh', lg: '70vh' }, overflow: 'auto' }}>
              <List sx={{ p: 0 }}>
                {bookings.map((booking, index) => {
                  const statusConfig = getStatusConfig(booking.status);
                  const isSelected = selectedBooking?.id === booking.id;
                  
                  return (
                    <ListItem key={booking.id} disablePadding>
                      <ListItemButton
                        selected={isSelected}
                        onClick={() => setSelectedBooking(booking)}
                        sx={{
                          mx: 1,
                          my: 0.5,
                          borderRadius: 2,
                          border: isSelected ? `2px solid ${theme.palette.primary.main}` : 'none',
                          bgcolor: isSelected ? 'primary.light' : 'transparent',
                          '&:hover': {
                            bgcolor: isSelected ? 'primary.light' : 'action.hover',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: statusConfig.color,
                              width: 40,
                              height: 40
                            }}
                          >
                            {statusConfig.icon}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography 
                              variant="subtitle2" 
                              fontWeight={600}
                              noWrap
                              sx={{ color: isSelected ? 'primary.dark' : 'text.primary' }}
                            >
                              {booking.name}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              noWrap
                              sx={{ display: 'block' }}
                            >
                              {booking.brand_name} {booking.model_name}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              noWrap
                            >
                              {formatDateTime(booking.preferred_datetime).date}
                            </Typography>
                          </Box>
                          <Chip
                            label={statusConfig.label}
                            size="small"
                            sx={{
                              bgcolor: statusConfig.color,
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.7rem'
                            }}
                          />
                        </Box>
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          </Card>
        </Box>

        {/* Left Panel: Booking Details - Shows below for small screens */}
        <Box sx={{ 
          flex: { xs: '1', lg: '2' },
          order: { xs: 2, lg: 1 },
        }}>
          <Card 
            elevation={8}
            sx={{
              borderRadius: 3,
              background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
              boxShadow: 'none'

            }}
          >
            <Box
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                color: 'white',
                p: 3,
                textAlign: 'center',
                minHeight: '120px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {selectedBooking ? 'Booking Details' : 'Select a Booking'}
              </Typography>
              {selectedBooking && (
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {selectedBooking.brand_name} {selectedBooking.model_name} {selectedBooking.variant_name}
                </Typography>
              )}
            </Box>

            <CardContent sx={{ p: 4 }}>
              {selectedBooking ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Personal Information */}
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main, mb: 2 }}>
                      Personal Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                            <PersonIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Name</Typography>
                            <Typography variant="body1" fontWeight={600}>{selectedBooking.name}</Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                          <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                            <PhoneIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Mobile</Typography>
                            <Typography variant="body1" fontWeight={600}>{selectedBooking.mobile}</Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Car Information */}
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main, mb: 2 }}>
                      Vehicle Details
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2, 
                      p: 3, 
                      bgcolor: theme.palette.mode === 'dark' ? '#1976d2' : 'primary.light', 
                      borderRadius: 2, 
                      color: 'white' 
                    }}>
                      <CarIcon sx={{ fontSize: 40 }} />
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {selectedBooking.brand_name} {selectedBooking.model_name}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                          {selectedBooking.variant_name}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Location Information */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main, mb: 2 }}>
                      Location Details
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: 'center', 
                      gap: { xs: 1, sm: 2 }, 
                      p: 2, 
                      bgcolor: 'action.hover', 
                      borderRadius: 2 
                    }}>
                      <LocationIcon color="primary" />
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', sm: 'row' }, 
                        gap: { xs: 2, sm: 4 }, 
                        alignItems: { xs: 'center', sm: 'center' },
                        width: '100%',
                        justifyContent: { xs: 'center', sm: 'space-between' }
                      }}>
                        <Box sx={{ 
                          textAlign: { xs: 'center', sm: 'left' },
                          minWidth: { sm: '80px' },
                          flex: 1
                        }}>
                          <Typography variant="caption" color="text.secondary">City</Typography>
                          <Typography variant="body1" fontWeight={600}>{selectedBooking.city}</Typography>
                        </Box>
                        <Box sx={{ 
                          textAlign: { xs: 'center', sm: 'left' },
                          minWidth: { sm: '80px' },
                          flex: 1
                        }}>
                          <Typography variant="caption" color="text.secondary">State</Typography>
                          <Typography variant="body1" fontWeight={600}>{selectedBooking.state}</Typography>
                        </Box>
                        <Box sx={{ 
                          textAlign: { xs: 'center', sm: 'left' },
                          minWidth: { sm: '80px' },
                          flex: 1
                        }}>
                          <Typography variant="caption" color="text.secondary">Pincode</Typography>
                          <Typography variant="body1" fontWeight={600}>{selectedBooking.pincode}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Schedule and Status */}
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main, mb: 2 }}>
                      Schedule & Status
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'stretch' }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2, 
                          p: 3, 
                          bgcolor: theme.palette.mode === 'dark' ? '#1976d2' : 'info.light', 
                          borderRadius: 2, 
                          color: 'white',
                          height: '100%',
                          minHeight: '120px'
                        }}>
                          <ScheduleIcon sx={{ fontSize: 30 }} />
                          <Box>
                            <Typography variant="caption" sx={{ opacity: 0.9 }}>Preferred Date & Time</Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {formatDateTime(selectedBooking.preferred_datetime).date}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              {formatDateTime(selectedBooking.preferred_datetime).time}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2, 
                          p: 3, 
                          borderRadius: 2, 
                          bgcolor: getStatusConfig(selectedBooking.status).color, 
                          color: 'white',
                          height: '100%',
                          minHeight: '120px'
                        }}>
                          {getStatusConfig(selectedBooking.status).icon}
                          <Box>
                            <Typography variant="caption" sx={{ opacity: 0.9 }}>Status</Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {getStatusConfig(selectedBooking.status).label}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Box textAlign="center" py={6}>
                  <CarIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Select a booking to view details
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default TestDriveDashboard;
