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
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { axiosInstance } from '@/utils/axiosInstance';
import { useCookies } from 'react-cookie';
import { useSnackbar } from '@/Context/SnackbarContext';

import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import { useColorMode } from '@/Context/ColorModeContext';
import { KeyboardBackspaceSharp } from "@mui/icons-material";
import OtpBoxes from "@/components/common/otp/OtpBoxes";

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

  const [cookies, setCookie] = useCookies(['token', 'user']);
  const { showSnackbar } = useSnackbar();

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
      handleSetCookie(response);
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
        onSuccess(password, mobile);
        resetState(); // Call resetState to clear form/OTP state
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
          top: 8,
          left: 8,
          zIndex: 1,
        }}
        aria-label="close"
      >
        <KeyboardBackspaceSharp />
      </IconButton>

      <DialogContent
        sx={{
          overflowX: "hidden",
          p: 3, // Increased padding
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          mt: { xs: 4, sm: 2 }, // Adjust margin-top for mobile vs web
        }}
      >
        {signupStep === 0 && (
          <>
            <Box display="flex" justifyContent="center" mb={2} mt={2}>
              <img loading='lazy' src={mode==="dark"? "/assets/AICarAdvisor_transparent.png":"/assets/AICarAdvisor.png"}  height= {60} alt="Logo" style={{ height:60  }} width={300} />
            </Box>
            <Typography variant="h5" align="center" gutterBottom>
              Sign Up
            </Typography>
            <form onSubmit={handleSubmit}>
              {/* Full Name Field */}
              <Box mt={1}>
                <Input
                  type="text"
                  placeholder="Full Name"
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
                  style={{
                    width: '100%',
                    height: '56px',
                    fontSize: '16px',
                    padding: '16.5px 14px',
                    border: '1px solid #c4c4c4',
                    borderRadius: '4px',
                  }}
                />
              </Box>

              {/* PhoneInput */}
              <Box mt={2}>
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
                  backgroundColor: mode=="dark" ? '#000' : '#fff',
            color: mode=="dark" ? 'ccc' : '#00',
            border: `1px solid ${mode==="dark" ? '#000' : '#ccc'}`,
                 }


                 }

                      inputStyle={{
            width: '100%',
            backgroundColor: mode=="dark" ? 'inherit' : '#fff',
            color: mode=="dark" ? 'inherit' : '#000',
            border: `1px solid ${mode==="dark" ? 'inherit' : '#ccc'}`,
            borderRadius: 4,
            height: 40,
          }}
          buttonStyle={{
            backgroundColor: mode=="dark" ? 'inherit' : '#fff',
            border: `1px solid ${mode==="dark" ? 'inherit' : '#ccc'}`,
          }}
                />
              </Box>

              {/* Password field */}
              <Box mt={2}>
                <Input
                  type="password"
                  placeholder="Password"
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
                  style={{
                    width: '100%',
                    height: '56px',
                    fontSize: '16px',
                    padding: '16.5px 14px',
                    border: '1px solid #c4c4c4',
                    borderRadius: '4px',
                  }}
                />
              </Box>

              {/* Confirm Password field */}
              <Box mt={2}>
                <Input
                  type="password"
                  placeholder="Confirm Password"
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
                  style={{
                    width: '100%',
                    height: '56px',
                    fontSize: '16px',
                    padding: '16.5px 14px',
                    border: '1px solid #c4c4c4',
                    borderRadius: '4px',
                  }}
                />
              </Box>

              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
            </form>
          </>
        )}

        {signupStep === 1 && (
          <Box sx={{ mt: 2 }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleOtpVerification(e);
              }
            }}
          >
            <Box display="flex" justifyContent="center" mb={2} mt={2}>
              <img loading='lazy' src={mode==="dark"? "/assets/AICarAdvisor_transparent.png":"/assets/AICarAdvisor.png"}  height= {60} alt="Logo" style={{ height:60  }} width={300} />
            </Box>
            <Typography variant="h5" align="center" gutterBottom>
              Enter OTP
            </Typography>
            <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 2 }}>
              Please enter the 6-digit code sent to {mobile}
            </Typography>
            <Box display="flex" justifyContent="center" mb={3}>
              <OtpBoxes
                length={6}
                value={otp}
                onChange={setOtp}
                autoFocus
                disabled={loading}
              />
            </Box>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
            {/* Resend OTP Button with Timer */}
            <Box mt={2} display="flex" justifyContent="center">
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
      </DialogContent>
      <DialogActions>
        {/* Only show the Sign Up/Verify OTP button */}
        <Button
          onClick={signupStep === 0 ? handleSubmit : handleOtpVerification}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? (signupStep === 0 ? 'Signing up...' : 'Verifying...') : (signupStep === 0 ? 'Sign Up' : 'Verify OTP')}
        </Button>
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
