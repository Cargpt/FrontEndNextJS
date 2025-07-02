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

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
        {title}
      </Typography>
     <TableContainer
  component={Paper}
   sx={{
    maxWidth: '100%',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    scrollBehavior: 'smooth',
  }}

>
  <Box sx={{ minWidth: '700px' }}>
    <Table >
      <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
        <TableRow>
          <TableCell>
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
            <TableCell>
              <Button
                disabled={
                  allColumns.includes("Price") ||
                  allColumns.includes("Ground Clearance") ||
                  allColumns.includes("Power Transmission") ||
                  (isDisabled ? true : false)
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
