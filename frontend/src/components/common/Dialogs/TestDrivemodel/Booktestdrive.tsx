import React, { useState, useEffect } from 'react';
import { useAndroidBackClose } from '@/hooks/useAndroidBackClose';
import { axiosInstance1 } from '@/utils/axiosInstance';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  SelectChangeEvent,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';
import dayjs, { Dayjs } from 'dayjs';
import { useCookies } from 'react-cookie';
import { KeyboardBackspaceSharp } from "@mui/icons-material";
import { useColorMode } from "@/Context/ColorModeContext";
import { Capacitor } from '@capacitor/core';

// Define a more specific interface for carDetails passed to this component
interface CarDetailsForBooking {
  BrandID: number;
  ModelID: number;
  VariantID: number;
  BrandName: string;
  ModelName: string;
  VariantName?: string;
}
interface BookTestDriveProps {
  open: boolean;
  onClose: () => void;
  carDetails: CarDetailsForBooking;
}
const BookTestDrive: React.FC<BookTestDriveProps> = ({ open, onClose, carDetails }) => {
  const theme = useTheme(); // Initialize useTheme
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm')); // Detect small screens
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState(''); // New state for pincode
  const [preferredDatetime, setPreferredDatetime] = useState<Dayjs | null>(dayjs().add(1, 'day'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [statesLoading, setStatesLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);
  // Fetch states when the dialog opens
const [cookies]=useCookies(['user'])

  const {mode}=useColorMode()
  useEffect(() => {
    const fetchStates = async () => {
      if (open) { // Only fetch when dialog is open
        setStatesLoading(true);
        setError(null);
        try {
          // Assuming axiosInstance1 returns the data directly (e.g., via an interceptor)
          // If it returns the full Axios response, use response.data.states
          const responseData = await axiosInstance1.get('/api/core/statecity/');
          // Ensure responseData has a 'states' property, or adjust based on actual API response
          setAvailableStates(responseData?.states || []);
        } catch (err: any) {
          setError('Could not load states. Please try again.');
          console.error('Failed to fetch states:', err);
        } finally {
          setStatesLoading(false);
        }
      }
    };
    fetchStates();
  }, [open]); // Depend on 'open' prop
  const handleStateChange = async (event: SelectChangeEvent<string>) => {
    const selectedState = event.target.value;
    setState(selectedState);
    setCity(''); // Reset city
    setCities([]); // Clear previous cities
    if (selectedState) {
      setCitiesLoading(true);
      setError(null);
      try {
        // Assuming axiosInstance1 returns the data directly
        const responseData = await axiosInstance1.get(`/api/core/statecity/?state=${selectedState}`);
        // Ensure responseData has a 'cities' property, or adjust based on actual API response
        setCities(responseData?.cities || []);
      } catch (err: any) {
        setError('Could not load cities for the selected state.');
        console.error(`Failed to fetch cities for state ${selectedState}:`, err);
      } finally {
        setCitiesLoading(false);
      }
    }
  };
  // Basic validation for mobile number
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only digits and limit to 10 characters
    if (/^\d*$/.test(value) && value.length <= 10) {
      setMobile(value);
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only digits and limit to 6 characters for pincode
    if (/^\d*$/.test(value) && value.length <= 6) {
      setPincode(value);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    // Frontend validation
    if (!name || !mobile || !state || !city || !pincode || !preferredDatetime) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }
    if (!mobile.length) {
      setError('Mobile number must be exactly 10 digits.');
      setLoading(false);
      return;
    }
    if (
      carDetails.BrandID === undefined ||
      carDetails.ModelID === undefined ||
      carDetails.VariantID === undefined
    ) {
      setError("Internal error: Missing car identification details (Brand ID, Model ID, or Variant ID). Please try again or contact support.");
      setLoading(false);
      return;
    }
    const bookingData = {
      name: name,
      mobile: mobile,
      state: state,
      city: city,
      preferred_datetime: preferredDatetime.toISOString(), // Ensure ISO string format
      brand: carDetails.BrandID,
      model: carDetails.ModelID,
      variant: carDetails.VariantID,
      pincode: pincode, // Add pincode to booking data
    };
    try {
      // The custom fetch wrapper returns the JSON body directly on success
      const responseData: any = await axiosInstance1.post('/api/core/test-drive-booking/', bookingData);
      const serverSuccessMessage =
        responseData?.message ||
        responseData?.detail ||
        responseData?.success ||
        responseData?.status ||
        'Thanks for using AiCarAdvisor! Our representative will get connected with you.';
      setSuccess(String(serverSuccessMessage));
      console.log('Test drive booking successful:', responseData);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 3000);
    } catch (err: any) {
      console.log(err)
      // The request helper throws an object with 'data' on error
      if (err?.data) {
        const data = err.data;
        // Try common API error fields first
        let serverErrorMessage =
          data?.message ||
          data?.detail ||
          data?.error ||
          data?.errors ||
          data?.non_field_errors?.[0] ||
          data?.preferred_datetime?.[0] ||
          data?.mobile?.[0] ||
          data?.pincode?.[0] ||
          data?.city?.[0] ||
          data?.state?.[0];

        if (!serverErrorMessage && typeof data === 'object') {
          // Fallback: get first string value from object
          const firstValue = Object.values(data).find((v: any) => typeof v === 'string' || Array.isArray(v));
          serverErrorMessage = Array.isArray(firstValue) ? firstValue?.[0] : firstValue;
        }

        setError(String(serverErrorMessage || 'Failed to book test drive.'));
        console.error('Test drive booking error (server response):', data);
      } else {
        setError(err?.message || 'An unexpected error occurred during booking.');
        console.error('Test drive booking error (request setup):', err?.message);
      }
    } finally {
      setLoading(false);
    }
  };
  const resetForm = () => {
    setName('');
    setMobile('');
    setState('');
    setCity('');
    setPincode(''); // Reset pincode
  setPreferredDatetime(dayjs().add(1, 'day')); // <-- next day here too
    setError(null);
    setSuccess(null);
  };
  // Effect to reset form when dialog is opened
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);


   useEffect(() => {
    if(cookies.user){
      setName(`${cookies.user?.first_name} ${cookies.user?.last_name}`)
      setMobile(`${cookies.user?.mobile_no ? cookies.user?.mobile_no : cookies?.user?.mobile_no_read}`)
      setPincode(`${cookies.user?.pincode || ''}`); // Populate pincode from cookies
    }
  
   
  }, [cookies?.user])
 const isNative=Capacitor.isNativePlatform()
  console.log("user", mobile)
  useAndroidBackClose(open, onClose);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs" // Keep maxWidth for larger screens, but it will be overridden by fullScreen
      fullScreen={isSmallScreen} // Apply fullScreen prop conditionally
      PaperProps={{
        sx: {
          // Additional styling for the dialog paper, if needed
          // For full screen, you might want to remove default margins on small screens
          margin: isSmallScreen ? 0 : '32px', // Remove margin on small screens
          borderRadius: isSmallScreen ? 0 : '8px', // Remove border-radius on small screens
        },
      }}
    >
  
<DialogTitle
        sx={{
          bgcolor: mode=="dark"? "dark":"grey.100",
          position: "sticky",
          top: 0,
          pt: 'calc(var(--android-top-gap, 0px) + env(safe-area-inset-top, 0px))',
          minHeight: 56,
          zIndex: 2,
          textAlign: "center",
          fontWeight: 700,
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            position: "absolute",
            left: 'calc(env(safe-area-inset-left, 0px) + 8px)',
            top: 'calc(env(safe-area-inset-top, 0px) + var(--android-top-gap, 8px) + 8px)',
            zIndex: 3,
            border: "none",
            minWidth: 0,
            p: 1,
          }}
        >
          <KeyboardBackspaceSharp />
        </Button>
        <Typography sx={{
          mt: isNative?2:3    }}>
                  Book Test Drive for {carDetails.BrandName} {carDetails.ModelName}

        </Typography>
        </DialogTitle>


      <DialogContent dividers>
        <Box component="form" noValidate autoComplete="off">
          {/* Row 1: Name and Mobile Number */}
          {/* <Box
            sx={{
              display: 'flex',
              gap: 2,
              mb: 2,
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            <TextField
              margin="none"
              required
              fullWidth
              id="name"
              label="Your Name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              sx={{ flexGrow: 1 }}
            />
            <TextField
              margin="none"
              required
              fullWidth
              id="mobile"
              label="Mobile Number"
              name="mobile"
              type="tel"
              inputProps={{ maxLength: 10 }}
              value={mobile}
              onChange={handleMobileChange}
              disabled={loading}
              sx={{ flexGrow: 1 }}
            />
          </Box> */}
          {/* Row 2: State and City */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              mb: 2,
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            <FormControl fullWidth margin="none" required disabled={loading || statesLoading} sx={{ flexGrow: 1 }}>
              <InputLabel id="state-label">State</InputLabel>
              <Select
                labelId="state-label"
                id="state"
                value={state}
                label="State"
                onChange={handleStateChange}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {availableStates.map((s, index) => (
                  <MenuItem key={`${s}-${index}`} value={s}>{s}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="none" required disabled={loading || !state || citiesLoading} sx={{ flexGrow: 1 }}>
              <InputLabel id="city-label">City</InputLabel>
              <Select
                labelId="city-label"
                id="city"
                value={city}
                label="City"
                onChange={(e) => setCity(e.target.value as string)}
                disabled={!state}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {cities.map((c, index) => (
                  <MenuItem key={`${c}-${index}`} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          {/* New Row for Pincode */}
          <Box mb={2}>
            <TextField
              margin="none"
              required
              fullWidth
              id="pincode"
              label="Pincode"
              name="pincode"
              type="tel"
              inputProps={{ maxLength: 6 }}
              value={pincode}
              onChange={handlePincodeChange}
              disabled={loading}
            />
          </Box>
          {/* Row 3: Preferred Date and Time (full width) */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MobileDateTimePicker
              label="Preferred Date and Time"
              value={preferredDatetime}
              onChange={(newValue: Dayjs | null) => setPreferredDatetime(newValue)}
              disablePast
              sx={{ mt: 2, mb: 2, width: '100%' }}
              disabled={loading}
              slotProps={{
                dialog: {
                  PaperProps: {
                    sx: {
                      zIndex: 1500,
                    },
                  },
                },
                textField: {
                  required: true,
                  fullWidth: true,
                },
              }}
              format="MM/DD/YYYY hh:mm A"
            />
          </LocalizationProvider>
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
              {error}
            </Typography>
          )}
          {success && (
            <Typography color="success.main" variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
              {success}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
  <Button
    onClick={handleSubmit}
    variant="contained"
    disabled={loading}
    color="primary"
    sx={{
      px: 5,
      py: 1.5,
      borderRadius: 2,
      fontWeight: 'bold',
    }}
  >
    {loading ? 'Booking...' : 'Submit Booking'}
  </Button>
</Box>

      </DialogContent>

    </Dialog>
  );
};
export default BookTestDrive;

