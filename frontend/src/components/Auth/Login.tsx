import React, { useState, ChangeEvent, FormEvent } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  useTheme,
  Alert,
  alpha,
} from '@mui/material';

import {
  Visibility,
  VisibilityOff,
  Lock,
  Google,
  Apple,
  Person,
} from '@mui/icons-material';

import { axiosInstance } from '@/utils/axiosInstance';
import { useCookies } from 'react-cookie';
import { v4 as uuidv4 } from 'uuid';
import { useFirebase } from '@/Context/FirebaseAuthContext';
import { useLoginDialog } from '@/Context/LoginDialogContextType';
import { useSnackbar } from '@/Context/SnackbarContext';
import { getRandomWelcomeMessage } from '@/utils/services';
import ForgotPasswordDialog from '@/components/Auth/ForgotPasswordDialog';

import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';

import { motion, AnimatePresence } from 'framer-motion';

interface LoginFormProps {
  showSignUp?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ showSignUp }) => {
  const theme = useTheme();
  const mode = theme.palette.mode;

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);

  const [cookies, setCookie] = useCookies(['token', 'user']);
  const firebase = useFirebase();
  const { hide } = useLoginDialog();
  const { showSnackbar } = useSnackbar();

  const handleInputChange = (field: string) => (event: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
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
    setIsLoading(true);

    try {
      const payload = {
        email: '+' + formData.phone,
        password: formData.password,
      };

      const response = await axiosInstance.post('/api/cargpt/login/', payload);
      handleSetCookie(response);

      let displayName = response?.user?.first_name || '';
      if (response?.user?.last_name) displayName += ' ' + response.user.last_name;

      showSnackbar(`${getRandomWelcomeMessage(displayName)}`, {
        vertical: 'top',
        horizontal: 'center',
      });
    } catch (error: any) {
      const msg = error?.data?.non_field_errors?.[0] || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
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

      const response = await axiosInstance.post('/api/cargpt/createUser/', payload, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (response.token) {
        setCookie('token', response.token, {
          path: '/',
          maxAge: 60 * 60 * 24 * 365,
        });

        const displayName = googleUser?.displayName || '';
        showSnackbar(`${getRandomWelcomeMessage(displayName)}`, {
          vertical: 'top',
          horizontal: 'center',
        });

        hide();
      }
    } catch (err) {
      console.error('Google Sign-In Error:', err);
    }
  };

  const handleAppleLogin = () => {
    showSnackbar('This login method is available soon!', {
      vertical: 'top',
      horizontal: 'center',
    });
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      p={2}
      sx={{
        maxHeight: '100vh',         // ✅ fix for unwanted scrolling
        overflowY: 'auto',          // ✅ enables scroll only if needed
      }}
    >
      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}>
        <Paper
          elevation={mode === 'dark' ? 6 : 3}
          sx={{
            p: 3,
            width: { xs: '100%', sm: 450 },
            maxWidth: 450,
            borderRadius: 3,
            backgroundColor: mode === 'dark' ? alpha('#121212', 0.95) : alpha('#ffffff', 0.95),
            backdropFilter: 'blur(15px)',
            border: `1px solid ${alpha('#ffffff', mode === 'dark' ? 0.1 : 0.2)}`,
            boxShadow: 'none',
          }}
        >
          <Box textAlign="center" mb={0.7} mt={-5}>
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
              <Person sx={{ color: 'white', fontSize: 40 }} />
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
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to continue
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <PhoneInput
              country={'in'}
              value={formData.phone}
              onChange={phone => setFormData(prev => ({ ...prev, phone }))}
              inputProps={{
                name: 'phone',
                required: true,
                autoFocus: false,
              }}
              inputStyle={{
                width: '100%',
                height: '56px',
                borderRadius: '8px',
                fontSize: '16px',
                paddingLeft: '48px',
                border: `1px solid ${mode === 'dark' ? '#444' : '#ccc'}`,
                backgroundColor: mode === 'dark' ? '#1e1e1e' : '#f8f9fa',
                color: mode === 'dark' ? '#fff' : '#000',
              }}
              containerStyle={{ marginBottom: '8px' }}
              buttonStyle={{
                backgroundColor: mode === 'dark' ? '#1e1e1e' : '#fff',
                border: `1px solid ${mode === 'dark' ? '#444' : '#ccc'}`,
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange('password')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#0072ff' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 0.8,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: mode === 'dark' ? '#1e1e1e' : '#f8f9fa',
                },
              }}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box textAlign="right" mb={0.8}>
              <Button onClick={() => setForgotOpen(true)} variant="text" sx={{ color: '#0072ff' }}>
                Forgot Password?
              </Button>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                mb: 1.5,
                height: 50,
                borderRadius: 2,
                background: 'linear-gradient(to right, #00c6ff, #0072ff)',
                boxShadow: 'none',
                '&:hover': {
                  background: 'linear-gradient(to right, #0072ff, #00c6ff)',
                },
              }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <Divider sx={{ my: 2 }} />

          <Button
            onClick={handleGoogleLogin}
            startIcon={<Google />}
            fullWidth
            variant="outlined"
            sx={{
              mb: 2,
              borderColor: mode === 'dark' ? '#444' : '#ccc',
              color: mode === 'dark' ? '#fff' : '#000',
              '&:hover': {
                backgroundColor: mode === 'dark' ? '#333' : '#eee',
              },
            }}
          >
            Sign in with Google
          </Button>

          <Button
            onClick={handleAppleLogin}
            startIcon={<Apple />}
            fullWidth
            variant="outlined"
            sx={{
              borderColor: mode === 'dark' ? '#444' : '#ccc',
              color: mode === 'dark' ? '#fff' : '#000',
              '&:hover': {
                backgroundColor: mode === 'dark' ? '#333' : '#eee',
              },
            }}
          >
            Sign in with Apple
          </Button>

          <Typography variant="body2" textAlign="center" mt={3}>
            Don’t have an account?{' '}
            <Button onClick={showSignUp} sx={{ color: '#0072ff', textTransform: 'none' }}>
              Sign Up
            </Button>
          </Typography>
        </Paper>
      </motion.div>

      <AnimatePresence>
        {forgotOpen && (
          <ForgotPasswordDialog open={forgotOpen} onClose={() => setForgotOpen(false)} />
        )}
      </AnimatePresence>

      <style>
        {`
          .react-tel-input .special-label {
            background-color: ${mode === 'dark' ? '#333' : '#fff'} !important;
            color: ${mode === 'dark' ? '#fff' : '#000'} !important;
            border-radius: 4px;
            padding: 2px 6px;
          }
          .react-tel-input .country-list .country:hover, 
          .react-tel-input .country-list .country.highlight {
            background-color: ${mode === 'dark' ? '#333' : '#f1f1f1'} !important;
          }
        `}
      </style>
    </Box>
  );
};

export default LoginForm;
