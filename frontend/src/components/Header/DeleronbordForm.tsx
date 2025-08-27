"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  MenuItem,
  Paper,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
} from "@mui/material";
// Using Box-based layout to avoid Grid type issues
import InputAdornment from "@mui/material/InputAdornment";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import PhoneIphoneOutlinedIcon from "@mui/icons-material/PhoneIphoneOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import LocationCityOutlinedIcon from "@mui/icons-material/LocationCityOutlined";
import AddIcon from "@mui/icons-material/Add";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { axiosInstance } from "../../utils/axiosInstance";
import OtpBoxes from "../common/otp/OtpBoxes";

type BasicDetails = {
  fullName: string;
  mobileNumber: string;
  addressLine: string;
  state: string;
  city: string;
  // Optional, additional details
  building: string; // Shop/building no.
  floorOrTower: string; // Floor/tower
  landmark: string; // Nearby landmark
};

const INDIAN_STATES: string[] = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
];

const steps = ["Fill Details", "Timings", "Upload Images", "Verify", "Done"];

export default function DeleronbordForm(): React.ReactElement {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [details, setDetails] = useState<BasicDetails>({
    fullName: "",
    mobileNumber: "",
    addressLine: "",
    state: "",
    city: "",
    building: "",
    floorOrTower: "",
    landmark: "",
  });
  const [submitAttempted, setSubmitAttempted] = useState<boolean>(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  // OTP verification state for mobile number
  const [otpRequested, setOtpRequested] = useState<boolean>(false);
  const [otpSending, setOtpSending] = useState<boolean>(false);
  const [otpVerifying, setOtpVerifying] = useState<boolean>(false);
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState<string>("");
  const [demoOtpCode, setDemoOtpCode] = useState<string>("");
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [dialogOtpCode, setDialogOtpCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);

  // Opening hours schedule (UI only)
  type TimeSlot = { openTime: string; closeTime: string };
  type DaySchedule = { day: string; isOpen: boolean; slots: TimeSlot[] };
  const DEFAULT_SCHEDULE: DaySchedule[] = [
    { day: "Monday", isOpen: false, slots: [{ openTime: "10:00", closeTime: "22:00" }] },
    { day: "Tuesday", isOpen: false, slots: [{ openTime: "10:00", closeTime: "22:00" }] },
    { day: "Wednesday", isOpen: false, slots: [{ openTime: "10:00", closeTime: "22:00" }] },
    { day: "Thursday", isOpen: false, slots: [{ openTime: "10:00", closeTime: "22:00" }] },
    { day: "Friday", isOpen: false, slots: [{ openTime: "10:00", closeTime: "22:00" }] },
    { day: "Saturday", isOpen: false, slots: [{ openTime: "10:00", closeTime: "22:00" }] },
    { day: "Sunday", isOpen: false, slots: [{ openTime: "10:00", closeTime: "22:00" }] },
  ];
  const [schedule, setSchedule] = useState<DaySchedule[]>(DEFAULT_SCHEDULE);
  const [timingsAttempted, setTimingsAttempted] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const errors = useMemo(() => {
    const e: Partial<Record<keyof BasicDetails, string>> = {};
    if (!details.fullName.trim()) e.fullName = "Required";
    if (!/^\d{10}$/.test(details.mobileNumber)) e.mobileNumber = "10-digit mobile";
    if (!details.addressLine.trim()) e.addressLine = "Required";
    if (!details.state) e.state = "Required";
    if (!details.city.trim()) e.city = "Required";
    return e;
  }, [details]);

  const isStepOneValid = Object.keys(errors).length === 0 && otpVerified;

  const handleChange = (
    field: keyof BasicDetails,
    value: string
  ) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
  };

  const markTouched = (_field: keyof BasicDetails) => {};

  const handleNext = async () => {
    if (activeStep === 0) {
      setSubmitAttempted(true);
      if (!isStepOneValid) return;
    }
    if (activeStep === 1) {
      setTimingsAttempted(true);
      const hasOpenDay = (schedule || []).some((d) => d.isOpen);
      if (!hasOpenDay) return;
    }
    if (activeStep === 3) {
      // Submitting on verify → done
      await submitForm();
      setActiveStep((s) => Math.min(s + 1, steps.length - 1));
      return;
    }
    setActiveStep((s) => Math.min(s + 1, steps.length - 1));
  };

  async function fileToDataUrl(file: File): Promise<{ name: string; type: string; dataUrl: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ name: file.name, type: file.type, dataUrl: String(reader.result) });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function submitForm(): Promise<void> {
    try {
      setSubmitLoading(true);
      setSubmitError(null);

      // Build payload
      const openDays = (schedule || [])
        .filter((d) => d.isOpen)
        .map((d) => ({ day: d.day, slots: d.slots.map((s) => ({ openTime: s.openTime, closeTime: s.closeTime })) }));

      const imagePayload = await Promise.all(images.map((f) => fileToDataUrl(f)));

      const payload = {
        basicDetails: {
          fullName: details.fullName,
          mobileNumber: details.mobileNumber,
          addressLine: details.addressLine,
          state: details.state,
          city: details.city,
          building: details.building || undefined,
          floorOrTower: details.floorOrTower || undefined,
          landmark: details.landmark || undefined,
        },
        timings: openDays,
        images: imagePayload,
        // Dummy metadata to help your admin panel
        createdAt: new Date().toISOString(),
        source: "dealer-onboarding",
      };

      // Dummy API endpoint; replace with your real backend URL path
      // Example expected admin payload contract
      // POST /api/dealers -> { id: string, ...payload }
      const resp = await axiosInstance.post<{ id?: string }>("/api/dealers", payload);
      const newId = (resp as any)?.id || (resp as any)?.data?.id || crypto.randomUUID();
      setSubmittedId(String(newId));
    } catch (err: any) {
      setSubmitError(err?.data?.message || err?.message || "Failed to submit");
    } finally {
      setSubmitLoading(false);
    }
  }

  const handleBack = () => setActiveStep((s) => Math.max(s - 1, 0));

  async function requestOtp(): Promise<void> {
    try {
      setOtpSending(true);
      setOtpError(null);
      // Demo: generate a random 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setDemoOtpCode(code);
      setOtpRequested(true);
      // Show the code for demo purposes
      alert(`Demo OTP sent: ${code}`);
    } catch (e: any) {
      setOtpError("Failed to send OTP");
    } finally {
      setOtpSending(false);
    }
  }

  async function verifyOtp(codeOverride?: string): Promise<void> {
    try {
      setOtpVerifying(true);
      setOtpError(null);
      // Demo: check if entered code matches demoOtpCode
      const codeToCheck = codeOverride ?? otpCode;
      if (codeToCheck === demoOtpCode) {
        setOtpVerified(true);
        setOtpRequested(false);
      } else {
        setOtpError("Invalid OTP");
      }
    } catch (e: any) {
      setOtpError("Failed to verify OTP");
    } finally {
      setOtpVerifying(false);
    }
  }
  

  // Global Enter key to trigger Next on any step
  useEffect(() => {
    const handleWindowKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleNext();
      }
    };
    window.addEventListener("keydown", handleWindowKeyDown);
    return () => window.removeEventListener("keydown", handleWindowKeyDown);
  }, [activeStep, details, images, submitAttempted]);

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };
  // Remove image
  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  // Start timer when OTP is requested or dialog is opened
  useEffect(() => {
    if (otpDialogOpen && otpRequested) {
      setResendTimer(60);
      setCanResend(false);
    }
  }, [otpDialogOpen, otpRequested]);

  // Countdown effect
  useEffect(() => {
    if (!otpDialogOpen) return;
    if (resendTimer <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendTimer, otpDialogOpen]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const otpLength = 6;

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Box
        sx={{
          maxWidth: 1100,
          mx: "auto",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "300px 1fr" },
          gap: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2,
            position: { md: "sticky" },
            top: { md: 16 },
            height: { md: "fit-content" },
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            background: (theme) => theme.palette.background.paper,
          }}
        >
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            Onboarding
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
            Follow the steps to complete your dealer profile.
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Stepper
            activeStep={activeStep}
            orientation="vertical"
            sx={{
              "& .MuiStepLabel-label": { fontSize: 14 },
              "& .MuiStep-root": { pb: 1 },
            }}
          >
            {(steps || []).map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            background: (theme) => theme.palette.background.paper,
          }}
        >
          {activeStep === 0 && (
            <Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Basic details
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Tell us a bit about you and your dealership.
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField
                label="Full Name"
                value={details.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                onBlur={() => markTouched("fullName")}
                error={submitAttempted && Boolean(errors.fullName)}
                helperText={submitAttempted ? errors.fullName : " "}
                fullWidth
                size="small"
                autoComplete="name"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Mobile Number"
                value={details.mobileNumber}
                onChange={(e) => {
                  const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 10);
                  handleChange("mobileNumber", onlyDigits);
                  if (onlyDigits.length < 10) {
                    setOtpVerified(false);
                    setOtpRequested(false);
                  }
                }}
                onBlur={() => markTouched("mobileNumber")}
                error={submitAttempted && Boolean(errors.mobileNumber)}
                helperText={submitAttempted ? errors.mobileNumber : " "}
                fullWidth
                size="small"
                inputMode="numeric"
                autoComplete="tel"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIphoneOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment:
                    details.mobileNumber.length === 10 && !otpVerified && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'primary.main',
                          fontSize: '0.85rem',
                          textTransform: 'none',
                          cursor: otpSending ? 'not-allowed' : 'pointer',
                          userSelect: 'none',
                          ml: 1,
                          whiteSpace: 'nowrap',
                          '&:hover': { textDecoration: otpSending ? 'none' : 'underline' },
                          opacity: otpSending ? 0.5 : 1,
                        }}
                        onClick={!otpSending ? () => { requestOtp(); setOtpDialogOpen(true); } : undefined}
                        component="span"
                      >
                        {otpSending ? 'Sending…' : 'Verify otp'}
                      </Typography>
                    ),
                }}
              />
              {details.mobileNumber.length === 10 && !otpVerified && otpRequested && (
                <Dialog open={otpDialogOpen} onClose={() => setOtpDialogOpen(false)} maxWidth="xs" fullWidth fullScreen={isMobile}>
                  <DialogContent sx={{ textAlign: 'center', pt: isMobile ? 8 : 4, pb: 2, position: 'relative' }}>
                    {isMobile ? (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: 56,
                          bgcolor: 'primary.main',
                          color: 'common.white',
                          display: 'flex',
                          alignItems: 'center',
                          px: 2,
                          zIndex: 10,
                        }}
                      >
                        <IconButton
                          onClick={() => { setOtpDialogOpen(false); setDialogOtpCode(""); }}
                          sx={{ color: 'common.white', mr: 1 }}
                          aria-label="back"
                          edge="start"
                        >
                          <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Verify OTP
                        </Typography>
                      </Box>
                    ) : (
                      <IconButton
                        onClick={() => { setOtpDialogOpen(false); setDialogOtpCode(""); }}
                        sx={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }}
                        aria-label="back"
                      >
                        <ArrowBackIcon />
                      </IconButton>
                    )}
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 8px 32px 0 rgba(0, 114, 255, 0.15)",
                        mx: "auto",
                        mb: 2,
                      }}
                    >
                      <VpnKeyIcon sx={{ color: "#fff", fontSize: 40 }} />
                    </Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        background: 'linear-gradient(to right, #00c6ff, #0072ff)',
                        backgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 2,
                        fontSize: { xs: 28, sm: 32 },
                      }}
                    >
                      Enter OTP
                    </Typography>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        await verifyOtp(dialogOtpCode);
                        if (dialogOtpCode === demoOtpCode) setOtpDialogOpen(false);
                      }}
                    >
                      <OtpBoxes
                        length={otpLength}
                        value={dialogOtpCode}
                        onChange={setDialogOtpCode}
                        autoFocus
                        disabled={otpVerifying}
                      />
                      {otpError && (
                        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>{otpError}</Typography>
                      )}
                      <Box sx={{ mt: 2, mb: 1, display: 'flex', justifyContent: 'center' }}>
                        {canResend ? (
                          <Button
                            variant="text"
                            size="small"
                            onClick={async () => { await requestOtp(); setResendTimer(60); setCanResend(false); }}
                            disabled={otpVerifying}
                          >
                            Resend OTP
                          </Button>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Resend in {resendTimer}s
                          </Typography>
                        )}
                      </Box>
                      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                        <Button
                          variant="contained"
                          size="medium"
                          type="submit"
                          disabled={otpVerifying || dialogOtpCode.length < otpLength}
                        >
                          {otpVerifying ? 'Verifying…' : 'Verify OTP'}
                        </Button>
                      </DialogActions>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
              {details.mobileNumber.length === 10 && otpVerified && (
                <Typography variant="caption" color="success.main" sx={{ gridColumn: { sm: '1 / span 2' } }}>
                  Mobile number verified
                </Typography>
              )}
              {/* Address - Row 1: Shop/Building and Floor/Tower (UI only) */}
              <TextField
                label="Shop no. / building no. (optional)"
                value={details.building}
                onChange={(e) => handleChange("building", e.target.value)}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ApartmentOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Floor / tower (optional)"
                value={details.floorOrTower}
                onChange={(e) => handleChange("floorOrTower", e.target.value)}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationCityOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              {/* Address - Row 2: Area/Sector/Locality (binds to addressLine) and City */}
              <TextField
                label="Area / Sector / Locality"
                value={details.addressLine}
                onChange={(e) => handleChange("addressLine", e.target.value)}
                onBlur={() => markTouched("addressLine")}
                error={submitAttempted && Boolean(errors.addressLine)}
                helperText={submitAttempted ? errors.addressLine : " "}
                fullWidth
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': { alignItems: 'center' },
                }}
                autoComplete="street-address"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HomeOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="City"
                value={details.city}
                onChange={(e) => handleChange("city", e.target.value)}
                onBlur={() => markTouched("city")}
                error={submitAttempted && Boolean(errors.city)}
                helperText={submitAttempted ? errors.city : " "}
                fullWidth
                size="small"
                autoComplete="address-level2"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationCityOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              {/* Address - Row 3: State and Landmark */}
              <TextField
                select
                label="State"
                value={details.state}
                onChange={(e) => handleChange("state", e.target.value)}
                onBlur={() => markTouched("state")}
                error={submitAttempted && Boolean(errors.state)}
                helperText={submitAttempted ? errors.state : " "}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PublicOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              >
                {INDIAN_STATES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Add any near by landmark (optional)"
                value={details.landmark}
                onChange={(e) => handleChange("landmark", e.target.value)}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PlaceOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              </Box>
              {/* Actions are provided by the global button group below for non-upload steps */}
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                Mark open days
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                Don’t forget to uncheck your off-day
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
                {(schedule || []).map((s, idx) => (
                  <Chip
                    key={s.day}
                    label={s.day}
                    color={s.isOpen ? 'primary' : 'default'}
                    variant={s.isOpen ? 'filled' : 'outlined'}
                    onClick={() => setSchedule(prev => prev.map((d, i) => i === idx ? { ...d, isOpen: !d.isOpen } : d))}
                  />
                ))}
              </Box>

              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                Day wise timings
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: timingsAttempted && !(schedule || []).some(d => d.isOpen) ? 'error.main' : 'text.secondary' }}>
                  {timingsAttempted && !(schedule || []).some(d => d.isOpen) ? 'Select at least one open day to continue' : ' '}
                </Typography>
                <Button size="small" startIcon={<ContentCopyOutlinedIcon />} onClick={() => {
                  // copy first open day's slots to all open days
                  const firstOpen = schedule.find(d => d.isOpen);
                  if (!firstOpen) return;
                  setSchedule(prev => prev.map(d => d.isOpen ? { ...d, slots: [...firstOpen.slots] } : d));
                }}>Copy to all</Button>
              </Box>
              {(schedule || []).map((s, dayIdx) => (
                <Box key={s.day} sx={{ mb: 2, display: s.isOpen ? 'block' : 'none' }}>
                  <Typography sx={{ mb: 1, fontWeight: 500 }}>{s.day}</Typography>
                  {(s.slots || []).map((slot, slotIdx) => (
                    <Paper key={slotIdx} variant="outlined" sx={{ p: 1.5, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr auto' }, gap: 1, alignItems: 'center', mb: 1 }}>
                      <TextField
                        type="time"
                        size="small"
                        value={slot.openTime}
                        disabled={!s.isOpen}
                        onChange={(e) => {
                          const v = e.target.value;
                          setSchedule(prev => prev.map((d, i) => i !== dayIdx ? d : ({ ...d, slots: d.slots.map((t, j) => j === slotIdx ? { ...t, openTime: v } : t) }))); 
                        }}
                        inputProps={{ step: 300 }}
                      />
                      <TextField
                        type="time"
                        size="small"
                        value={slot.closeTime}
                        disabled={!s.isOpen}
                        onChange={(e) => {
                          const v = e.target.value;
                          setSchedule(prev => prev.map((d, i) => i !== dayIdx ? d : ({ ...d, slots: d.slots.map((t, j) => j === slotIdx ? { ...t, closeTime: v } : t) }))); 
                        }}
                        inputProps={{ step: 300 }}
                      />
                      <IconButton aria-label="remove" onClick={() => setSchedule(prev => prev.map((d, i) => i !== dayIdx ? d : ({ ...d, slots: d.slots.filter((_, j) => j !== slotIdx) })))} disabled={s.slots.length <= 1}>
                        <DeleteOutlineOutlinedIcon />
                      </IconButton>
                    </Paper>
                  ))}
                  <Button size="small" startIcon={<AddCircleOutlineOutlinedIcon />} onClick={() => setSchedule(prev => prev.map((d, i) => i !== dayIdx ? d : ({ ...d, slots: [...d.slots, { openTime: '10:00', closeTime: '18:00' }] })))}>
                    Add more time slots
                  </Button>
                </Box>
              ))}
            </Box>
          )}

          {activeStep === 2 && (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
              <input
                accept="image/*"
                id="dealer-image-upload"
                type="file"
                multiple
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
              <label htmlFor="dealer-image-upload">
                <Box
                  sx={{
                    width: 140,
                    height: 140,
                    border: "2px dashed",
                    borderColor: "divider",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    mb: 2,
                    transition: "all .2s ease",
                    '&:hover': { backgroundColor: 'action.hover' },
                  }}
                >
                  <AddIcon sx={{ fontSize: 64, color: "text.secondary" }} />
                </Box>
              </label>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Upload dealer images (multiple allowed)
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
                {(imagePreviews || []).map((src, idx) => (
                  <Box key={idx} sx={{ position: "relative" }}>
                    <img
                      src={src}
                      alt={`upload-${idx}`}
                      style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)" }}
                    />
                    <Button
                      size="small"
                      onClick={() => handleRemoveImage(idx)}
                      sx={{ position: "absolute", top: -10, right: -10, minWidth: 0, p: '2px 6px', lineHeight: 1, borderRadius: 10 }}
                    >
                      ×
                    </Button>
                  </Box>
                ))}
              </Box>
              <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
                <Button variant="outlined" onClick={handleBack} disabled={false}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ minWidth: 140, flex: { xs: 1, sm: 0 } }}
                >
                  {activeStep === steps.length - 1 ? "Finish" : "Next"}
                </Button>
              </Box>
            </Box>
          )}

          {activeStep === 3 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                Verify your details
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                Please confirm everything looks correct before finishing.
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '200px 1fr' },
                rowGap: 1,
                columnGap: 2,
                mb: 2,
              }}>
                <Typography sx={{ color: 'text.secondary' }}>Name</Typography>
                <Typography>{details.fullName || '-'}</Typography>
                <Typography sx={{ color: 'text.secondary' }}>Mobile</Typography>
                <Typography>{details.mobileNumber || '-'}</Typography>
                <Typography sx={{ color: 'text.secondary' }}>Address</Typography>
                <Typography>{details.addressLine || '-'}</Typography>
                {(details.building || details.floorOrTower || details.landmark) && (
                  <>
                    <Typography sx={{ color: 'text.secondary' }}>Building</Typography>
                    <Typography>{details.building || '-'}</Typography>
                    <Typography sx={{ color: 'text.secondary' }}>Floor/Tower</Typography>
                    <Typography>{details.floorOrTower || '-'}</Typography>
                    <Typography sx={{ color: 'text.secondary' }}>Landmark</Typography>
                    <Typography>{details.landmark || '-'}</Typography>
                  </>
                )}
                <Typography sx={{ color: 'text.secondary' }}>State</Typography>
                <Typography>{details.state || '-'}</Typography>
                <Typography sx={{ color: 'text.secondary' }}>City</Typography>
                <Typography>{details.city || '-'}</Typography>
                <Typography sx={{ color: 'text.secondary' }}>Images</Typography>
                <Typography>{images.length}</Typography>
              </Box>

              {(imagePreviews || []).length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontWeight: 600, mb: 1 }}>Uploaded images</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {(imagePreviews || []).map((src, idx) => (
                      <Box key={idx} sx={{ position: 'relative' }}>
                        <img
                          src={src}
                          alt={`verify-upload-${idx}`}
                          style={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(0,0,0,0.12)' }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              <Box sx={{ mt: 1 }}>
                <Typography sx={{ fontWeight: 600, mb: 1 }}>Timings</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '200px 1fr' }, rowGap: 0.5, columnGap: 2 }}>
                  {(schedule || []).map((s) => (
                    <React.Fragment key={s.day}>
                      <Typography sx={{ color: 'text.secondary' }}>{s.day}</Typography>
                      <Typography>{s.isOpen ? (s.slots || []).map(sl => `${sl.openTime}-${sl.closeTime}`).join(', ') : 'Closed'}</Typography>
                    </React.Fragment>
                  ))}
                </Box>
              </Box>
            </Box>
          )}

          {activeStep === 4 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                All set!
              </Typography>
              {submitLoading && (
                <Typography variant="body2">Submitting...</Typography>
              )}
              {!submitLoading && submitError && (
                <Typography variant="body2" color="error">{submitError}</Typography>
              )}
              {!submitLoading && !submitError && (
                <Typography variant="body2">
                  Your details have been captured{submittedId ? ` (ID: ${submittedId})` : ''}. You can proceed with the next steps.
                </Typography>
              )}
            </Box>
          )}

          {/* Only show the button group outside for the non-upload steps */}
          {activeStep !== 2 && (
            <Box sx={{ display: "flex", gap: 1, mt: 3, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <Button variant="outlined" onClick={handleBack} disabled={activeStep === 0} sx={{ minWidth: 120, flex: { xs: 1, sm: 0 } }}>
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{ minWidth: 140, flex: { xs: 1, sm: 0 } }}
              >
                {activeStep === steps.length - 1 ? "Finish" : "Next"}
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}


