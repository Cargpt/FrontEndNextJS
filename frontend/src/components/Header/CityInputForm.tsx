import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  IconButton,
  Box,
  CircularProgress,
  Autocomplete, // Added Autocomplete
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { motion } from "framer-motion";
import { axiosInstance, axiosInstance1 } from "../../utils/axiosInstance";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (city: string) => void;
  handleLocation: (isClose: boolean) => void;
};

const CityInputDialog: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  handleLocation,
}) => {
  const [city, setCity] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [noDealersMessage, setNoDealersMessage] = useState("");
  const [allAvailableCities, setAllAvailableCities] = useState<string[]>([]);
  const [loadingAllCities, setLoadingAllCities] = useState(false);

  useEffect(() => {
    const fetchAllCities = async () => {
      setLoadingAllCities(true);
      try {
        const response = await axiosInstance1.get(`/api/dealers/cities/`);
        if (response && response.length > 0) {
          setAllAvailableCities(
            response.map((item: { id: number; city: string }) => item.city)
          );
        } else {
          setAllAvailableCities([]);
        }
      } catch (error) {
        console.error("Error fetching all cities:", error);
        setAllAvailableCities([]);
      } finally {
        setLoadingAllCities(false);
      }
    };

    if (open && allAvailableCities.length === 0) {
      fetchAllCities();
    }
  }, [open, allAvailableCities.length]);

  useEffect(() => {
    if (city.length < 2) {
      setNoDealersMessage("");
      return;
    }

    setNoDealersMessage("");

    const handler = setTimeout(() => {
      const filteredCities = allAvailableCities.filter((availableCity) =>
        availableCity.toLowerCase().includes(city.toLowerCase())
      );
      if (filteredCities.length > 0) {
        setNoDealersMessage("");
      } else {
        setNoDealersMessage("No results found for your search.");
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [city, allAvailableCities]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;

    if (
      !allAvailableCities
        .map((c) => c.toLowerCase())
        .includes(city.toLowerCase())
    ) {
      setNoDealersMessage("No dealers available in your city.");
      return;
    }

    setSubmitted(true);
    onSubmit?.(city);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setCity("");
    }, 800);
  };

  const handleClose = () => {
    setLocationError("");
    setCity("");
    setNoDealersMessage("");
    onClose();
  };
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        component: motion.div,
        initial: { opacity: 0, y: 50 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 30 },
        transition: { duration: 0.4, ease: "easeOut" },
        sx: {
          borderRadius: 3,
          px: 2,
          py: 2,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, pr: 4 }}>
        Enter Your City
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: "absolute", right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Autocomplete
            fullWidth
            options={allAvailableCities}
            loading={loadingAllCities}
            disablePortal
            clearIcon={null} // Hide the default clear icon
            onOpen={() => console.log("Autocomplete opened")}
            onClose={() => console.log("Autocomplete closed")}
            filterOptions={(options, { inputValue }) => {
              const filtered = options.filter((option) =>
                option.toLowerCase().includes(inputValue.toLowerCase())
              );
              return filtered;
            }}
            value={city}
            onChange={(_, newValue) => {
              setCity(newValue || "");
              setNoDealersMessage("");
            }}
            onInputChange={(_, newInputValue) => {
              setCity(newInputValue);
              if (newInputValue.length > 0) {
                const found = allAvailableCities.some((city) =>
                  city.toLowerCase().includes(newInputValue.toLowerCase())
                );
                if (!found) {
                  setNoDealersMessage("No results found for your search.");
                } else {
                  setNoDealersMessage("");
                }
              } else {
                setNoDealersMessage("");
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="City"
                required
                autoFocus
                margin="normal"
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  sx: { borderRadius: 2 },
                  endAdornment: (
                    <>
                      {loadingAllCities ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {city && (
                        <IconButton
                          size="small"
                          onClick={() => setCity("")}
                          sx={{ mr: -1.5 }} // Adjust margin to align with default clear icon position
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      )}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          {noDealersMessage && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {noDealersMessage}
            </Typography>
          )}

          {submitted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Typography
                variant="body2"
                color="success.main"
                sx={{ mt: 2, textAlign: "center" }}
              >
                Thank you! You entered: <strong>{city}</strong>
              </Typography>
            </motion.div>
          )}
          <Box sx={{ pb: 1, display: "flex", justifyContent: "start" }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleLocation(true)}
              startIcon={
                loadingLocation ? (
                  <CircularProgress size={16} />
                ) : (
                  <MyLocationIcon />
                )
              }
              disabled={loadingLocation}
              sx={{
                mt: 1,
                textTransform: "none",
                fontWeight: 500,
                borderRadius: 2,
                border: "none",
                justifyContent: "left",
              }}
            >
              Use your current location
            </Button>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ textTransform: "none", fontWeight: 500 }}
          >
            Submit
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CityInputDialog;
