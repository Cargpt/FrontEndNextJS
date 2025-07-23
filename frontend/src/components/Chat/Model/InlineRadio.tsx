import React from 'react';
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';

interface BudgetSelectorProps {
  budgetTypes: string[];
  currentBudget: string;
  label:string
  handleBudgetChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const BudgetSelector: React.FC<BudgetSelectorProps> = ({
  budgetTypes,
  currentBudget,
  handleBudgetChange,
  label
}) => {
  return (
    <FormControl component="fieldset">
      <FormLabel component="legend" sx={{fontSize: "14px", fontWeight: 600}}>{label}</FormLabel>
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
        {budgetTypes.map((budget, index) => (
          <FormControlLabel
            key={index}
            value={budget}
            control={<Radio />}
            label={budget}
               sx={{
              flex: "1 1 auto",
              minWidth: "fit-content",
            }}          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};

export default BudgetSelector;
