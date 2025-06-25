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

interface CarDetails {
  Price: number;
  FuelType: string;
  TransmissionType: string;
  BrandName: string;
  ModelName: string;
  VariantName: string;
  BodyType?: string;
}

interface CarRecommendationTableProps {
  recommendations: CarFilter;
}

const CarRecommendationTable: React.FC<CarRecommendationTableProps> = ({
  recommendations,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box mt={3} sx={{ overflowX: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        ✅ Based on your preferences, here are our recommendations:
      </Typography>

      <TableContainer
        component={Paper}
        sx={{ minWidth: isMobile ? "700px" : "100%" }}
      >
        <Table
          size={isMobile ? "small" : "medium"}
          aria-label="car recommendation table"
        >
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Budget</strong>
              </TableCell>
              <TableCell>
                <strong>Fuel</strong>
              </TableCell>
              <TableCell>
                <strong>Body</strong>
              </TableCell>
              <TableCell>
                <strong>Transmission</strong>
              </TableCell>
              <TableCell>
                <strong>Brand</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>₹{recommendations.budget}</TableCell>
              <TableCell>{recommendations.fuel_type}</TableCell>
              <TableCell>{recommendations.body_type || "-"}</TableCell>
              <TableCell>{recommendations.transmission_type}</TableCell>
              <TableCell>{recommendations.brand_name}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CarRecommendationTable;
