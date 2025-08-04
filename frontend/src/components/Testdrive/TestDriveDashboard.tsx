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
} from "@mui/material";
import { axiosInstance1 } from "@/utils/axiosInstance";

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
  pincode: string; // Add pincode field
}


const statusColors: Record<string, string> = {
  pending: "#f0ad4e",   // orange-ish
  confirmed: "#0275d8", // blue
  completed: "#5cb85c", // green
  cancelled: "#d9534f", // red
};

const TestDriveDashboard: React.FC = () => {
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection={{ xs: "column-reverse", md: "row" }}
 gap={2}  sx={{p:{lg:4, xs:1}}}
  minHeight={{ xs: '400px', md: 'auto' }} // set a height for vertical layout
  alignItems="stretch" // stretch children to same height when in row

 >
      
      {/* Left Panel: Booking Details */}
      <Box flex={2}>
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Test Drive Booking Details
            </Typography>
            <Divider sx={{ mb: 2 }} />

           {selectedBooking ? (
  <Box
    display="grid"
    gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
    gap={2}
    textAlign="center"
  >
    {[
      { label: "Name", value: selectedBooking.name },
      { label: "Mobile Number", value: selectedBooking.mobile },
      {
        label: "Booking Date",
        value: new Date(selectedBooking.preferred_datetime).toLocaleString(),
      },
      {
        label: "Car",
        value: `${selectedBooking.brand_name} ${selectedBooking.model_name} ${selectedBooking.variant_name}`,
      },
      { label: "City", value: selectedBooking.city },
      { label: "State", value: selectedBooking.state },
      { label: "Pincode", value: selectedBooking.pincode }, // Add pincode display
      { label: "Booking Status", value: selectedBooking.status },
    ].map(({ label, value }) => (
      <Box key={label} border={1} borderColor="grey.300" p={2} borderRadius={1}>
        <Typography variant="subtitle2" color="textSecondary">
          {label}
        </Typography>
        <Typography fontWeight={500}           sx={{ color: statusColors[value.toLowerCase()] || "text.primary" }}>{value}</Typography>
      </Box>
    ))}
  </Box>
) : (
  <Typography textAlign="center">No booking selected</Typography>
)}

          </CardContent>
        </Card>
      </Box>

      {/* Right Panel: Booking List */}
      <Box flex={1} minWidth="250px">
        <Paper elevation={3}>
          <Box p={2}>
            <Typography variant="subtitle1" gutterBottom>
              Booked Test Drives
            </Typography>
            <List>
              {bookings.map((booking) => (
                <ListItem key={booking.id} disablePadding>
                  <ListItemButton
                    selected={selectedBooking?.id === booking.id}
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <ListItemText
                      primary={booking.name}
                      secondary={`${booking.brand_name} ${booking.model_name} ${booking.variant_name} - ${new Date(
                        booking.preferred_datetime
                      ).toLocaleDateString()}`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default TestDriveDashboard;
