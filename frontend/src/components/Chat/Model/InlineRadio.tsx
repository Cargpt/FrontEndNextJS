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
      useEffect(()=>{
        setSelectedValue(options[0])
if(label.toLowerCase().replace(/\s+/g, "_")==="budget"){
           onChange?.(label.toLowerCase().replace(/\s+/g, "_"), Number(getUpperLimitInRupees(options[0])));
 
    }else{
onChange?.(label.toLowerCase().replace(/\s+/g, "_"), isNaN(Number(options[0])) ?  options[0] : Number(options[0]));

    }
      }, [options])


  
  return (
<FormControl component="fieldset" fullWidth>
  <FormLabel component="legend">{label}</FormLabel>
  <RadioGroup
    name={label.toLowerCase().replace(/\s+/g, "_")}
    value={selectedValue?.toString() ?? ""}
    onChange={handleChange}
    sx={{
      display: "flex",
       flexDirection: "row",  // ✅ always row layout
    flexWrap: "wrap", 
      gap: 1, // space between radio buttons
    }}
  >
    {options.map((option) => (
      <FormControlLabel
        key={option}
        value={option}
        control={<Radio size="small" />}
        label={option}
 sx={{
        flex: "1 1 auto", // ✅ grow/shrink evenly
        minWidth: "fit-content", // ✅ or set a fixed width if preferred
      }}
      />
    ))}
  </RadioGroup>
</FormControl>

  );
};

export default BrandSelector;
