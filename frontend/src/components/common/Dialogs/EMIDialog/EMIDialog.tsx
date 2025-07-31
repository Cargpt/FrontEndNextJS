import { useColorMode } from "@/Context/ColorModeContext";
import { KeyboardBackspaceSharp } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slider,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";

type EMIDialogProps = {
  open: boolean;
  onClose: () => void;
  carPrice: number;
};

const EMIDialog: React.FC<EMIDialogProps> = ({ open, onClose, carPrice }) => {
  const validCarPrice =
    carPrice && !isNaN(carPrice) && carPrice > 0 ? carPrice : 1000000;

  const initialDownPayment = Math.round((validCarPrice * 0.2) / 10000) * 10000;
  const initialLoanAmount = validCarPrice - initialDownPayment;

  const [downPayment, setDownPayment] = useState(initialDownPayment.toString());
  const [loanAmount, setLoanAmount] = useState(initialLoanAmount.toString());
  const [interestRate, setInterestRate] = useState("22.8");
  const [loanTerm, setLoanTerm] = useState("5");
  const [emi, setEmi] = useState(0);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (open && validCarPrice) {
      const newDownPayment = Math.round((validCarPrice * 0.2) / 10000) * 10000;
      const newLoanAmount = validCarPrice - newDownPayment;
      setDownPayment(newDownPayment.toString());
      setLoanAmount(newLoanAmount.toString());
      setInterestRate("22.8");
      setLoanTerm("5");
    }
  }, [open, validCarPrice]);

  const calculateEMI = () => {
    const principal = Number(loanAmount);
    const monthlyRate = Number(interestRate) / 12 / 100;
    const numberOfMonths = Number(loanTerm) * 12;

    if (principal <= 0 || monthlyRate <= 0 || numberOfMonths <= 0) {
      setEmi(0);
      return;
    }

    const emiCalc =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) /
      (Math.pow(1 + monthlyRate, numberOfMonths) - 1);
    setEmi(emiCalc);
  };

  const handleDownPaymentChange = (value: string) => {
    if (value === "") {
      setDownPayment("");
      return;
    }
    const numericValue = Number(value);
    if (isNaN(numericValue) || numericValue < 0) return;
    const newDownPayment = Math.min(numericValue, validCarPrice * 0.95);
    const newLoanAmount = validCarPrice - newDownPayment;
    setDownPayment(newDownPayment.toString());
    setLoanAmount(newLoanAmount.toString());
  };

  const handleLoanAmountChange = (value: string) => {
    if (value === "") {
      setLoanAmount("");
      return;
    }
    const numericValue = Number(value);
    if (isNaN(numericValue) || numericValue < 0) return;
    const maxLoanAmount = validCarPrice * 0.8;
    const newLoanAmount = Math.min(numericValue, maxLoanAmount);
    const newDownPayment = validCarPrice - newLoanAmount;
    setLoanAmount(newLoanAmount.toString());
    setDownPayment(newDownPayment.toString());
  };

  const handleInterestRateChange = (value: string) => {
    if (value === "") {
      setInterestRate("");
      return;
    }
    const numericValue = Number(value);
    if (isNaN(numericValue) || numericValue < 0) return;
    setInterestRate(numericValue.toString());
  };

  const handleLoanTermChange = (value: string) => {
    if (value === "") {
      setLoanTerm("");
      return;
    }
    const numericValue = Number(value);
    if (isNaN(numericValue) || numericValue < 0) return;
    setLoanTerm(numericValue.toString());
  };

  useEffect(() => {
    calculateEMI();
  }, [loanAmount, downPayment, interestRate, loanTerm]);

  const minDownPayment = Math.round((validCarPrice * 0.2) / 10000) * 10000;
  const maxDownPayment = Math.round((validCarPrice * 0.95) / 10000) * 10000;
  const minLoanAmount = Math.round((validCarPrice * 0.05) / 10000) * 10000;
  const maxLoanAmount = Math.round((validCarPrice * 0.8) / 10000) * 10000;

  const resetValues = () => {
    const newDownPayment = Math.round((validCarPrice * 0.2) / 10000) * 10000;
    const newLoanAmount = validCarPrice - newDownPayment;
    setDownPayment(newDownPayment.toString());
    setLoanAmount(newLoanAmount.toString());
    setInterestRate("22.8");
    setLoanTerm("5");
  };
useEffect(() => {
  if (open) {
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed"; // prevent bounce scroll on mobile
    document.body.style.width = "100%"; // fix layout shift
  } else {
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.width = "";
  }

  return () => {
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.width = "";
  };
}, [open]);
const {mode}=useColorMode()
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isSmallScreen}
      scroll="paper"
      PaperProps={{
        sx: {
          width: { xs: "100%", md: "80%" },
          maxWidth: "500px",
          height: isSmallScreen ? "100dvh" : "auto",
          maxHeight: isSmallScreen ? "100dvh" : "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: 6,
        },
      }}
    >
      {/* Fixed Header */}
      <DialogTitle
        sx={{
          bgcolor: mode=="dark"? "dark":"grey.100",
          position: "sticky",
          top: 0,
          zIndex: 2,
          textAlign: "center",
          fontWeight: 700,
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            position: "absolute",
            left: 15,
            top: 12,
            zIndex: 3,
            border: "none",
          }}
        >
          <KeyboardBackspaceSharp />
        </Button>
        EMI Calculator
      </DialogTitle>

      {/* Scrollable Body */}
      <DialogContent
        dividers
        sx={{
          overflowY: "auto",
          flexGrow: 1,
          padding: "15px 40px",
        }}
      >
        <Box display="flex" flexDirection="column" gap={2}>
          {/* Down Payment */}
          <Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography>Down Payment (Min 20%): ₹</Typography>
              <TextField
                type="text"
                inputMode="numeric"
                size="small"
                value={downPayment}
                onChange={(e) => handleDownPaymentChange(e.target.value)}
              />
            </Box>
            <Slider
              value={Number(downPayment) || 0}
              onChange={(e, val) => handleDownPaymentChange(String(val))}
              min={minDownPayment}
              max={maxDownPayment}
              step={10000}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `₹${(value / 100000).toFixed(1)}L`}
            />
            <Typography variant="caption" color="text.secondary">
              {downPayment
                ? ((Number(downPayment) / validCarPrice) * 100).toFixed(1)
                : "0"}
              % of car price
            </Typography>
          </Box>

          {/* Loan Amount */}
          <Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography>Loan Amount (Max 80%): ₹</Typography>
              <TextField
                type="text"
                inputMode="numeric"
                size="small"
                value={loanAmount}
                onChange={(e) => handleLoanAmountChange(e.target.value)}
              />
            </Box>
            <Slider
              value={Number(loanAmount) || 0}
              onChange={(e, val) => handleLoanAmountChange(String(val))}
              min={minLoanAmount}
              max={maxLoanAmount}
              step={10000}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `₹${(value / 100000).toFixed(1)}L`}
            />
            <Typography variant="caption" color="text.secondary">
              {loanAmount
                ? ((Number(loanAmount) / validCarPrice) * 100).toFixed(1)
                : "0"}
              % of car price
            </Typography>
          </Box>

          {/* Interest Rate */}
          <Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography>Interest Rate (% per annum):</Typography>
              <TextField
                type="text"
                inputMode="decimal"
                size="small"
                value={interestRate}
                onChange={(e) => handleInterestRateChange(e.target.value)}
              />
            </Box>
            <Slider
              value={Number(interestRate) || 0}
              onChange={(e, val) => handleInterestRateChange(String(val))}
              min={0}
              max={40}
              step={0.1}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}%`}
            />
          </Box>

          {/* Loan Term */}
          <Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography>Loan Term (years):</Typography>
              <TextField
                type="text"
                inputMode="numeric"
                size="small"
                value={loanTerm}
                onChange={(e) => handleLoanTermChange(e.target.value)}
              />
            </Box>
            <Slider
              value={Number(loanTerm) || 0}
              onChange={(e, val) => handleLoanTermChange(String(val))}
              min={1}
              max={10}
              step={1}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value} years`}
            />
          </Box>

          {/* EMI Display */}
          <Box
            sx={{
             bgcolor: mode=="dark"? "dark":"#f5f5f5",

              p: 2,
              borderRadius: 2,
              boxShadow: 3,
              border:  mode=="dark"? "dark":"2px solid #1976d2" ,
            }}
          >
            <Typography
              variant="h5"
              color="primary"
              align="center"
              fontWeight="bold"
            >
              Monthly EMI: ₹
              {emi.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              mt={1}
            >
              Total Amount: ₹
              {(emi * Number(loanTerm) * 12).toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Total Interest: ₹
              {(emi * Number(loanTerm) * 12 - Number(loanAmount)).toLocaleString(
                "en-IN",
                { maximumFractionDigits: 0 }
              )}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      {/* Optional Sticky Footer */}
      <DialogActions
        sx={{
          position: "sticky",
          bottom: 0,
          
          
          zIndex: 1,
          py: 2,
          justifyContent: "center",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={resetValues}
          sx={{ borderRadius: "20px", px: 4, textTransform: "capitalize" }}
        >
          Recalculate
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EMIDialog;
