import React, { useState, ChangeEvent, FormEvent } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import Image from 'next/image';
import { axiosInstance } from '@/utils/axiosInstance';
import { useCookies } from 'react-cookie';
import { v4 as uuidv4 } from 'uuid';
import { useFirebase } from '@/Context/FirebaseAuthContext';
import { useLoginDialog } from '@/Context/LoginDialogContextType';
import { useSnackbar } from '@/Context/SnackbarContext';

import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';

interface LoginFormData {
  mobile_no: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    mobile_no: '',
    password: '',
  });

  const [cookies, setCookie] = useCookies(['token', 'user']);
  const firebase = useFirebase();
  const { hide } = useLoginDialog();
  const { showSnackbar } = useSnackbar();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    hide();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        email: "+"+formData.mobile_no,
        password: formData.password,
      };

      const response = await axiosInstance.post('/api/cargpt/login/', payload);
      handleSetCookie(response);
      showSnackbar(response?.message || 'Login successful!', {
        vertical: 'top',
        horizontal: 'center',
      });
    } catch (error: any) {
      console.error('Login error:', error?.data?.non_field_errors?.[0]);
      if (error?.data?.non_field_errors?.[0]) {
        setError(error.data.non_field_errors[0]);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const googleUser = await firebase.signInWithGoogle();
      if (!googleUser) return;

      const idToken = await googleUser.getIdToken();
      const uniqueUserId = googleUser.displayName || uuidv4();

      const payload = {
        username: uniqueUserId,
        password: 'test@1234',
      };

      await axiosInstance.post(`/api/cargpt/createUser/`, payload, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
    } catch (err) {
      console.error('Google Sign-In Error:', err);
    }
  };

  const handleGuestLogin = async () => {
    const uniqueUserId = uuidv4();
    const payload = { userId: uniqueUserId };
    const response = await axiosInstance.post(`/api/cargpt/createUser/`, payload);
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
      setCookie('token', response.token, { path: '/', maxAge: 365 * 60 * 60 });
    }
  };

  return (
    <Box display="flex" justifyContent="center" sx={{ px: 2 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: { xs: '100%', sm: 400 },
          boxShadow: 'none',
          maxWidth: 400,
        }}
      >
        <Box display="flex" justifyContent="center" mb={2}>
          <Image src="/assets/AICarAdvisor.png" alt="Logo" style={{ height: 60 }} width={340} height={60} />
        </Box>
        <Typography variant="h5" align="center" gutterBottom>
          Login
        </Typography>

        <form onSubmit={handleSubmit}>
          {/* ✅ Phone Input with Country Code + Flag */}
          <PhoneInput
            country={'in'}
            value={formData.mobile_no}
            onChange={(phone) => setFormData(prev => ({ ...prev, mobile_no: phone }))}
            inputProps={{
              name: 'mobile_no',
              required: true,
              autoFocus: true,
            }}
            inputStyle={{ width: '100%' }}
            containerStyle={{ marginBottom: '16px' }}
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            margin="normal"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              mt: 2,
            }}
          >
            <Button
              onClick={handleGoogleLogin}
              type="button"
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: 'lightgray',
                color: 'black',
                textTransform: 'none',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                whiteSpace: 'nowrap',
                '&:hover': {
                  backgroundColor: '#d3d3d3',
                },
              }}
            >
              <img src="/assets/google.svg" alt="Google icon" width={20} height={20} />
              Continue with Google
            </Button>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </form>
      </Paper>
    </Box>
  );
};

export default LoginForm;
