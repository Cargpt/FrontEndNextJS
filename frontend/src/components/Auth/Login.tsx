'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  CircularProgress,
  useMediaQuery, // Import useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles'; // Import useTheme
import logo from '../../../public/assets/AICarAdvisor.png'; // Adjust the path as needed
import Image from 'next/image';
import {axiosInstance} from '@/utils/axiosInstance';
import { useCookies } from 'react-cookie';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique ID generation
import { useFirebase } from '@/Context/FirebaseAuthContext';
import { Alert } from '@mui/material';
import { useLoginDialog } from '@/Context/LoginDialogContextType';
import { useSnackbar } from '@/Context/SnackbarContext';
import SignupDialog from './SignupDialog'; // Import SignupDialog
import { useRouter } from 'next/navigation'; // Import useRouter

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [cookies, setCookie] = useCookies(['token', 'user']);
  const firebase = useFirebase();
  const {hide}=useLoginDialog()
  const [showSignupDialog, setShowSignupDialog] = useState(false); // State for signup dialog
  const router = useRouter(); // Initialize useRouter

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleSetCookie = ( cookieValueInput:any) => {
    setCookie('token', cookieValueInput?.token, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 365 days
    });
        setCookie('user', cookieValueInput?.user, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 365 days
    });
    hide(); // Close the dialog after setting the cookie
    

    
  };





const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);
const {showSnackbar}=useSnackbar()

   const handleSubmit = async (e:FormEvent ) => {
    e.preventDefault();
    setError("")
      setLoading(true); // start spinner

    try {

          const payload = formData
          const  response = await  axiosInstance.post('/api/cargpt/login/',  payload)
          handleSetCookie(response)
          showSnackbar(response?.message, {
          vertical: "top",
          horizontal: "center",
        });

    } catch (error:any) {
      console.error("Login error:", error?.data?.non_field_errors[0]);
      if(error?.data?.non_field_errors[0]){
        setError(error?.data?.non_field_errors[0])
      } 
      
    }
finally {
          setLoading(false); 

      }


  };

  const theme = useTheme(); // Define theme here
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Define isMobile here


   const handleGoogleLogin = async () => {
                // setError("");
                // setLoading(true);
                try {
                  const googleUser = await firebase.signInWithGoogle();
                  //googleUser.addScope('email');

                  if (!googleUser) {
                    // setError("No user returned from Google.");
                    return;
                  }

                  const idToken = await googleUser.getIdToken();

                  if (!idToken) {
                    // setError("No ID Token returned from Firebase.");
                    return;
                  }

                  const uniqueUserId = googleUser.displayName || uuidv4();

                  const payload = {
                    username: googleUser.displayName || uniqueUserId,
                    password: 'test@1234'
                    // Include unique user ID
                  };

                  const response = await axiosInstance.post(`/api/cargpt/createUser/`, payload, {
                    headers: {
                      Authorization: `Bearer ${idToken}`,
                    },
                  });
                } catch (err) {
                  console.error("Google Sign-In Error:", err);
                  // setError("Google sign-in failed. Please try again.");
                } finally {
                  // setLoading(false);
                }
              }
 
      
              
            // Guest Login
             const handleGuestLogin= async () => {

                const uniqueUserId = uuidv4();

                const payload = {
                  userId: uniqueUserId,  // Include unique user ID
                };

                const response = await axiosInstance.post(`/api/cargpt/createUser/`, payload, {

                });

                if (response.token) {
                  localStorage.setItem("auth_token", response.token);
                 
                  setCookie("token", response.token, {path: "/", maxAge: 365 * 60 * 60}); // Store the token
                  localStorage.setItem("auth_token", response.token);

                } else {
                 
                }
              }



  return (
    <Box
      display="flex"
      justifyContent="center"
      border="none"
      sx={{
        px: 2, // horizontal padding on small screens
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: { xs: "100%", sm: 400 }, // 100% width on xs screens, 400px on sm+
          boxShadow: "none",
          maxWidth: 400,
          // Add fullScreen behavior for mobile
          ...(isMobile && { width: "100%", height: "100vh", borderRadius: 0, boxShadow: "none" }),
        }}
      >
        <Box display="flex" justifyContent="center" mb={2}>
          <Image src={logo} alt="Logo" style={{ height: 60 }} />
        </Box>
        <Typography variant="h5" align="center" gutterBottom>
          Login
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            required
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
              display: "flex",
              flexDirection: { xs: "column", sm: "row" }, // stack on xs, row on sm+
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
                backgroundColor: "lightgray",
                color: "black",
                textTransform: "none",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                whiteSpace: "nowrap",
                "&:hover": {
                  backgroundColor: "#d3d3d3",
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
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Box>

          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 2, cursor: "pointer" }}
            onClick={() => {
              setShowSignupDialog(true); // Open the signup dialog
            }}
          >
            Don't have an account? <strong>Sign Up</strong>
          </Typography>
         
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </form>
      </Paper>
      {/* Render the SignupDialog as a popup */}
      <SignupDialog
        open={showSignupDialog}
        onClose={() => setShowSignupDialog(false)}
        onSuccess={async (password, mobile) => {
          setShowSignupDialog(false); // Close signup dialog
          setLoading(true); // Start loading for login
          try {
            // Attempt login with mobile_no and password
            // NOTE: This assumes your login API supports mobile_no as a login identifier.
            // If it requires email/username, this will fail. You'll need to adjust your backend or login flow.
            const payload = { mobile_no: mobile, password: password };
            const response = await axiosInstance.post('/api/cargpt/login/', payload);
            handleSetCookie(response.data); // Set cookies for the newly logged-in user
            showSnackbar(response?.data?.message || "Login successful!", {
              vertical: "top",
              horizontal: "center",
            });
            router.push("/home"); // Redirect to home page
          } catch (loginError: any) {
            console.error("Automatic login error after signup:", JSON.stringify(loginError.response?.data, null, 2));
            showSnackbar(loginError?.response?.data?.non_field_errors?.[0] || "Automatic login failed. Please log in manually.", {
              vertical: "top",
              horizontal: "center",
            });
          } finally {
            setLoading(false); // Stop loading
          }
        }}
      />
    </Box>
  );
};

export default LoginForm;
