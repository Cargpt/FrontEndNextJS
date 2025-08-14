import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { getBudgetRange } from "@/utils/services";

interface CarFilter {
  budget: number;
  fuel_type: string;
  body_type?: string;
  transmission_type: string;
  brand_name: string;
}

interface CarRecommendationTableProps {
  recommendations: CarFilter;
}

const CarRecommendationTable: React.FC<CarRecommendationTableProps> = ({
  recommendations,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const rows = [
    { label: "Budget", value: `₹${getBudgetRange(recommendations.budget) }`},
    { label: "Fuel", value: recommendations.fuel_type || "-" },
    { label: "Body", value: recommendations.body_type || "-" },
    { label: "Transmission", value: recommendations.transmission_type || "-" },
    { label: "Brand", value: recommendations.brand_name || "-" },
  ];

  return (
    <Box sx={{ overflowX: "auto" }}>
      <Typography gutterBottom sx={{ fontSize: "15px", textAlign: "left", fontWeight: 600 }}>
        ✅ Based on your preferences, here are our recommendations:
      </Typography>
      <TableContainer component={Paper} sx={{backgroundColor:"transparent", backgroundImage:"none"}}>
        <Table size="small" aria-label="recommendation table">
          {isMobile ? (
            // 📱 Vertical view for small screens
            (<TableBody>
              {rows.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{ fontWeight: "bold" }}
                  >
                    {row.label}
                  </TableCell>
                  <TableCell>{row.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>)
          ) : (
            // 💻 Horizontal view for medium+ screens
            (<>
              <TableHead>
                <TableRow>
                  {rows.map((row, idx) => (
                    <TableCell key={idx}>
                      <strong>{row.label}</strong>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {rows.map((row, idx) => (
                    <TableCell key={idx}>{row.value}</TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </>)
          )}
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CarRecommendationTable;
