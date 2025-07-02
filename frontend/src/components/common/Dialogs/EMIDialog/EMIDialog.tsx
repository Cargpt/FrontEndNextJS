import { Close, KeyboardBackspaceSharp } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
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
  // Ensure carPrice is valid, default to 1000000 if invalid
  const validCarPrice = carPrice && !isNaN(carPrice) && carPrice > 0 ? carPrice : 1000000;
  
  // Calculate initial values based on car price
  const initialDownPayment = Math.round((validCarPrice * 0.20) / 10000) * 10000; // 20% of car price, rounded to nearest 10k
  const initialLoanAmount = validCarPrice - initialDownPayment; // 80% of car price
  
  const [loanAmount, setLoanAmount] = useState(initialLoanAmount);
  const [downPayment, setDownPayment] = useState(initialDownPayment);
  const [interestRate, setInterestRate] = useState(22.8);
  const [loanTerm, setLoanTerm] = useState(5);
  const [emi, setEmi] = useState(0);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Reset values when car price changes or dialog opens
  useEffect(() => {
    if (open && validCarPrice) {
      const newDownPayment = Math.round((validCarPrice * 0.20) / 10000) * 10000;
      const newLoanAmount = validCarPrice - newDownPayment;
      setDownPayment(newDownPayment);
      setLoanAmount(newLoanAmount);
    }
  }, [open, validCarPrice]);

  const calculateEMI = () => {
    const principal = loanAmount;
    const monthlyRate = interestRate / 12 / 100;
    const numberOfMonths = loanTerm * 12;
    
    if (principal <= 0 || monthlyRate <= 0 || numberOfMonths <= 0) {
      setEmi(0);
      return;
    }
    
    const emiCalc =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) /
      (Math.pow(1 + monthlyRate, numberOfMonths) - 1);
    setEmi(emiCalc);
  };

  // Handle down payment change - adjust loan amount accordingly
  const handleDownPaymentChange = (value: number) => {
    if (isNaN(value) || value < 0) return;
    const newDownPayment = Math.min(value, validCarPrice * 0.95); // Max 95% of car price
    const newLoanAmount = validCarPrice - newDownPayment;
    setDownPayment(newDownPayment);
    setLoanAmount(newLoanAmount);
  };

  // Handle loan amount change - adjust down payment accordingly
  const handleLoanAmountChange = (value: number) => {
    if (isNaN(value) || value < 0) return;
    const maxLoanAmount = validCarPrice * 0.80; // Max 80% of car price
    const newLoanAmount = Math.min(value, maxLoanAmount);
    const newDownPayment = validCarPrice - newLoanAmount;
    setLoanAmount(newLoanAmount);
    setDownPayment(newDownPayment);
  };

  useEffect(() => {
    calculateEMI();
  }, [loanAmount, downPayment, interestRate, loanTerm]);

  // Calculate min and max values
  const minDownPayment = Math.round((validCarPrice * 0.20) / 10000) * 10000; // 20% minimum
  const maxDownPayment = Math.round((validCarPrice * 0.95) / 10000) * 10000; // 95% maximum
  const minLoanAmount = Math.round((validCarPrice * 0.05) / 10000) * 10000; // 5% minimum
  const maxLoanAmount = Math.round((validCarPrice * 0.80) / 10000) * 10000; // 80% maximum

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isSmallScreen}
      PaperProps={{
        sx: {
          width: {
            xs: "100%",
            md: "80%",
          },
          maxWidth: "500px",
        },
      }}
    >
      <DialogTitle sx={{ background: "#eeeeef" }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ position: "absolute", left: 15, top: 17 }}
        >
          <KeyboardBackspaceSharp />
        </Button>
        <Typography
          sx={{ position: "relative", textAlign: "center", fontWeight: 700 }}
        >
          EMI Calculator
        </Typography>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          overflowY: "auto",
          height: "100%",
          padding: "15px 40px 15px 40px",
        }}
      >
        <Box display="flex" flexDirection="column" gap={3}>
          {/* Car Price Display */}
          <Box>
            <Typography variant="h6" color="primary" align="center">
              Car Price: ₹{(validCarPrice / 100000).toFixed(1)}L
            </Typography>
          </Box>

          {/* Down Payment */}
          <Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography gutterBottom>
                Down Payment (Min 20%): ₹
              </Typography>
              <TextField
                type="number"
                value={downPayment}
                onChange={(e) => handleDownPaymentChange(Number(e.target.value))}
                inputProps={{
                  min: minDownPayment,
                  max: maxDownPayment,
                  step: 10000
                }}
              />
            </Box>
            <Slider
              value={downPayment}
              onChange={(e, val) => handleDownPaymentChange(val as number)}
              min={minDownPayment}
              max={maxDownPayment}
              step={10000}
              sx={{ flexGrow: 1 }}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `₹${(value / 100000).toFixed(1)}L`}
            />
            <Typography variant="caption" color="text.secondary">
              {((downPayment / validCarPrice) * 100).toFixed(1)}% of car price
            </Typography>
          </Box>

          {/* Loan Amount */}
          <Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography gutterBottom>
                Loan Amount (Max 80%): ₹
              </Typography>
              <TextField
                type="number"
                value={loanAmount}
                onChange={(e) => handleLoanAmountChange(Number(e.target.value))}
                inputProps={{
                  min: minLoanAmount,
                  max: maxLoanAmount,
                  step: 10000
                }}
              />
            </Box>
            <Slider
              value={loanAmount}
              onChange={(e, val) => handleLoanAmountChange(val as number)}
              min={minLoanAmount}
              max={maxLoanAmount}
              step={10000}
              sx={{ flexGrow: 1 }}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `₹${(value / 100000).toFixed(1)}L`}
            />
            <Typography variant="caption" color="text.secondary">
              {((loanAmount / validCarPrice) * 100).toFixed(1)}% of car price
            </Typography>
          </Box>

          {/* Interest Rate */}
          <Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography gutterBottom>Interest Rate (% per annum):</Typography>
              <TextField
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                inputProps={{
                  min: 0,
                  max: 40,
                  step: 0.1
                }}
              />
            </Box>
            <Slider
              value={interestRate}
              onChange={(e, val) => setInterestRate(val as number)}
              min={0}
              max={40}
              step={0.1}
              sx={{ flexGrow: 1 }}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}%`}
            />
          </Box>

          {/* Loan Term */}
          <Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography gutterBottom>Loan Term (years):</Typography>
              <TextField
                type="number"
                value={loanTerm}
                onChange={(e) => setLoanTerm(Number(e.target.value))}
                inputProps={{
                  min: 1,
                  max: 10,
                  step: 1
                }}
              />
            </Box>
            <Slider
              value={loanTerm}
              onChange={(e, val) => setLoanTerm(val as number)}
              min={1}
              max={10}
              step={1}
              sx={{ flexGrow: 1 }}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value} years`}
            />
          </Box>

          {/* EMI Display */}
          <Box sx={{ 
            background: "#f5f5f5", 
            padding: 2, 
            borderRadius: 2,
            border: "2px solid #1976d2"
          }}>
            <Typography variant="h5" color="primary" align="center" fontWeight="bold">
              Monthly EMI: ₹{emi.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" mt={1}>
              Total Amount: ₹{(emi * loanTerm * 12).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Total Interest: ₹{((emi * loanTerm * 12) - loanAmount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </Typography>
          </Box>

          {/* Button */}
          <Box display="flex" justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              onClick={calculateEMI}
              sx={{ borderRadius: "20px", px: 4, textTransform: "capitalize" }}
            >
              Recalculate EMI
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default EMIDialog;