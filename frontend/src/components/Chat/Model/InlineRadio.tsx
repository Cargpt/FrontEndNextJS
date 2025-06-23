import React, { useState, useEffect } from 'react';
import {
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
} from '@mui/material';
import { getUpperLimitInRupees } from '@/utils/services';

const BrandSelector: React.FC<BrandSelectorProps> = ({
  label,
  options,
  defaultValue,
  onChange,

}) => {
  const [selectedValue, setSelectedValue] = useState<number | string | null>(defaultValue ?? null);

  useEffect(() => {
    if (defaultValue !== undefined) {
      setSelectedValue(defaultValue);
    }
  }, [defaultValue]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setSelectedValue(newValue);
    if(event.target.name==="budget"){
           onChange?.(event.target.name, Number(getUpperLimitInRupees(newValue)));
 
    }else{
onChange?.(event.target.name, isNaN(Number(newValue)) ?  newValue : Number(newValue));

    }
      };


  
  return (
<FormControl component="fieldset" fullWidth>
  <FormLabel component="legend">{label}</FormLabel>
  <RadioGroup
    name={label.toLowerCase().replace(/\s+/g, "_")}
    value={selectedValue?.toString() ?? ""}
    onChange={handleChange}
    sx={{
      display: "flex",
      flexDirection: {
        xs: "column", // stack vertically on extra-small screens
        sm: "row",    // align horizontally from small screens and up
      },
      gap: 1, // space between radio buttons
      flexWrap: "wrap", // allow wrap if too many options
    }}
  >
    {options.map((option) => (
      <FormControlLabel
        key={option}
        value={option}
        control={<Radio size="small" />}
        label={option}
        sx={{
          minWidth: {
            xs: "100%",  // each radio takes full width on mobile
            sm: "auto",  // shrink to content on larger screens
          },
        }}
      />
    ))}
  </RadioGroup>
</FormControl>

  );
};

export default BrandSelector;
