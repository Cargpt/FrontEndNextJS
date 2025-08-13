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
} from "@mui/material";
import OtpBoxes from "@/components/common/otp/OtpBoxes";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";
import { useColorMode } from "@/Context/ColorModeContext";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Visibility, VisibilityOff, KeyboardBackspaceSharp } from "@mui/icons-material";
import { Capacitor } from "@capacitor/core";
import { axiosInstance } from "@/utils/axiosInstance";
import { useRouter } from "next/navigation";

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

  const router = useRouter();

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
      await axiosInstance.post("/api/cargpt/reset-password/", {
        phone_number: "+" + mobile,
        password: newPassword,
      });
      setSuccess("Password reset successful");
      // close after a short delay
      setTimeout(() => {
        onClose();
        router.push("/login");
      }, 800);
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
        },
      }}
    >
      <DialogContent sx={{ p: { xs: 3, sm: 3 }, pt: isMobile ? 1 : 3 }}>
        {/* Top Row: Back Arrow + Centered Logo */}
        <Box display="flex" alignItems="center" mb={2}>
          <IconButton onClick={handleBack} aria-label="back" sx={{ mr: 1 }}>
            <KeyboardBackspaceSharp />
          </IconButton>
          <Box flex={1} display="flex" justifyContent="center">
            <img
              loading="lazy"
              src={mode === "light" ? "/assets/AICarAdvisor.png" : "/assets/AICarAdvisor_transparent.png"}
              alt="Logo"
              style={{ height: 48 }}
              width={200}
              height={48}
            />
          </Box>
          {/* Right spacer to keep the logo visually centered */}
          <Box sx={{ width: 40, height: 40 }} />
        </Box>
        {step !== "reset" && (
          <Typography variant="h6" align="center" gutterBottom sx={{ mb: 3 }}>
            Forgot Password
          </Typography>
        )}

        <Box component="form" id="forgotForm" onSubmit={handleStepSubmit}>
          {step === "mobile" && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
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
                containerStyle={{ marginTop: "8px", marginBottom: "20px" }}
                dropdownStyle={{
                  backgroundColor: mode === "dark" ? "#000" : "#fff",
                  color: mode === "dark" ? "#ccc" : "#000",
                  border: `1px solid ${mode === "dark" ? "#000" : "#ccc"}`,
                }}
                inputStyle={{
                  width: "100%",
                  backgroundColor: mode === "dark" ? "inherit" : "#fff",
                  color: mode === "dark" ? "inherit" : "#000",
                  border: `1px solid ${mode === "dark" ? "inherit" : "#ccc"}`,
                  borderRadius: 4,
                  height: 40,
                }}
                buttonStyle={{
                  backgroundColor: mode === "dark" ? "inherit" : "#fff",
                  border: `1px solid ${mode === "dark" ? "inherit" : "#ccc"}`,
                }}
              />
              {!isMobileMatching && (
                <Alert severity="warning">Entered number must match the login mobile</Alert>
              )}
              {/* Send OTP button */}
              <Box mt={2} display="flex" justifyContent="center">
                <Button
                  form="forgotForm"
                  type="submit"
                  onClick={handleSendOtp}
                  variant="contained"
                  disabled={loading || !mobile || !isMobileMatching}
                  fullWidth
                >
                  Send OTP
                </Button>
              </Box>
            </Box>
          )}

          {step === "otp" && (
            <Box sx={{ mt: 2 }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleVerifyOtp();
                }
              }}
            >
              <Typography variant="body2" align="center" sx={{ mb: 1 }}>
                Enter OTP sent to +{mobile}
              </Typography>
              <Box display="flex" justifyContent="center" mb={1}>
                <Button size="small" variant="text" onClick={goBackToMobile}>
                  Change number
                </Button>
              </Box>
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
              
              {/* Manual Verify Button */}
              <Box mt={2} display="flex" justifyContent="center">
                <Button
                  variant="contained"
                  onClick={() => handleVerifyOtp()}
                  disabled={loading || otp.length < otpLength}
                  fullWidth
                >
                  Verify OTP
                </Button>
              </Box>
              
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

          {step === "reset" && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" align="center" sx={{ mb: 2 }}>
                Create a new password
              </Typography>
              <Input
                type={showNewPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword((s) => !s)}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleResetPassword();
                  }
                }}
                fullWidth
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword((s) => !s)}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />
              {/* Reset Password button */}
              <Box mt={2} display="flex" justifyContent="center">
                <Button
                  form="forgotForm"
                  type="submit"
                  onClick={handleResetPassword}
                  variant="contained"
                  disabled={loading || !newPassword || !confirmPassword}
                  fullWidth
                >
                  Reset Password
                </Button>
              </Box>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        {/* Only show the Send OTP button for the first step */}
        {/* Removed duplicate Verify OTP button from DialogActions */}
        {/* Removed duplicate Reset Password button from DialogActions */}
      </DialogActions>
    </Dialog>
  );
};

export default ForgotPasswordDialog;


