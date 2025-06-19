import React, { useState, ChangeEvent, FormEvent } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';
import logo from '../../../public/assets/AICarAdvisor.png'; // Adjust the path as needed
import Image from 'next/image';
import {axiosInstance} from '@/utils/axiosInstance';
import { useCookies } from 'react-cookie';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique ID generation
import { useFirebase } from '@/Context/FirebaseAuthContext';
import { Alert } from '@mui/material';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [cookies, setCookie] = useCookies(['token']);
  const firebase = useFirebase();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleSetCookie = ( cookieValueInput:string) => {
    setCookie('token', cookieValueInput, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 365 days
    });
  };





const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);


   const handleSubmit = async (e:FormEvent ) => {
    e.preventDefault();
    setError("")
      setLoading(true); // start spinner

    try {

          const payload = formData
          const  response = await  axiosInstance.post('/api/login/',  payload)
          handleSetCookie(response?.token)
          console.log(response)

    } catch (error:any) {
      if(error?.status===404){
        setError("User Not found 404")
      } 
      
    }
finally {
          setLoading(false); // stop spinner

      }

    // setLoading(true);
    // setError("");


    

    // try {
    //   const response = await TokenApi.post('/api/login', {
    //     email,
    //     password,
    //     // device_id: deviceId  // optional if your backend expects it
    //   });

    //   if (response.data.token) {
    //     const token = response.data.token;
    //     localStorage.setItem("auth_token", token);
    //     setToken(token);
    //     navigate("/home");
    //   } else {
    //     throw new Error("Token not returned from API");
    //   }

    // } catch (error) {
    //   console.error("Login error:", error);
    //   setError(error?.response?.data?.detail || "Login failed");
    // } finally {
    //   setLoading(false);
    // }
  };






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

                  console.log("googleUser", googleUser);

                  const idToken = await googleUser.getIdToken();

                  if (!idToken) {
                    // setError("No ID Token returned from Firebase.");
                    return;
                  }

                  // Generate unique user ID using uuid
                  console.log("googleUser.email", googleUser.email);

                  const uniqueUserId = googleUser.displayName || uuidv4();

                  const payload = {
                    username: googleUser.displayName || uniqueUserId,
                    password: 'test@1234'
                    // Include unique user ID
                  };

                  const response = await axiosInstance.post(`/api/createUser/`, payload, {
                    headers: {
                      Authorization: `Bearer ${idToken}`,
                    },
                  });

                  if (response.data.token) {
                    localStorage.setItem("auth_token", response.data.token);
                    console.log("Google Sign-In successful!");
                    //console.log("Username:", googleUser.displayName || googleUser.email);
                    //console.log("Token:", response.data.token); // Log the token

                    // setToken(response.data.token); // Store the token
                    localStorage.setItem("auth_token", response.data.token);


                    // navigate("/home");
                  } else {
                    // setError("No token returned from backend.");
                  }
                } catch (err) {
                  console.error("Google Sign-In Error:", err);
                  // setError("Google sign-in failed. Please try again.");
                } finally {
                  // setLoading(false);
                }
              }
 
      
              

             const handleGuestLogin= async () => {

                const uniqueUserId = uuidv4();

                const payload = {
                  userId: uniqueUserId,  // Include unique user ID
                };

                const response = await axiosInstance.post(`/api/createUser/`, payload, {

                });

                if (response.token) {
                  localStorage.setItem("auth_token", response.token);
                 
                  setCookie("token", response.token); // Store the token
                  localStorage.setItem("auth_token", response.token);

                } else {
                  // setError("No token returned from backend.");
                }
              }
  return (
    <Box display="flex" justifyContent="center"  >
      <Paper elevation={3} sx={{ p: 4, width: 400 }}>
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
          <div style={{display:"flex", gap:"10px"}}>



 <Button onClick={handleGoogleLogin} type="button" variant="contained" fullWidth sx={{ mt: 2 }} style={{background:"lightgray"}}>
              
             <img src="/assets/google.svg" alt="Google icon" width={20} height={20} />
              <Typography style={{fontSize:"10px", color:"black"}}>            continue with google</Typography>
          </Button>

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}
            disabled={loading}
  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}

          >
             {loading ? 'Logging in...' : 'Login'}

          </Button>

          </div>
          <div   style={{display:"flex", justifyContent:"center", alignItems:"center"}} >

            <Typography component="span" sx={{ color: 'primary.main', paddingTop:"10px", cursor:"pointer" }} onClick={handleGuestLogin} >
  Login as guest
</Typography>

          </div>
          {error && (
  <Alert severity="error" sx={{ mb: 2 }}>
    {error}
  </Alert>
)}

         
        </form>
      </Paper>
    </Box>
  );
};

export default LoginForm;
