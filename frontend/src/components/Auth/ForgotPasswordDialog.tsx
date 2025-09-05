  "use client";

  import React, { useMemo, useState } from "react";
  import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Alert,
    Box,
    Input,
    InputAdornment,
    IconButton,
    Paper,
    TextField,
  } from "@mui/material";
  import OtpBoxes from "@/components/common/otp/OtpBoxes";
  import PhoneInput from "react-phone-input-2";
  import "react-phone-input-2/lib/material.css";
  import { useColorMode } from "@/Context/ColorModeContext";
  import { useMediaQuery } from "@mui/material";
  import { useTheme } from "@mui/material/styles";
  import { Visibility, VisibilityOff, KeyboardBackspaceSharp, Lock, VpnKey } from "@mui/icons-material";
  import { Capacitor } from "@capacitor/core";
  import { axiosInstance } from "@/utils/axiosInstance";
  import { alpha } from "@mui/material/styles";
  

  interface ForgotPasswordDialogProps {
    open: boolean;
    onClose: () => void;
    /**
     * The login mobile number to be matched. When provided, we disable editing the phone field
     * and require it to match this value for OTP step.
     */
    loginMobile?: string;
    /** Send OTP click handler (to be implemented later with API). */
    onSendOTP?: (mobile: string) => Promise<void> | void;
    /** Verify OTP click handler (to be implemented later with API). */
    onVerifyOTP?: (mobile: string, otp: string) => Promise<void> | void;
    /** Length of OTP boxes; default 6. */
    otpLength?: number;
  }

  const ForgotPasswordDialog: React.FC<ForgotPasswordDialogProps> = ({
    open,
    onClose,
    loginMobile,
    onSendOTP,
    onVerifyOTP,
    otpLength: propOtpLength = 6,
  }) => {
    const [mobile, setMobile] = useState<string>(loginMobile || "");
    const [otp, setOtp] = useState<string>("");
    const [step, setStep] = useState<"mobile" | "otp" | "reset">("mobile");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [demoOtp, setDemoOtp] = useState<string>("");
    const [otpLength] = useState<number>(6); // Always use 6 digits
    const [readingState, setReadingState] = useState<"idle" | "reading" | "failed" | "success">("idle");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [resendTimer, setResendTimer] = useState(0);
    const [canResend, setCanResend] = useState(true);

    const isMobileMatching = useMemo(() => {
      if (!loginMobile) return true;
      return (mobile || "").replace(/\D/g, "") === (loginMobile || "").replace(/\D/g, "");
    }, [mobile, loginMobile]);

    const { mode } = useColorMode();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const isNative = Capacitor.isNativePlatform();
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    

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

    const handleSendOtp = async () => {
      setError(null);
      setSuccess(null);
      if (!mobile) {
        setError("Please enter mobile number");
        return;
      }
      if (!isMobileMatching) {
        setError("Entered mobile number must match the login number");
        return;
      }
      try {
        setLoading(true);
        // Call API to send OTP with purpose 'forgot_password'
        if (onSendOTP) {
          await onSendOTP("+" + mobile);
        } else {
          await axiosInstance.post("/api/cargpt/send-otp/", {
            phone_number: "+" + mobile,
            purpose: "forgot_password",
          });
        }
        // Generate demo OTP for UI testing
        const generated = Math.random() < 0.5
          ? Math.floor(1000 + Math.random() * 9000).toString()
          : Math.floor(100000 + Math.random() * 900000).toString();
        setDemoOtp(generated);
        setSuccess("OTP sent successfully");
        setStep("otp");
        // Start SMS reading indicator only on mobile
        setReadingState(isMobile ? "reading" : "idle");
        // Start resend timer
        setResendTimer(60);
        setCanResend(false);
      } catch (e) {
        setError("No account found with this phone number");
      } finally {
        setLoading(false);
      }
    };

    const handleResendOtp = async () => {
      if (!canResend || resendTimer > 0) return;
      
      setError(null);
      try {
        setLoading(true);
        // Call API to resend OTP
        if (onSendOTP) {
          await onSendOTP("+" + mobile);
        } else {
          await axiosInstance.post("/api/cargpt/send-otp/", {
            phone_number: "+" + mobile,
            purpose: "forgot_password",
          });
        }
        setSuccess("OTP resent successfully");
        // Reset timer
        setResendTimer(60);
        setCanResend(false);
      } catch (e) {
        setError("Failed to resend OTP");
      } finally {
        setLoading(false);
      }
    };

    // Timer countdown effect
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

    const handleVerifyOtp = async (overrideCode?: string) => {
      setError(null);
      setSuccess(null);
      const codeToVerify = (overrideCode ?? otp) || "";
      if (!codeToVerify || codeToVerify.length < otpLength) {
        setError("Please enter complete OTP");
        return;
      }
      try {
        setLoading(true);
        // Call the verify-otp API with purpose "forgot_password"
        await axiosInstance.post("/api/cargpt/verify-otp/", {
          phone_number: "+" + mobile,
          otp: codeToVerify,
          purpose: "forgot_password"
        });
        
        setReadingState("success");
        setSuccess("OTP verified successfully!");
        // Add a small delay before moving to next step
        setTimeout(() => {
          setStep("reset");
        }, 1000);
      } catch (e: any) {
        // Handle different types of errors
        let errorMessage = "Invalid OTP. Please check the code and try again.";
        if (e.data?.error) {
          errorMessage = e.data.error;
        } else if (e.data?.detail) {
          errorMessage = e.data.detail;
        } else if (typeof e.data === 'string') {
          errorMessage = e.data;
        } else if (e.message) {
          errorMessage = e.message;
        }
        setError(errorMessage);
        // Clear the OTP input on error
        setOtp("");
      } finally {
        setLoading(false);
      }
    };

    const handleResetPassword = async () => {
      setError(null);
      setSuccess(null);
      if (!newPassword || !confirmPassword) {
        setError("Please enter password and confirm password");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      const passwordValidationError = validatePassword(newPassword);
      if (passwordValidationError) {
        setError(passwordValidationError);
        return;
      }

      try {
        setLoading(true);
        const response = await axiosInstance.post("/api/cargpt/reset-password/", {
          mobile_no: "+" + mobile,
          password: newPassword,
        });
        // Show message from server response if available
        // Example expected: { status: "success", message: "Password reset successfully." }
        // Fallback to a sane default
        // response can be string or object depending on backend
        const serverMessage =
          (response && (response as any).message) ||
          (typeof response === "string" ? response : null) ||
          "Password reset successful";
        setSuccess(serverMessage as string);
        // close after a short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } catch (e) {
        setError("Failed to reset password");
      } finally {
        setLoading(false);
      }
    };

    const resetStateOnClose = () => {
      setError(null);
      setSuccess(null);
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setDemoOtp("");
      setReadingState("idle");
      setStep("mobile");
      setResendTimer(0);
      setCanResend(true);
      onClose();
    };

    const goBackToMobile = () => {
      setError(null);
      setSuccess(null);
      setOtp("");
      setDemoOtp("");
      setReadingState("idle");
      setStep("mobile");
      setResendTimer(0);
      setCanResend(true);
    };

    const handleStepSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (step === "mobile") return void handleSendOtp();
      if (step === "otp") return void handleVerifyOtp();
      if (step === "reset") return void handleResetPassword();
    };

    const handleBack = () => {
      if (step === "mobile") {
        resetStateOnClose();
      } else {
        goBackToMobile();
      }
    };

    // If on mobile and reading, mark failed after timeout
    React.useEffect(() => {
      if (step !== "otp" || !isMobile) return;
      if (readingState !== "reading") return;
      const timer = setTimeout(() => {
        setReadingState((prev) => (prev === "reading" ? "failed" : prev));
      }, 8000);
      return () => clearTimeout(timer);
    }, [step, isMobile, readingState]);
    return (
      <Dialog
        open={open}
        onClose={resetStateOnClose}
        maxWidth="xs"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            position: "relative",
            pt: isMobile
              ? `calc(env(safe-area-inset-top, 0px) + ${theme.spacing(isNative ? 6 : 3)})`
              : theme.spacing(2),
            pl: `calc(env(safe-area-inset-left, 0px) + ${theme.spacing(1)})`,
            pr: `calc(env(safe-area-inset-right, 0px) + ${theme.spacing(1)})`,
            overflowX: 'hidden',
          },
        }}
      >
        {/* Close (Back) button */}
        <IconButton
          onClick={handleBack}
          sx={{
            position: "absolute",
            top: isNative ? "56px":"10px",
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
            overflowX: 'hidden',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 2.2, /* More compact padding */
              width: { xs: '100%', sm: 420 },
              maxWidth: 420,
              borderRadius: 3,
              backgroundColor: 'transparent',
              backdropFilter: 'none',
              border: 'none',
              boxShadow: 'none',
            }}
          >
            {/* Top Row: Back Arrow + Centered Logo */}
            <Box textAlign="center" mb={0.5}>
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
                {step === 'otp' ? (
                  <VpnKey sx={{ color: 'white', fontSize: 40 }} />
                ) : (
                  <Lock sx={{ color: 'white', fontSize: 40 }} />
                )}
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
                Forgot Password
              </Typography>
              {/* Removed 'Reset your password' subtitle as requested */}
            </Box>

            <form onSubmit={handleStepSubmit}>
              {step === "mobile" && (
                <Box mt={1}>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Enter your mobile number
                  </Typography>
                  <PhoneInput
                    country={"in"}
                    value={mobile}
                    onChange={(phone) => setMobile(phone)}
                    inputProps={{
                      name: "mobile",
                      required: true,
                      onKeyDown: (e: any) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSendOtp();
                        }
                      },
                    }}
                    disabled={false}
                    containerStyle={{
                      marginBottom: '0px',
                      marginTop: "8px"
                    }}
                    dropdownStyle={{
                      backgroundColor: mode === "dark" ? "#000" : "#fff",
                      color: mode === "dark" ? "#ccc" : "#000",
                      border: `1px solid ${mode === "dark" ? "#000" : "#ccc"}`,
                    }}
                    inputStyle={{
                      width: "100%",
                      height: "56px",
                      borderRadius: '8px',
                      fontSize: '16px',
                      paddingLeft: '48px',
                      backgroundColor: mode === "dark" ? "#1e1e1e" : "#f8f9fa",
                      color: mode === "dark" ? "#fff" : "#000",
                      border: `1px solid ${mode === "dark" ? "#444" : "#ccc"}`,
                    }}
                    buttonStyle={{
                      backgroundColor: mode === "dark" ? "#1e1e1e" : "#fff",
                      border: `1px solid ${mode === "dark" ? "#444" : "#ccc"}`,
                    }}
                  />
                  {!isMobileMatching && (
                    <Alert severity="warning" sx={{ mt: 0.5 }}>Entered number must match the login mobile</Alert>
                  )}
                  {/* Send OTP button */}
                  <Box mt={1.5} display="flex" justifyContent="center">
                    <Button
                      form="forgotForm"
                      type="submit"
                      onClick={handleSendOtp}
                      variant="contained"
                      disabled={loading || !mobile || !isMobileMatching}
                      fullWidth
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
                      Send OTP
                    </Button>
                  </Box>
                </Box>
              )}

              {step === "otp" && (
                <Box sx={{ mt: 1 }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleVerifyOtp();
                    }
                  }}
                >
                  <Typography variant="body2" align="center" sx={{ mb: 0.5 }}>
                    Enter OTP sent to +{mobile}
                  </Typography>
                  <Box display="flex" justifyContent="center" mb={0.2}>
                    <Button size="small" variant="text" onClick={goBackToMobile} sx={{ fontSize: 14, p: 0 }}>
                      Change number
                    </Button>
                  </Box>
                  <Box mt={1}>
                    <OtpBoxes
                      length={otpLength}
                      value={otp}
                      onChange={setOtp}
                      onComplete={(code) => {
                        setOtp(code);
                        // Don't auto-verify, let user click verify button
                      }}
                      autoFocus
                      disabled={loading}
                      useWebOtp={false}
                    />
                  </Box>
                  
                  {/* Manual Verify Button */}
                  <Box mt={1} display="flex" justifyContent="center">
                    <Button
                      variant="contained"
                      onClick={() => handleVerifyOtp()}
                      disabled={loading || otp.length < otpLength}
                      fullWidth
                      sx={{
                        mb: 1,
                        height: 44,
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
                  
                  {/* Resend OTP Button with Timer */}
                  <Box mt={0.2} display="flex" justifyContent="center">
                    <Button
                      variant="text"
                      onClick={handleResendOtp}
                      disabled={!canResend || resendTimer > 0 || loading}
                      sx={{ minWidth: 120, fontSize: 14 }}
                    >
                      {resendTimer > 0 
                        ? `Resend in ${resendTimer}s` 
                        : "Resend OTP"
                      }
                    </Button>
                  </Box>
                </Box>
              )}

              {step === "reset" && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="h6" align="center" sx={{ mb: 0.5 }}>
                    Create a new password
                  </Typography>
                  <TextField
                    fullWidth
                    label="New Password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: '#0072ff' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowNewPassword((s) => !s)}
                            edge="end"
                            aria-label="toggle password visibility"
                          >
                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 1.5,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: mode === 'dark' ? '#1e1e1e' : '#f8f9fa',
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleResetPassword();
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: '#0072ff' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword((s) => !s)}
                            edge="end"
                            aria-label="toggle password visibility"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 2.5,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: mode === 'dark' ? '#1e1e1e' : '#f8f9fa',
                      },
                    }}
                  />
                  {/* Reset Password button */}
                  <Box mt={0.5} display="flex" justifyContent="center">
                    <Button
                      form="forgotForm"
                      type="submit"
                      onClick={handleResetPassword}
                      variant="contained"
                      disabled={loading || !newPassword || !confirmPassword}
                      fullWidth
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
                      Reset Password
                    </Button>
                  </Box>
                </Box>
              )}

              {error && (
                <Alert severity="error" sx={{ mt: 0.5 }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mt: 0.5 }}>
                  {success}
                </Alert>
              )}
            </form>
          </Paper>
        </Box>

        <DialogActions sx={{ p: 2 }}>
          {/* Only show the Send OTP button for the first step */}
          {/* Removed duplicate Verify OTP button from DialogActions */}
          {/* Removed duplicate Reset Password button from DialogActions */}
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

  export default ForgotPasswordDialog;


