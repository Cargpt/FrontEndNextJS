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
import OtpBoxes from '@/components/common/otp/OtpBoxes';

import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import { useColorMode } from '@/Context/ColorModeContext';
import { KeyboardBackspaceSharp } from "@mui/icons-material";
import { Capacitor } from "@capacitor/core";

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
  // OTP UI state (no API calls yet; will be added later)
  const [otp, setOtp] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [otpLength, setOtpLength] = useState<number>(6);
  const [demoOtp, setDemoOtp] = useState<string>("");

  const [cookies, setCookie] = useCookies(['token', 'user']);
  const { showSnackbar } = useSnackbar();

  const handleSetCookie = (cookieValueInput: any) => {
    setCookie('token', cookieValueInput?.token, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
    setCookie('user', cookieValueInput?.user, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
    onClose();
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
        onSuccess(password, mobile);
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const {mode}=useColorMode()
  const isNative = Capacitor.isNativePlatform();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth={isMobile}
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          position: "relative",
          pt: isMobile
            ? `calc(env(safe-area-inset-top, 0px) + ${theme.spacing(isNative ? 6 : 3)})`
            : theme.spacing(2),
          pl: `calc(env(safe-area-inset-left, 0px) + ${theme.spacing(1)})`,
          pr: `calc(env(safe-area-inset-right, 0px) + ${theme.spacing(1)})`,
          pb: `calc(env(safe-area-inset-bottom, 0px) + ${theme.spacing(2)})`,
        },
      }}
    >
      <DialogContent
        sx={{
          overflowX: "hidden",
          p: 2,
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top Row: Back Arrow + Centered Logo */}
        <Box display="flex" alignItems="center" mb={2}>
          <IconButton onClick={onClose} aria-label="close" sx={{ mr: 1 }}>
            <KeyboardBackspaceSharp />
          </IconButton>
          <Box flex={1} display="flex" justifyContent="center">
            <img
              loading='lazy'
              src={mode==="dark"? "/assets/AICarAdvisor_transparent.png":"/assets/AICarAdvisor.png"}
              height={60}
              alt="Logo"
              style={{ height: 60 }}
              width={300}
            />
          </Box>
          {/* Spacer to keep logo centered */}
          <Box sx={{ width: 40, height: 40 }} />
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

             
              disabled={loading || otpVerified}
            
              inputProps={{
                name: 'mobile',
                required: true,
              }}

                           dropdownStyle={{
              backgroundColor: mode=="dark" ? '#000' : '#fff',
        color: mode=="dark" ? 'ccc' : '#00',
        border: `1px solid ${mode=="dark" ? '#000' : '#ccc'}`,
             }


             }
          
                  inputStyle={{
        width: '100%',
        backgroundColor: mode=="dark" ? 'inherit' : '#fff',
        color: mode=="dark" ? 'inherit' : '#000',
        border: `1px solid ${mode=="dark" ? 'inherit' : '#ccc'}`,
        borderRadius: 4,
        height: 40,
      }}
      buttonStyle={{
        backgroundColor: mode=="dark" ? 'inherit' : '#fff',
        border: `1px solid ${mode=="dark" ? 'inherit' : '#ccc'}`,
      }}
            />
          </Box>

          {/* OTP flow UI */}
          <Box mt={2}>
            {!otpSent ? (
              <Button
                fullWidth
                variant="outlined"
                disabled={loading || !mobile}
                onClick={() => {
                  setError(null);
                  setSuccess(null);
                  setLoading(true);
                  (async () => {
                    try {
                      await axiosInstance.post('/api/cargpt/send-otp/', {
                        phone_number: '+' + mobile,
                        purpose: 'login',
                      });
                      setOtp('');
                      setOtpSent(true);
                      setOtpVerified(false);
                      const generated = Math.random() < 0.5
                        ? Math.floor(1000 + Math.random() * 9000).toString()
                        : Math.floor(100000 + Math.random() * 900000).toString();
                      setDemoOtp(generated);
                      setOtpLength(generated.length);
                    } catch (err) {
                      setError('Failed to send OTP');
                    } finally {
                      setLoading(false);
                    }
                  })();
                }}
              >
                Send OTP
              </Button>
            ) : !otpVerified ? (
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Enter OTP sent to +{mobile}
                </Typography>
                <Box display="flex" justifyContent="center" mb={1}>
                  <Button size="small" variant="text" onClick={() => { setOtpSent(false); setOtp(''); setOtpVerified(false); setDemoOtp(''); }}>
                    Change number
                  </Button>
                </Box>
                <OtpBoxes
                  length={otpLength}
                  value={otp}
                  onChange={setOtp}
                  onComplete={(code) => {
                    setOtp(code);
                    if (code && code.length !== otpLength) {
                      setOtpLength(code.length);
                    }
                    if (code && code.length === otpLength && code === demoOtp) {
                      // Simulate 2s verification delay before marking verified
                      setLoading(true);
                      setTimeout(() => {
                        setOtpVerified(true);
                        setLoading(false);
                      }, 2000);
                    }
                  }}
                  autoFocus
                  disabled={loading}
                  useWebOtp={isMobile}
                  autoReadClipboard
                />
                {/* Demo OTP display for UI-only testing */}
                {demoOtp && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    Demo OTP: {demoOtp}
                  </Alert>
                )}
                <Box mt={2} display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      // Resend placeholder
                      setOtp('');
                      const generated = Math.random() < 0.5
                        ? Math.floor(1000 + Math.random() * 9000).toString()
                        : Math.floor(100000 + Math.random() * 900000).toString();
                      setDemoOtp(generated);
                      setOtpLength(generated.length);
                    }}
                    disabled={loading}
                    fullWidth
                  >
                    Resend OTP
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      // Placeholder verify; later will call API
                      if (!otp || otp.length < otpLength) return;
                      if (otp === demoOtp) {
                        setOtpVerified(true);
                      } else {
                        setError('Invalid OTP');
                      }
                    }}
                    disabled={loading || otp.length < otpLength}
                    fullWidth
                  >
                    Verify OTP
                  </Button>
                </Box>
                <Box mt={1}>
                  <Button size="small" onClick={() => setOtp(demoOtp)} disabled={!demoOtp}>
                    Autofill Demo OTP
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box>
                <Alert severity="success" sx={{ mt: 1 }}>
                  Mobile verified
                </Alert>
                <Box display="flex" justifyContent="center" mt={1}>
                  <Button size="small" variant="text" onClick={() => { setOtpVerified(false); setOtpSent(false); setOtp(''); setDemoOtp(''); }}>
                    Change number
                  </Button>
                </Box>
              </Box>
            )}
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !otpVerified}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Signing up...' : 'Sign Up'}
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
