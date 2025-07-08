import React, { useState, useEffect } from "react";
import {
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Typography,
} from "@mui/material";
import {
  getUpperLimitInRupees,
  Priorities,
  transmissionTypes,
} from "@/utils/services";

const BrandSelector: React.FC<BrandSelectorProps> = ({
  label,
  options,
  defaultValue,
  onChange,
  onChnageFilter,
}) => {
  const [selectedValue, setSelectedValue] = useState<number | string | null>(
    defaultValue ?? null
  );

  useEffect(() => {
    if (defaultValue !== undefined) {
      setSelectedValue(defaultValue);
    }
  }, [defaultValue]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setSelectedValue(newValue);
    if (event.target.name === "budget") {
      onChange?.(event.target.name, Number(getUpperLimitInRupees(newValue)));
    } else {
      onChange?.(
        event.target.name,
        isNaN(Number(newValue)) ? newValue : Number(newValue)
      );
    }
  };

  useEffect(() => {
    if (label.toLowerCase().replace(/\s+/g, "_") === "budget") {
      onChange?.(
        label.toLowerCase().replace(/\s+/g, "_"),
        Number(getUpperLimitInRupees(options[0]))
      );
    } else {
      onChange?.(
        label.toLowerCase().replace(/\s+/g, "_"),
        isNaN(Number(options[0]))
          ? MakePriority(options)
          : Number(MakePriority(options))
      );
    }

    setSelectedValue(MakePriority(options));
  }, [options]);

  const MakePriority = (options: any) => {
    return Priorities.find((item) => options.includes(item)) ?? options[0];
  };

  const onChoose = (event: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = event.target;

    console.log("name and Valus", name, value);
    handleChange(event);
    if (name === "transmission_type") {
      value = transmissionTypes[value];
    }
    if (name !== "budget") {
      onChnageFilter(name, value);
    }
  };

  return (
    <FormControl component="fieldset" fullWidth>
      <FormLabel component="legend" sx={{fontSize: "14px", fontWeight: 600}}>{label}</FormLabel>
      <RadioGroup
        name={label.toLowerCase().replace(/\s+/g, "_")}
        value={selectedValue?.toString() ?? ""}
        onChange={onChoose}
        sx={{
          display: "flex",
          flexDirection: "row", 
          flexWrap: "wrap",
          gap: 1, 
        }}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option}
            value={option}
            control={<Radio size="small" />}
            label={
              <Typography fontSize={13} fontWeight={500}>
                {option}
              </Typography>
            }
            sx={{
              flex: "1 1 auto",
              minWidth: "fit-content",
            }}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};

export default BrandSelector;
