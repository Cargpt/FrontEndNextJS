'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  CircularProgress,
  useMediaQuery,
  Box,
  Input,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { axiosInstance } from '@/utils/axiosInstance';
import { useCookies } from 'react-cookie';
import { useSnackbar } from '@/Context/SnackbarContext';
import { useRouter } from 'next/navigation';

import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import { useColorMode } from '@/Context/ColorModeContext';
import { KeyboardBackspaceSharp } from "@mui/icons-material";
import OtpBoxes from "@/components/common/otp/OtpBoxes";
import { VisibilityOff, Lock, Person, VpnKey } from "@mui/icons-material";
import SvgIcon from '@mui/material/SvgIcon';
import { alpha } from "@mui/material";

interface SignupDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (password: string, mobile: string) => void;
}

const SignupDialog: React.FC<SignupDialogProps> = ({ open, onClose, onSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [signupStep, setSignupStep] = useState(0); // 0: signup form, 1: OTP verification
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);

  const [showPassword, setShowPassword] = useState(false);

  const [cookies, setCookie] = useCookies(['token', 'user']);
  const { showSnackbar } = useSnackbar();

  const router = useRouter();

  // Password validation function
  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter.";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number.";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Password must contain at least one special character.";
    }
    return null; // Password is valid
  };

  const resetState = () => {
    setFullName('');
    setPassword('');
    setConfirmPassword('');
    setMobile('');
    setLoading(false);
    setError(null);
    setSuccess(null);
    setOtp("");
    setSignupStep(0);
    setResendTimer(0);
    setCanResend(true);
  };

  const goBackToSignupForm = () => {
    setError(null);
    setSuccess(null);
    setOtp("");
    setSignupStep(0);
    setResendTimer(0);
    setCanResend(true);
  };

  const handleSetCookie = (cookieValueInput: any) => {
    setCookie('token', cookieValueInput?.token, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
    setCookie('user', cookieValueInput?.user, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setError(passwordValidationError);
      setLoading(false);
      return;
    }

    const nameParts = fullName.trim().split(' ');
    const first_name = nameParts[0];
    const last_name = nameParts?.slice(1)?.join(' ') || '';

    try {
      const payload = {
        password: password,
        mobile_no: '+' + mobile,
        first_name,
        last_name,
      };

      const response = await axiosInstance.post('/api/cargpt/register/', payload);
      console.log("Signup successful, backend response:", response.data);
      setSuccess('Signup successful!');
      showSnackbar(response?.message || "Signup successful!", {
        vertical: "top",
        horizontal: "center",
      });
      setTimeout(() => {
        setSuccess(null);
        // onSuccess(password, mobile);
        setSignupStep(1);
        setResendTimer(60);
        setCanResend(false);
      }, 1000);
    } catch (err: any) {
      console.error("Signup error:",JSON.stringify(err.response?.data, null, 2));
      let errorMessage = 'Signup failed.';

       if(err?.data){
         errorMessage=err?.data?.mobile_no?.[0]
       }
     else if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          errorMessage = Object.keys(err.response.data)
            .map(key => `${key}: ${Array.isArray(err.response.data[key]) ? err.response.data[key].join(', ') : err.response.data[key]}`)
            .join('\n');
        } else {
          errorMessage = String(err.response.data);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const payload = {
        phone_number: '+' + mobile,
        otp: Number(otp),
        purpose: "registration",
      };
      const response = await axiosInstance.post('/api/cargpt/verify-otp/', payload);
      handleSetCookie(response);
      console.log("OTP verification successful, backend response:", response.data);
      setSuccess('OTP verification successful!');
      showSnackbar(response?.message || "OTP verification successful!", {
        vertical: "top",
        horizontal: "center",
      });
      setTimeout(() => {
        setSuccess(null);
        resetState(); // Call resetState to clear form/OTP state
        onClose();
        router.push('/'); // Redirect to home page
      }, 1000);
    } catch (err: any) {
      console.error("OTP verification error:", JSON.stringify(err.response?.data, null, 2));
      let errorMessage = 'OTP verification failed.';
      if (err?.response?.data) {
        if (typeof err.response.data === 'object') {
          errorMessage = Object.keys(err.response.data)
            .map(key => `${key}: ${Array.isArray(err.response.data[key]) ? err.response.data[key].join(', ') : err.response.data[key]}`)
            .join('\n');
        } else {
          errorMessage = String(err.response.data);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || resendTimer > 0) return;

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const payload = {
        phone_number: '+' + mobile,
        purpose: "registration",
      };
      await axiosInstance.post('/api/cargpt/resend-otp/', payload);
      setSuccess("OTP resent successfully!");
      setResendTimer(60); // Start 60-second countdown
      setCanResend(false);
    } catch (err: any) {
      console.error("Resend OTP error:", JSON.stringify(err.response?.data, null, 2));
      let errorMessage = 'Failed to resend OTP.';
      if (err?.response?.data) {
        if (typeof err.response.data === 'object') {
          errorMessage = Object.keys(err.response.data)
            .map(key => `${key}: ${Array.isArray(err.response.data[key]) ? err.response.data[key].join(', ') : err.response.data[key]}`)
            .join('\n');
        } else {
          errorMessage = String(err.response.data);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const {mode}=useColorMode()

  React.useEffect(() => {
    if (resendTimer <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setTimeout(() => {
      setResendTimer(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendTimer]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={isMobile}>
      {/* Close (Back) button */}
      <IconButton
        onClick={() => {
          if (signupStep === 1) {
            setSignupStep(0);
            setError(null);
            setSuccess(null);
          } else {
            resetState();
            onClose();
          }
        }}
        sx={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top, 0px) + var(--android-top-gap, 8px) + 8px)",
          left: "calc(env(safe-area-inset-left, 0px) + 8px)",
          zIndex: 1,
          p: 1,
        }}
        aria-label="close"
      >
        <KeyboardBackspaceSharp />
      </IconButton>

      <Box
        display="flex"
        justifyContent="center"
        p={2}
        sx={{
          maxHeight: '100vh',
          overflowY: 'auto',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 3, // Reduced padding
            width: { xs: '100%', sm: 520 },
            maxWidth: 520,
            borderRadius: 3,
            backgroundColor: 'transparent',
            backdropFilter: 'none',
            border: 'none',
            boxShadow: 'none',
          }}
        >
          {signupStep === 0 && (
            <>
              <Box textAlign="center" mb={0.5} mt={-2}>
                <Box
                  sx={{
                    width: 70,
                    height: 70,
                    borderRadius: '50%',
                    background: 'linear-gradient(to right, #00c6ff, #0072ff)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 4px',
                    boxShadow: `0 8px 24px ${alpha('#667eea', 0.25)}`,
                  }}
                >
                  <Person sx={{ color: 'white', fontSize: 34 }} />
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(to right, #00c6ff, #0072ff)',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 0.2,
                    fontSize: { xs: 28, sm: 32 },
                  }}
                >
                  Welcome
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 0.2, fontSize: 16 }}>
                  SingUp to continue
                </Typography>
              </Box>
              <form onSubmit={handleSubmit}>
                {/* Full Name Field */}
                <Box mt={0.2} mb={1}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                    disabled={loading}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: '#0072ff' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 0.5,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: mode === 'dark' ? '#1e1e1e' : '#f8f9fa',
                      },
                    }}
                  />
                </Box>

                {/* PhoneInput */}
                <Box mt={0.2} mb={1}>
                  <PhoneInput
                    country={'in'}
                    value={mobile}
                    onChange={phone => setMobile(phone)}


                    disabled={loading}

                    inputProps={{
                      name: 'mobile',
                      required: true,
                    }}

                                 dropdownStyle={{
                    backgroundColor: mode==="dark" ? '#000' : '#fff',
            color: mode==="dark" ? 'ccc' : '#00',
            border: `1px solid ${mode==="dark" ? '#000' : '#ccc'}`,
                 }


                 }

                      inputStyle={{
            width: '100%',
            height: '56px',
            borderRadius: '8px',
            fontSize: '16px',
            paddingLeft: '48px',
            backgroundColor: mode==="dark" ? '#1e1e1e' : '#f8f9fa',
            color: mode==="dark" ? '#fff' : '#000',
            border: `1px solid ${mode==="dark" ? '#444' : '#ccc'}`,
          }}
          buttonStyle={{
            backgroundColor: mode==="dark" ? '#1e1e1e' : '#fff',
            border: `1px solid ${mode==="dark" ? '#444' : '#ccc'}`,
          }}
                  />
                </Box>

                {/* Password field */}
                <Box mt={0.2} mb={1}>
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: '#0072ff', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end" sx={{ width: 35, justifyContent: 'center' }}>
                          <IconButton
                            onClick={() => setShowPassword((s) => !s)}
                            edge="end"
                            aria-label="toggle password visibility"
                            size="small"
                            sx={{ p: 0 }}
                          >
                            {showPassword ? <VisibilityOff sx={{ fontSize: 22 }} /> : <SvgIcon sx={{ fontSize: 22 }}>
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5m0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3" />
                              </SvgIcon>}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 0.5,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: mode === 'dark' ? '#1e1e1e' : '#f8f9fa',
                      },
                    }}
                  />
                </Box>

                {/* Confirm Password field */}
                <Box mt={0.2} mb={1}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: '#0072ff', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: mode === 'dark' ? '#1e1e1e' : '#f8f9fa',
                        paddingRight: 0,
                      },
                    }}
                  />
                </Box>

                {error && <Alert severity="error" sx={{ mt: 0.5 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mt: 0.5 }}>{success}</Alert>}
              </form>
            </>
          )}

          {signupStep === 1 && (
            <Box>
              <Box textAlign="center" mb={1}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(to right, #00c6ff, #0072ff)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px',
                    boxShadow: `0 10px 30px ${alpha('#667eea', 0.3)}`,
                  }}
                >
                  <VpnKey sx={{ color: 'white', fontSize: 40 }} />
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(to right, #00c6ff, #0072ff)',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 0.5,
                  }}
                >
                  Enter OTP
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Please enter the 6-digit code sent to {mobile}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="center" mb={0.5}>
                <Button size="small" variant="text" onClick={goBackToSignupForm}>
                  Is the number not yours?
                </Button>
              </Box>
              <Box display="flex" justifyContent="center" mb={1.5}>
                <OtpBoxes
                  length={6}
                  value={otp}
                  onChange={setOtp}
                  autoFocus
                  disabled={loading}
                  showIcon={false}
                />
              </Box>
              {/* Manual Verify Button */}
              <Box mt={1.5} display="flex" justifyContent="center">
                <Button
                  variant="contained"
                  onClick={handleOtpVerification}
                  disabled={loading || otp.length < 6}
                  fullWidth
                  sx={{
                    mb: 1,
                    height: 50,
                    borderRadius: 2,
                    background: 'linear-gradient(to right, #00c6ff, #0072ff)',
                    boxShadow: 'none',
                    fontSize: 16,
                    '&:hover': {
                      background: 'linear-gradient(to right, #0072ff, #00c6ff)',
                    },
                  }}
                >
                  Verify OTP
                </Button>
              </Box>

              {error && <Alert severity="error" sx={{ mt: 0.5 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mt: 0.5 }}>{success}</Alert>}
              {/* Resend OTP Button with Timer */}
              <Box mt={0.5} display="flex" justifyContent="center">
                <Button
                  variant="text"
                  onClick={handleResendOtp}
                  disabled={!canResend || resendTimer > 0 || loading}
                  sx={{ minWidth: 120 }}
                >
                  {resendTimer > 0
                    ? `Resend in ${resendTimer}s`
                    : "Resend OTP"
                  }
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
      <DialogActions sx={{ p: 1, justifyContent: 'center' }}>
        {/* Only show the Sign Up button for the first step */}
        {signupStep === 0 && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{
              mb: 1,
              height: 50,
              borderRadius: 2,
              background: 'linear-gradient(to right, #00c6ff, #0072ff)',
              boxShadow: 'none',
              '&:hover': {
                background: 'linear-gradient(to right, #0072ff, #00c6ff)',
              },
            }}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </Button>
        )}
      </DialogActions>
        <style>
        {`
          .react-tel-input .special-label {
            background-color: ${mode === 'dark' ? '#333' : '#fff'} !important;
            color: ${mode === 'dark' ? '#fff' : '#000'} !important;
            border-radius: 4px;
            padding: 2px 6px;
          }
.react-tel-input .country-list .country:hover, .react-tel-input .country-list .country.highlight {
    background-color:  ${mode === 'dark' ? '#333' : '#f1f1f1'} !important;
}
        `}
      </style>
    </Dialog>
  );
};

export default SignupDialog;