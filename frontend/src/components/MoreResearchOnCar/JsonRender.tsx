import React, { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";

type JsonValue = string | number | boolean | null | string[];
interface JsonRow {
  [key: string]: JsonValue;
}

interface Props {
  data: { [category: string]: JsonRow };
  onCategoryClick?: (category: any) => void;
  title: string;
}

const DynamicTable: React.FC<Props> = ({ data, onCategoryClick, title }) => {
  const categories = Object.keys(data);
  const [isDisabled, setisDisabled] = useState<string>("");

  // Collect all unique keys from all rows
  const allColumns = Array.from(
    new Set(categories.flatMap((category) => Object.keys(data[category] || {})))
  );
    const theme = useTheme();
  
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box sx={{ mt: 0 }}>
      <TableContainer
        component={Paper}
        sx={{
          maxWidth: "100%",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollBehavior: "smooth",
        }}
      >
        <Box sx={{                   
          
          maxWidth: isSmallScreen ? "300px" : "600px", overflow: "auto" }}>
          <Table>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                {/* Category column with sticky positioning */}
                <TableCell
                  sx={{
                    position: "sticky",
                    left: 0,
                    backgroundColor: "#f5f5f5",
                    zIndex: 1, // Ensure it stays above other content
                    boxShadow: "2px 0px 5px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <strong>Category</strong>
                </TableCell>
                {allColumns.map((col, i) => (
                  <TableCell key={i}>
                    <strong>{col}</strong>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category, i) => (
                <TableRow key={i}>
                  {/* Category cell with sticky positioning */}
                  <TableCell
                    sx={{
                      position: "sticky",
                      left: 0,
                      backgroundColor: "white", // Ensure background color matches the rest of the table
                      zIndex: 1,
                      boxShadow: "2px 0px 5px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <Button
                      disabled={
allColumns.includes("Price") ||
  allColumns.includes("Ground Clearance") ||
  allColumns.includes("Power Transmission") ||
  !!isDisabled // <-- Convert string to boolean
  
}                      
                      variant={category === isDisabled ? "contained" : "outlined"}
                      size="small"
                      onClick={() => {
                        onCategoryClick?.({ ...data[category], Brand: category });
                        setisDisabled(category);
                      }}
                      sx={{ textTransform: "none", fontSize: "14px" }}
                    >
                      {category}
                    </Button>
                  </TableCell>
                  {allColumns.map((col, j) => {
                    const value = data[category]?.[col];
                    return (
                      <TableCell key={j}>
                        {Array.isArray(value)
                          ? value.join(", ")
                          : String(value ?? "")}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </TableContainer>
    </Box>
  );
};

export default DynamicTable;
