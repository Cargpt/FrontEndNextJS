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
import { axiosInstance } from '@/utils/axiosInstance';
import { useCookies } from 'react-cookie';
import { v4 as uuidv4 } from 'uuid';
import { useFirebase } from '@/Context/FirebaseAuthContext';
import { useLoginDialog } from '@/Context/LoginDialogContextType';
import { useSnackbar } from '@/Context/SnackbarContext';

import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import { useColorMode } from '@/Context/ColorModeContext';
import ForgotPasswordDialog from '@/components/Auth/ForgotPasswordDialog';
import { getRandomWelcomeMessage } from '@/utils/services';

interface LoginFormData {
  mobile_no: string;
  password: string;
}

interface LoginFormProps {
  showSignUp?: () => void;

}
// const LoginForm: React.FC<LoginFormProps>   = ({showSignUp}) => {
//   const [formData, setFormData] = useState<LoginFormData>({
//     mobile_no: '',
//     password: '',
//   });

//   const [cookies, setCookie] = useCookies(['token', 'user']);
//   const firebase = useFirebase();
//   const { hide } = useLoginDialog();
//   const { showSnackbar } = useSnackbar();
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [forgotOpen, setForgotOpen] = useState(false);

//   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSetCookie = (cookieValueInput: any) => {
//     setCookie('token', cookieValueInput?.token, {
//       path: '/',
//       maxAge: 60 * 60 * 24 * 365,
//     });


//     setCookie('user', cookieValueInput?.user, {
//       path: '/',
//       maxAge: 60 * 60 * 24 * 365,
//     });
//     hide();
//   };

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       const payload = {
//         email: "+"+formData.mobile_no,
//         password: formData.password,
//       };

//       const response = await axiosInstance.post('/api/cargpt/login/', payload);
//       handleSetCookie(response);
//       let dispalyName = response?.user?.first_name 
//       const firstName=response?.user?.first_name   
//       const lastName=response?.user?.last_name
//       if(lastName)    dispalyName = dispalyName += ' '+ lastName
//       showSnackbar(`${getRandomWelcomeMessage(dispalyName)}`, {
//         vertical: 'top',
//         horizontal: 'center',
//       });
//     } catch (error: any) {
//       console.error('Login error:', error?.data?.non_field_errors?.[0]);
//       if (error?.data?.non_field_errors?.[0]) {
//         setError(error.data.non_field_errors[0]);
//       } else {
//         setError('Login failed. Please try again.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoogleLogin = async () => {
//     try {
//       const googleUser = await firebase.signInWithGoogle();
//       if (!googleUser) return;

//       const idToken = await googleUser.getIdToken();
//       const uniqueUserId = googleUser.displayName || uuidv4();

//       const payload = {
//         username: uniqueUserId,
//         password: 'test@1234',
//       };

//       const response = await axiosInstance.post(`/api/cargpt/createUser/`, payload, {
//         headers: {
//           Authorization: `Bearer ${idToken}`,
//         },


//       });


//       if (response.token) {
                 
//                     setCookie("token",response.token, {
//       path: '/',
//       maxAge: 60 * 60 * 24 * 365,
//     });


//     console.log("here", googleUser.displayName)

//     const  displayName = googleUser?.displayName || ''
//       showSnackbar(`${getRandomWelcomeMessage(displayName)}`, {
//         vertical: 'top',
//         horizontal: 'center',
//       });
//     hide()
//     // Store the token
//                     // localStorage.setItem("auth_token", response.data.token);

//       }

//     } catch (err) {
//       console.error('Google Sign-In Error:', err);
//     }
//   };



//   const handleGuestLogin = async () => {
//     const uniqueUserId = uuidv4();
//     const payload = { userId: uniqueUserId };
//     const response = await axiosInstance.post(`/api/cargpt/createUser/`, payload);
//     if (response.token) {
//       localStorage.setItem('auth_token', response.token);
//       setCookie('token', response.token, { path: '/', maxAge: 365 * 60 * 60 });
//     }
//   };

//   const {mode}=useColorMode()
//   return (
//     <Box display="flex" justifyContent="center" sx={{ px: 2 }}>
//       <Paper
//         elevation={3}
//         sx={{
//           p: 4,
//           width: { xs: '100%', sm: 400 },
//           boxShadow: 'none',
//           maxWidth: 400,
//         }}
//       >
//         <Box display="flex" justifyContent="center" mb={2}>
//           <img loading='lazy' src={mode==="light" ? "/assets/AICarAdvisor.png":"/assets/AICarAdvisor_transparent.png"} alt="Logo" style={{ height: 60 }} width={340} height={60} />
//         </Box>
//         <Typography variant="h5" align="center" gutterBottom>
//           Login
//         </Typography>

//         <form onSubmit={handleSubmit}>
//           {/* ✅ Phone Input with Country Code + Flag */}
//           <PhoneInput
//             country={'in'}
//             value={formData.mobile_no}
//             onChange={(phone) => setFormData(prev => ({ ...prev, mobile_no: phone }))}
//             inputProps={{
//               name: 'mobile_no',
//               required: true,
//               autoFocus: true,
//             }}
//              containerStyle={{ marginBottom: '16px' }}
//              dropdownStyle={{
//               backgroundColor: mode=="dark" ? '#000' : '#fff',
//         color: mode=="dark" ? 'ccc' : '#00',
//         border: `1px solid ${mode=="dark" ? '#000' : '#ccc'}`,
//              }


//              }
          
//                   inputStyle={{
//         width: '100%',
//         backgroundColor: mode=="dark" ? 'inherit' : '#fff',
//         color: mode=="dark" ? 'inherit' : '#000',
//         border: `1px solid ${mode=="dark" ? 'inherit' : '#ccc'}`,
//         borderRadius: 4,
//         height: 40,
//       }}
//       buttonStyle={{
//         backgroundColor: mode=="dark" ? 'inherit' : '#fff',
//         border: `1px solid ${mode=="dark" ? 'inherit' : '#ccc'}`,
//       }}

//           />

//           <TextField
//             label="Password"
//             name="password"
//             type="password"
//             fullWidth
//             margin="normal"
//             value={formData.password}
//             onChange={handleChange}
//             required
//           />

//           {/* Forgot password link aligned to the right, directly after password field */}
//           <Box display="flex" justifyContent="flex-end" mt={1}>
//             <Button type="button" variant="text" size="small" onClick={() => setForgotOpen(true)}>
//               Forgot Password?
//             </Button>
//           </Box>

//           <Box
//             sx={{
//               display: 'flex',
//               flexDirection: { xs: 'column', sm: 'row' },
//               gap: 2,
//               mt: 2,
//             }}
//           >
//             <Button
//               onClick={handleGoogleLogin}
//               type="button"
//               variant="contained"
//               fullWidth
//               sx={{
//                 backgroundColor: 'lightgray',
//                 color: 'black',
//                 textTransform: 'none',
//                 fontSize: 12,
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 gap: 1,
//                 whiteSpace: 'nowrap',
//                 '&:hover': {
//                   backgroundColor: '#d3d3d3',
//                 },
//               }}
//             >
//               <img src="/assets/google.svg" alt="Google icon" width={20} height={20} />
//               Continue with Google
//             </Button>

//             <Button
//               type="submit"
//               variant="contained"
//               fullWidth
//               disabled={loading}
//               startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
//             >
//               {loading ? 'Logging in...' : 'Login'}
//             </Button>
//           </Box>

          

//           {error && (
//             <Alert severity="error" sx={{ mt: 2 }}>
//               {error}
//             </Alert>
//           )}
//           <div  role='button'  style={{display:"flex", justifyContent:"center", alignItems:"center", cursor:"pointer"}}>
//           <span  onClick={showSignUp} style={{marginTop:"1rem", fontSize:"14px", color:mode==="dark"? "#fff": "blue"}} >Don't have account  SignUp</span>
//           </div>
//         </form>
//       </Paper>

//       {/* Forgot Password Flow (UI only; APIs to be plugged later) */}
//       <ForgotPasswordDialog
//         open={forgotOpen}
//         onClose={() => setForgotOpen(false)}
//         loginMobile={formData.mobile_no}
//       />

//             <style>
//         {`
//           .react-tel-input .special-label {
//             background-color: ${mode === 'dark' ? '#333' : '#fff'} !important;
//             color: ${mode === 'dark' ? '#fff' : '#000'} !important;
//             border-radius: 4px;
//             padding: 2px 6px;
//           }
//             .react-tel-input .country-list .country:hover, .react-tel-input .country-list .country.highlight {
//     background-color:  ${mode === 'dark' ? '#333' : '#f1f1f1'} !important;
// }

//         `}
//       </style>

//     </Box>
//   );
// };




import {

 
  InputAdornment,
  IconButton,
  Divider,
  alpha,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Phone,
  Lock,
  Google,
  Apple,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const LoginForm: React.FC<LoginFormProps> = ({showSignUp}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));





  };

  




    const [cookies, setCookie] = useCookies(['token', 'user']);
  const firebase = useFirebase();
  const { hide } = useLoginDialog();
  const { showSnackbar } = useSnackbar();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

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
        email: "+"+formData.phone,
        password: formData.password,
      };

      const response = await axiosInstance.post('/api/cargpt/login/', payload);
      handleSetCookie(response);
      let dispalyName = response?.user?.first_name 
      const firstName=response?.user?.first_name   
      const lastName=response?.user?.last_name
      if(lastName)    dispalyName = dispalyName += ' '+ lastName
      showSnackbar(`${getRandomWelcomeMessage(dispalyName)}`, {
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

      const response = await axiosInstance.post(`/api/cargpt/createUser/`, payload, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },


      });


      if (response.token) {
                 
                    setCookie("token",response.token, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });


    console.log("here", googleUser.displayName)

    const  displayName = googleUser?.displayName || ''
      showSnackbar(`${getRandomWelcomeMessage(displayName)}`, {
        vertical: 'top',
        horizontal: 'center',
      });
    hide()
    // Store the token
                    // localStorage.setItem("auth_token", response.data.token);

      }

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


  const handleAppleLogin = ()=>{
    showSnackbar(`This login method available soon!`, {
        vertical: "top",
        horizontal: "right",
      });
    
  }
  const {mode}=useColorMode()
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        <Paper
          elevation={24}
          sx={{
            width: { xs: '100%', sm: 450 },
            maxWidth: 450,
            padding: 4,
            borderRadius: 4,
            background: alpha('#ffffff', 0.95),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha('#ffffff', 0.2)}`,
            boxShadow: `0 20px 40px ${alpha('#000000', 0.1)}`,
          }}
        >
          {/* Logo and Header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    boxShadow: `0 10px 30px ${alpha('#667eea', 0.3)}`,
                  }}
                >
                  <Lock sx={{ color: 'white', fontSize: 40 }} />
                </Box>
              </motion.div>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                Welcome Back
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sign in to continue to your account
              </Typography>
            </Box>
          </motion.div>

          {/* Login Form */}
          <motion.form 
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Box sx={{ mb: 3 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <PhoneInput
  country={'in'}
  value={formData.phone}
  onChange={(phone) => setFormData(prev => ({ ...prev, phone }))}
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
    border: '1px solid #ccc',
    backgroundColor: 'rgba(248, 249, 250, 0.8)',
  }}
  containerStyle={{ marginBottom: '24px' }}
/>

              
              </motion.div>
            </Box>

            <Box sx={{ mb: 3 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#667eea' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha('#f8f9fa', 0.8),
                      '&:hover': {
                        backgroundColor: alpha('#f8f9fa', 1),
                      },
                      '&.Mui-focused': {
                        backgroundColor: '#ffffff',
                        boxShadow: `0 0 0 2px ${alpha('#667eea', 0.2)}`,
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#667eea',
                    },
                  }}
                />
              </motion.div>
            </Box>

            {/* Forgot Password */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Box sx={{ textAlign: 'right', mb: 3 }}>
                <Button
                   onClick={()=>setForgotOpen(true)}
                  variant="text"
                  sx={{
                    color: '#667eea',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: alpha('#667eea', 0.1),
                    },
                  }}
                >
                  Forgot Password?
                </Button>
              </Box>
            </motion.div>

            {/* Sign In Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{
                  height: 56,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: `0 10px 30px ${alpha('#667eea', 0.4)}`,
                  textTransform: 'none',
                  fontSize: 16,
                  fontWeight: 600,
                  mb: 3,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    boxShadow: `0 15px 35px ${alpha('#667eea', 0.5)}`,
                  },
                  '&:disabled': {
                    background: alpha('#667eea', 0.6),
                  },
                }}
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Signing In...
                    </motion.div>
                  ) : (
                    <motion.div
                      key="signin"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Sign In
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Divider sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  or continue with
                </Typography>
              </Divider>
            </motion.div>

            {/* Social Login Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ flex: 1 }}
                >
                  <Button
                  onClick={handleGoogleLogin}
                    fullWidth
                    variant="outlined"
                    startIcon={<Google />}
                    sx={{
                      height: 48,
                      borderRadius: 2,
                      borderColor: alpha('#000000', 0.2),
                      color: '#424242',
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: '#667eea',
                        backgroundColor: alpha('#667eea', 0.05),
                      },
                    }}
                  >
                    Google
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ flex: 1 }}
                >
                  <Button
                  onClick={handleAppleLogin}
                    fullWidth
                    variant="outlined"
                    startIcon={<Apple />}
                    sx={{
                      height: 48,
                      borderRadius: 2,
                      borderColor: alpha('#000000', 0.2),
                      color: '#424242',
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: '#667eea',
                        backgroundColor: alpha('#667eea', 0.05),
                      },
                    }}
                  >
                    Apple
                  </Button>
                </motion.div>
              </Box>
            </motion.div>

            {/* Sign Up Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Button
                  onClick={showSignUp}
                    variant="text"
                    sx={{
                      color: '#667eea',
                      textTransform: 'none',
                      fontWeight: 600,
                      padding: 0,
                      minWidth: 'auto',
                      '&:hover': {
                        backgroundColor: 'transparent',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Sign Up
                  </Button>
                </Typography>
              </Box>
            </motion.div>
          </motion.form>
                   {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
             </Alert>
           )}
        </Paper>
      </motion.div>



          {/* Forgot Password Flow (UI only; APIs to be plugged later) */}
       <ForgotPasswordDialog
         open={forgotOpen}
        onClose={() => setForgotOpen(false)}
      loginMobile={formData.phone}
       />

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

    </Box>
  );
};

export default LoginForm;








