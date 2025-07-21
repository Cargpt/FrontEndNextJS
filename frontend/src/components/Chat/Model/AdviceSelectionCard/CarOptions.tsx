"use client";

import React, { FC, useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  bodyOptions,
  brandOptions,
  budgetOptions,
  fuelAdviceOptions,
  transmissionAdviceOptions,
} from "@/utils/AdivseSectionAtom";
import AdviceSelectionBody from "./AdviceSelectionBody";
import AdviceSelectionFuel from "./AdviceSelectionFuel";
import AdviceSelectionBrand from "./AdviceSelectionBrand";
import AdviceSelectionTransmission from "./AdviceSelectionTransmission";
import { useChats } from "@/Context/ChatContext";
import { getUpperLimitInRupees } from "@/utils/services";

interface AdviceSelectionCardProps {
  options: string[];
  label: string;
  h1: string;
  onclick: () => void;
}
const CarModel: FC<AdviceSelectionCardProps> = ({
  options,
  label,
  h1,
  onclick,
}) => {
  const [selections, setSelections] = useState<{
    [key: string]: string | null;
  }>({
    value: null,
  });

  const { updateFilter, filter, setMessages } = useChats();
  const [isDisable, setIsDisable] = useState<boolean>(false);
  const handleSelect = (type: string, value: string) => {
    const updated = { [type]: value };
    setSelections(updated);
    if (updated[type]) {
      if (label === "brand") {
        updateFilter("brand_name", value);
      } else {
        updateFilter(label, value);
      }
    }
  };

  useEffect(() => {
    setSelections({ [label]: options[0] });
    if (options[0]) {
    }
    if (label === "budget") {
      const upperLimit = getUpperLimitInRupees(options[0].toString());
      if (upperLimit) {
        updateFilter(label, upperLimit);
      }
    } else {
      if (label === "brand") {
        updateFilter("brand_name", options[0]);
      } else {
        updateFilter(label, options[0]);
      }
    }
  }, []);

  const handleNext = () => {
    onclick();
    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        message: filter,
        render: "selectedFilter",
        sender: "user",
      },
    ]);
    setIsDisable(true);
  };

  console.log("f", filter)
  return (
    <Card
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        border: "none",
        borderBottom: "none",
        boxShadow: "none",
      }}
    >
      <CardContent
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          border: "none",
          borderBottom: "none",
          boxShadow: "none",
        }}
      >
        <Typography
          variant="body2"
          component="p"
          sx={{ cursor: "pointer", mb: 2 }}
        >
          {h1}
        </Typography>

        <Typography
          variant="body2"
          component="p"
          sx={{ fontWeight: 700, mb: 1, textTransform: "capitalize" }}
        >
          {label}
        </Typography>

        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
          <InputLabel id="brand-label">{label}</InputLabel>
          <Select
            labelId="brand-label"
            value={selections[label] ?? ""}
            label="Brand"
            onChange={(e) => handleSelect(label, e.target.value)}
          >
            {options.map((option: string, idx: number) => (
              <MenuItem key={idx} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <div
          style={{
            display: "flex",
            justifyContent: "end",
            justifyItems: "center",
          }}
        >
          <Button
            disabled={isDisable}
            onClick={handleNext}
            variant="contained"
            color="primary"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Button>
        </div>
        
      </CardContent>
    </Card>
  );
};

export default CarModel;
