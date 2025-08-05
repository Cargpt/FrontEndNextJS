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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth={isMobile} fullScreen={isMobile}>
      {/* Close (Back) button */}
      <IconButton
        onClick={onClose}
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
          p: 2,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          mt: 4, // Add margin-top to avoid overlapping with IconButton
        }}
      >
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
          disabled={loading}
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
