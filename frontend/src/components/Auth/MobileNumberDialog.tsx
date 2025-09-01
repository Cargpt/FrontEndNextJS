import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Box,
  useTheme,
  alpha,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { Person, KeyboardBackspaceSharp } from "@mui/icons-material";
import SvgIcon from "@mui/material/SvgIcon";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";
import { axiosInstance } from "@/utils/axiosInstance";
import { useSnackbar } from "@/Context/SnackbarContext";
import OtpBoxes from "@/components/common/otp/OtpBoxes";
import { useRouter } from "next/navigation";
// no cookies here; parent will set cookies on success

interface MobileNumberDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (resp: any) => void;
  userData: {
    email: string;
    first_name: string;
    last_name: string;
    photo: string;
  };
  source?: 'login' | 'test-drive';
  token?: string | null;
  hide?: () => void;
}

const MobileNumberDialog: React.FC<MobileNumberDialogProps> = ({
  open,
  onClose,
  onSuccess,
  userData,
  source,
  token,
  hide,
}) => {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const { showSnackbar } = useSnackbar();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();

  const [mobileNumber, setMobileNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState<number>(0);
  const [resendLoading, setResendLoading] = useState<boolean>(false);

  React.useEffect(() => {
    let interval: any;
    if (open && step === "otp" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [open, step, resendTimer]);

  const handleResendOtp = async () => {
    if (resendTimer > 0 || !mobileNumber) return;
    setResendLoading(true);
    try {
      await axiosInstance.post(
        "/api/cargpt/verify-save-mobile/",
        {
          phone_number: mobileNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showSnackbar("OTP resent successfully", { vertical: "top", horizontal: "center" });
      setResendTimer(60);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to resend OTP";
      setError(msg);
    } finally {
      setResendLoading(false);
    }
  };

  const resetState = () => {
    setStep("mobile");
    setOtp("");
    setMobileNumber("");
    setError(null);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (step === "mobile") {
      if (!mobileNumber || mobileNumber.replace(/\D/g, "").length < 10) {
        setError("Please enter a valid mobile number");
        return;
      }
      setIsLoading(true);
      try {
        await axiosInstance.post(
          "/api/cargpt/verify-save-mobile/",
          {
            phone_number: mobileNumber,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        showSnackbar("OTP sent successfully", { vertical: "top", horizontal: "center" });
        setStep("otp");
        setResendTimer(60);
      } catch (err: any) {
        
        const msg = err?.data?.error || "Failed to send OTP";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (step === "otp") {
      if (!otp || otp.length < 4) {
        setError("Enter the OTP sent to your phone");
        return;
      }
      setIsLoading(true);
      try {
        const response = await axiosInstance.post(
          "/api/cargpt/verify-save-mobile/",
          {
            phone_number: mobileNumber,
            otp: otp,
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            photo: userData.photo,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.message === "Mobile number verified and saved successfully") {
          showSnackbar("Mobile verified successfully!", {
            vertical: "top",
            horizontal: "center",
          });

          onSuccess({ token, mobileNumber });
          onClose();
          if (source === 'login') {
            router.push("/");
            if (hide) hide();
          }
        } else {
          setError(response.message || "OTP verification failed. Please try again.");
        }
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.otp?.[0] ||
          error?.response?.data?.message ||
          "OTP verification failed. Please try again.";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        resetState();
        onClose();
        if (source === 'login') {
          router.push("/");
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("close-login-dialog"));
          }
        }
      }}
      maxWidth="xs"
      fullScreen={isMobile}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundColor:
            mode === "dark" ? alpha("#121212", 0.95) : alpha("#ffffff", 0.95),
          backdropFilter: "blur(15px)",
          border: `1px solid ${alpha("#ffffff", mode === "dark" ? 0.1 : 0.2)}`,
          width: isMobile ? "100%" : (step === "otp" ? 520 : 420),
          maxWidth: "100%",
          boxSizing: "border-box",
          overflowX: "hidden",
        },
      }}
    >
      <DialogContent sx={{ p: 3, pt: isMobile ? 6 : 3, position: "relative", overflow: "hidden" }}>
        <IconButton
          aria-label="Back"
          onClick={() => {
            if (step === "otp") {
              setStep("mobile");
              setOtp("");
              setError(null);
            } else {
              resetState();
              onClose();
              if (source === 'login') {
                router.push("/");
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("close-login-dialog"));
                }
              }
            }
          }}
          sx={{ position: "absolute", top: 8, left: 8 }}
        >
          <KeyboardBackspaceSharp />
        </IconButton>
        <Box textAlign="center" mb={2}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "linear-gradient(to right, #00c6ff, #0072ff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              boxShadow: `0 8px 25px ${alpha("#667eea", 0.3)}`,
            }}
          >
            {step === "otp" ? (
              <SvgIcon sx={{ color: "white", fontSize: 30 }} viewBox="0 0 24 24">
                <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2"></path>
              </SvgIcon>
            ) : (
              <Person sx={{ color: "white", fontSize: 30 }} />
            )}
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              background: "linear-gradient(to right, #00c6ff, #0072ff)",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
            }}
          >
            Complete Your Profile
          </Typography>
          {step === "mobile" && (
            <Typography variant="body1" color="text.secondary">
              Please provide your mobile number to complete the registration
            </Typography>
          )}
        </Box>

        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit(e as any);
            }
          }}
        >
          {step === "mobile" && (
            <>
              <PhoneInput
                country={"in"}
                value={mobileNumber}
                onChange={(phone) => setMobileNumber(phone)}
                inputProps={{
                  name: "mobile",
                  required: true,
                  autoFocus: true,
                }}
                inputStyle={{
                  width: "100%",
                  height: "50px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  paddingLeft: "48px",
                  border: `1px solid ${mode === "dark" ? "#444" : "#ccc"}`,
                  backgroundColor: mode === "dark" ? "#1e1e1e" : "#f8f9fa",
                  color: mode === "dark" ? "#fff" : "#000",
                }}
                containerStyle={{ marginBottom: "16px" }}
                buttonStyle={{
                  backgroundColor: mode === "dark" ? "#1e1e1e" : "#fff",
                  border: `1px solid ${mode === "dark" ? "#444" : "#ccc"}`,
                }}
              />
            </>
          )}

          {step === "otp" && (
            <>
              <Typography variant="body2" align="center" sx={{ mb: 1 }}>
                Enter OTP sent to +{mobileNumber}
              </Typography>
              <Box display="flex" justifyContent="center" mb={1}>
                <OtpBoxes
                  length={6}
                  value={otp}
                  onChange={setOtp}
                  autoFocus
                  disabled={isLoading}
                />
              </Box>
            </>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <DialogActions sx={{ p: 0, mt: 2, display: 'block' }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={
                isLoading || (step === "mobile" ? !mobileNumber : otp.length < 4)
              }
              sx={{
                background: "linear-gradient(to right, #00c6ff, #0072ff)",
                boxShadow: "none",
                "&:hover": {
                  background: "linear-gradient(to right, #0072ff, #00c6ff)",
                },
                "&:disabled": {
                  background: "#ccc",
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : step === "mobile" ? (
                "Continue"
              ) : (
                "Verify OTP"
              )}
            </Button>
            {step === "otp" && (
              <Box display="flex" justifyContent="center" alignItems="center" gap={1} mt={1}>
                <Button
                  variant="text"
                  onClick={handleResendOtp}
                  disabled={resendLoading || resendTimer > 0}
                  sx={{ textTransform: "none" }}
                >
                  {resendTimer > 0 ? `Resend OTP in ${String(Math.floor(resendTimer / 60)).padStart(1,'0')}:${String(resendTimer % 60).padStart(2,'0')}` : "Resend OTP"}
                </Button>
                {resendLoading && <CircularProgress size={16} />}
              </Box>
            )}
          </DialogActions>
        </form>
      </DialogContent>

      <style>
        {`
          .react-tel-input .special-label {
            background-color: ${mode === "dark" ? "#333" : "#fff"} !important;
            color: ${mode === "dark" ? "#fff" : "#000"} !important;
            border-radius: 4px;
            padding: 2px 6px;
          }
          .react-tel-input .country-list .country:hover, 
          .react-tel-input .country-list .country.highlight {
            background-color: ${
              mode === "dark" ? "#333" : "#f1f1f1"
            } !important;
          }
        `}
      </style>
    </Dialog>
  );
};

export default MobileNumberDialog;
