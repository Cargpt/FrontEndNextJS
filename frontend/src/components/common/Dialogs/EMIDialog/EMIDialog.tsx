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
} from "@mui/material";
import React, { useEffect, useState } from "react";

type EMIDialogProps = {
  open: boolean;
  onClose: () => void;
};

const EMIDialog: React.FC<EMIDialogProps> = ({ open, onClose }) => {
  const [loanAmount, setLoanAmount] = useState(1315000);
  const [downPayment, setDownPayment] = useState(0);
  const [interestRate, setInterestRate] = useState(22.8);
  const [loanTerm, setLoanTerm] = useState(5);
  const [emi, setEmi] = useState(0);

  const calculateEMI = () => {
    const principal = loanAmount - downPayment;
    const monthlyRate = interestRate / 12 / 100;
    const numberOfMonths = loanTerm * 12;
    const emiCalc =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) /
      (Math.pow(1 + monthlyRate, numberOfMonths) - 1);
    setEmi(emiCalc);
  };

  useEffect(() => {
    calculateEMI();
  }, [loanAmount, downPayment, interestRate, loanTerm]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: {
            xs: "100%",
            sm: "100%",
            md: "80%",
          },
          maxWidth: "1000px",
          height: "90vh",
          maxHeight: "90vh",
          borderRadius: {
            xs: 0,
            sm: 2,
          },
        },
      }}
    >
      <DialogTitle sx={{ background: "#eeeeef" }}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", left: 8, top: 8 }}
        >
          <KeyboardBackspaceSharp />
        </IconButton>
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
          {/* Loan Amount */}
          <Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography gutterBottom>Loan Amount: ₹</Typography>
              <TextField
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
              />
            </Box>
            <Slider
              value={loanAmount}
              onChange={(e, val) => setLoanAmount(val as number)}
              min={100000}
              max={3000000}
              step={10000}
              sx={{ flexGrow: 1 }}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `₹${value}`}
            />
          </Box>

          {/* Down Payment */}
          <Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography gutterBottom>Down Payment: ₹</Typography>
              <TextField
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
              />
            </Box>
            <Slider
              value={downPayment}
              onChange={(e, val) => setDownPayment(val as number)}
              min={0}
              max={loanAmount}
              step={10000}
              sx={{ flexGrow: 1 }}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `₹${value}`}
            />
          </Box>

          {/* Interest Rate */}
          <Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography gutterBottom>Interest Rate (% per annum):</Typography>
              <TextField
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
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
              valueLabelFormat={(value) => `₹${value}`}
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
              valueLabelFormat={(value) => `₹${value}`}
            />
          </Box>

          {/* EMI Display */}
          <Typography variant="h6" color="primary" align="center">
            Monthly EMI: ₹{emi.toFixed(2)}
          </Typography>

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
