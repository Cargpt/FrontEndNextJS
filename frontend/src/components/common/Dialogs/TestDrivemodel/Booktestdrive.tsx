import React, { useState, useEffect } from 'react';
import { axiosInstance1 } from '@/utils/axiosInstance'; // Assuming this is correctly configured
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
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';
import dayjs, { Dayjs } from 'dayjs';

// Define a more specific interface for carDetails passed to this component
interface CarDetailsForBooking {
  BrandID: number;
  ModelID: number;
  VariantID: number;
  BrandName: string;
  ModelName: string;
  // VariantName is optional in TeslaCard, so make it optional here too if it's not strictly required
  VariantName?: string;
}

interface BookTestDriveProps {
  open: boolean;
  onClose: () => void;
  carDetails: CarDetailsForBooking; // Use the specific interface
}

const BookTestDrive: React.FC<BookTestDriveProps> = ({ open, onClose, carDetails }) => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [preferredDatetime, setPreferredDatetime] = useState<Dayjs | null>(dayjs());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [statesLoading, setStatesLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);

  // Fetch states when the dialog opens
  useEffect(() => {
    const fetchStates = async () => {
      if (open) {
        setStatesLoading(true);
        setError(null);
        try {
          const responseData = await axiosInstance1.get('/api/core/statecity/');
          // Assuming the API returns an object like { "states": ["State1", "State2"] }
          setAvailableStates(responseData.states || []);
        } catch (err) {
          setError('Could not load states. Please try again.');
          console.error('Failed to fetch states:', err);
        } finally {
          setStatesLoading(false);
        }
      }
    };

    fetchStates();
  }, [open]);

  const handleStateChange = async (event: SelectChangeEvent<string>) => {
    const selectedState = event.target.value;
    setState(selectedState);
    setCity(''); // Reset city
    setCities([]); // Clear previous cities

    if (selectedState) {
      setCitiesLoading(true);
      setError(null);
      try {
        const responseData = await axiosInstance1.get(`/api/core/statecity/?state=${selectedState}`);
        // Assuming API returns an object like { "cities": ["CityA", "CityB"] }
        setCities(responseData.cities || []);
      } catch (err) {
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

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Frontend validation
    if (!name || !mobile || !state || !city || !preferredDatetime) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }
    if (mobile.length !== 10) {
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
      // Add BrandName and ModelName for logging/debug if needed on backend
      // brand_name: carDetails.BrandName,
      // model_name: carDetails.ModelName,
      // variant_name: carDetails.VariantName, // Include if applicable
    };

    try {
      const responseData = await axiosInstance1.post('/api/core/test-drive-booking/', bookingData);

      // The custom fetch wrapper returns the JSON body directly on success.
      // If we get here, the request was successful.
      setSuccess(responseData?.message || "Test Drive Booking Successfully Created");
      console.log('Test drive booking successful:', responseData);

      setTimeout(() => {
        onClose(); // Close the dialog
        resetForm(); // Reset form fields for next use
      }, 3000); // Give user time to read success message

    } catch (err: any) {
      // The custom fetch wrapper throws an object on error, not an AxiosError.
      if (err.data) {
        const errorDetail = err.data;
        setError(errorDetail.detail || errorDetail.message || JSON.stringify(errorDetail) || 'Failed to book test drive.');
        console.error('Test drive booking error (server response):', errorDetail);
      } else {
        // Something else happened while setting up the request
        setError(err.message || 'An unexpected error occurred during booking.');
        console.error('Test drive booking error (request setup):', err.message);
      }
    } finally {
      setLoading(false); // Always stop loading, even on error
    }
  };

  const resetForm = () => {
    setName('');
    setMobile('');
    setState('');
    setCity('');
    setPreferredDatetime(dayjs()); // Reset to current time
    setError(null);
    setSuccess(null);
  };

  // Effect to reset form when dialog is opened
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]); // Depend on 'open' prop

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
        Book Test Drive for {carDetails.BrandName} {carDetails.ModelName}
      </DialogTitle>
      <DialogContent dividers>
        <Box component="form" noValidate autoComplete="off">
          {/* Row 1: Name and Mobile Number */}
          <Box
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
              type="tel" // Use type="tel" for mobile numbers
              inputProps={{ maxLength: 10 }} // HTML maxLength attribute
              value={mobile}
              onChange={handleMobileChange} // Use the new handler for validation
              disabled={loading}
              sx={{ flexGrow: 1 }}
            />
          </Box>

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
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {/* Map over the dynamically fetched cities */}
                {cities.map((c, index) => (
                  <MenuItem key={`${c}-${index}`} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Row 3: Preferred Date and Time (full width) */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MobileDateTimePicker
              label="Preferred Date and Time"
              value={preferredDatetime}
              onChange={(newValue: Dayjs | null) => setPreferredDatetime(newValue)}
              disablePast // Prevent selecting past dates/times
              sx={{ mt: 2, mb: 2, width: '100%' }}
              disabled={loading}
              slotProps={{
                // No 'popper' needed here, 'dialog' is correct for MobileDateTimePicker
                dialog: { // This targets the dialog that MobileDateTimePicker opens
                  PaperProps: {
                    sx: {
                      zIndex: 1500, // Ensure the picker's dialog is on top of everything else
                    },
                  },
                },
                // Add any other slotProps if needed, e.g., textField
                textField: {
                  required: true, // Mark the text field as required
                  fullWidth: true,
                },
              }}
              format="MM/DD/YYYY hh:mm A" // Consistent date/time format
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading} color="primary">
          {loading ? 'Booking...' : 'Submit Booking'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookTestDrive;