'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  useMediaQuery,
  Box,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { axiosInstance } from '@/utils/axiosInstance';
import { useCookies } from 'react-cookie';
import { useSnackbar } from '@/Context/SnackbarContext';
import { useLoginDialog } from '@/Context/LoginDialogContextType';
import Image from 'next/image';
import logo from '../../../public/assets/AICarAdvisor.png'; // Corrected path
// import { v4 as uuidv4 } from 'uuid'; // Remove uuid import as it's no longer used

interface SignupDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (password: string, mobile: string) => void; // Updated to pass password and mobile
}

const SignupDialog: React.FC<SignupDialogProps> = ({ open, onClose, onSuccess }) => {
  // const [username, setUsername] = useState(''); // Removed username
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // const [email, setEmail] = useState(''); // Removed email
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [cookies, setCookie] = useCookies(['token', 'user']);
  const { hide } = useLoginDialog();
  const { showSnackbar } = useSnackbar();

  const handleSetCookie = (cookieValueInput: any) => {
    setCookie('token', cookieValueInput?.token, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 365 days
    });
    setCookie('user', cookieValueInput?.user, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 365 days
    });
    hide(); // Close the login dialog if it was open (though not directly relevant here, keeping for consistency)
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

    try {
      // const generatedUsername = uuidv4(); // Removed random username generation
      const payload = { password: password, mobile_no: mobile }; // Updated payload to only password and mobile_no
      const response = await axiosInstance.post('/api/cargpt/register/', payload);
      handleSetCookie(response.data);
      console.log("Signup successful, backend response:", response.data);
      setSuccess('Signup successful!');
      showSnackbar(response?.data?.message || "Signup successful!", {
        vertical: "top",
        horizontal: "center",
      });
      setTimeout(() => {
        setSuccess(null);
        onSuccess(password, mobile); // Pass password and mobile
        // onClose(); // We'll let the Login component handle closing the dialog after login
      }, 1000);
    } catch (err: any) {
      console.error("Signup error:", JSON.stringify(err.response?.data, null, 2));
      let errorMessage = 'Signup failed.';
      if (err.response) {
        if (err.response.data) {
          if (typeof err.response.data === 'object') {
            // If the error data is an object, iterate through its properties
            errorMessage = Object.keys(err.response.data)
              .map(key => `${key}: ${Array.isArray(err.response.data[key]) ? err.response.data[key].join(', ') : err.response.data[key]}`)
              .join('\n');
          } else {
            // If it's a string or other primitive
            errorMessage = String(err.response.data);
          }
        } else if (err.response.statusText) {
          errorMessage = err.response.statusText;
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth={isMobile} fullScreen={isMobile}> {/* Apply fullScreen conditionally */}
      {/* <DialogTitle>Sign Up to Book Test Drive</DialogTitle> */}
      <DialogContent>
        <Box display="flex" justifyContent="center" mb={2} mt={2}>
          <Image src={logo} alt="Logo" style={{ height: 60 }} />
        </Box>
        <Typography variant="h5" align="center" gutterBottom>
          Sign Up
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            disabled={loading}
          />
          <TextField
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            disabled={loading}
          />
          {/* Removed Username TextField */}
          {/* Removed Email TextField */}
          <TextField
            label="Mobile Number"
            type="tel"
            value={mobile}
            onChange={e => setMobile(e.target.value)}
            fullWidth
            margin="normal"
            required
            disabled={loading}
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SignupDialog; 