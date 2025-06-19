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


  console.log(options)
  return (
    <FormControl component="fieldset" >
      <FormLabel component="legend">{label}</FormLabel>
      <RadioGroup
        name={label.toLocaleLowerCase().replace(" ", "_")}
        value={selectedValue?.toString() ?? ''}
        onChange={handleChange}
        row
      >
        {options.map((option) => (
          <FormControlLabel
            key={option}
            value={option}
            control={<Radio size="small"/>}
            label={option}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};

export default BrandSelector;
