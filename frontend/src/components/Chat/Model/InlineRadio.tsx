import React from 'react';
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip, // Import Chip component
  useTheme,
  Box // Import Box for flexible layout
} from '@mui/material';
import { useColorMode } from '@/Context/ColorModeContext';

interface InlineRadioProps { // Renamed interface
  budgetTypes: (string | number)[]; // Allow number type for budgetTypes
  currentBudget: string | number; // Allow number type for currentBudget
  handleBudgetChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const InlineRadio: React.FC<InlineRadioProps> = ({
  budgetTypes,
  currentBudget,
  handleBudgetChange,
}) => {
  const theme = useTheme();
  const { mode } = useColorMode();

  return (
    <FormControl component="fieldset">
      <FormLabel component="legend" sx={{fontSize: "14px", fontWeight: 600, mb: 0.5}}></FormLabel> {/* Render icon next to label - icon prop removed */}
      <RadioGroup
        row
        name="budget-options"
        value={currentBudget}
        onChange={handleBudgetChange}
        sx={{
          display: "flex",
          flexDirection: "row", 
          flexWrap: "wrap",
          gap: 1, 
        }}
      >
        {budgetTypes.map((budget, index) => {
          const isSelected = String(currentBudget) === String(budget); // Convert both to string for comparison
          return (
            <FormControlLabel
              key={index}
              value={budget}
              control={
                <Radio sx={{ display: 'none' }} /> // Hide the actual radio button
              }
              label={
                <Chip
                  label={budget}
                  clickable
                  color={isSelected ? 'primary' : 'default'}
                  variant={isSelected ? 'filled' : 'outlined'}
                  sx={{
                    '& .MuiChip-label': {
                        textTransform: 'capitalize', // Capitalize first letter
                        fontWeight: 'bold', // Ensure text is bold
                    },
                    ...(isSelected ? {
                        // Selected state: handled by color='primary' and variant='filled' for blue background and white text
                        // No extra sx for color/background unless default theme primary isn't the desired blue
                    } : {
                        // Unselected state: white/light grey background, dark text, border
                        backgroundColor: mode === 'dark' ? theme.palette.action.disabledBackground : theme.palette.background.paper, // Light background for unselected
                        color: theme.palette.text.primary, // Dark text for unselected
                        borderColor: mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[400], // Adjust border color for dark mode
                    }),
                  }}
                />
              }
              sx={{
                margin: 0, // Remove default FormControlLabel margin
                "& .MuiFormControlLabel-label": {
                  margin: 0,
                },
              }}
            />
          );
        })}
      </RadioGroup>
    </FormControl>
  );
};

export default InlineRadio; // Export with new name
