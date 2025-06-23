"use client";

import React, { useEffect, useState } from "react";
import { Button, Card, CardContent, Typography, Stack } from "@mui/material";
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

const AdviceSelectionCard = () => {
  const [selections, setSelections] = useState<{
    budget: string | null;
    fuel: string | null;
    body: string | null;
    transmission: string | null;
    brand: string | null;
  }>({
    budget: null,
    fuel: null,
    body: null,
    transmission: null,
    brand: null,
  });

  useEffect(() => {
    const savedSelections = localStorage.getItem("carAdviceSelections");
    if (savedSelections) {
      setSelections(JSON.parse(savedSelections));
    }
  }, []);

  const handleSelect = (type: keyof typeof selections, value: string) => {
    const updated = { ...selections, [type]: value };
    setSelections(updated);
    localStorage.setItem("carAdviceSelections", JSON.stringify(updated));
    console.log("Updated Selections:", updated);
  };





  console.log("Current Selections:", selections);
  return (
    <Card>
      <CardContent
        style={{ display: "flex", flexDirection: "column", gap: "5px" }}
      >
        <Typography
          variant="body2"
          component="p"
          sx={{ cursor: "pointer", mb: 2 }}
        >
          Thank you for letting me help. I will provide you with all the car
          information you need. Tell me your requirements:
        </Typography>

        <Typography
          variant="body2"
          component="p"
          sx={{ fontWeight: 700, mb: 1 }}
        >
          Budget
        </Typography>

        <Stack direction="row" flexWrap="wrap" gap={1}>
          {budgetOptions.map((budget) => (
            <Button
              key={budget}
              variant={selections.budget === budget ? "contained" : "outlined"}
              onClick={() => handleSelect("budget", budget)}
              sx={{
                backgroundColor:
                  selections.budget === budget ? "#d3e3ff" : "inherit",
                color: selections.budget === budget ? "#000" : "inherit",
                borderRadius: "5px",
                textTransform: "none",
                border: "none",
              }}
            >
              {budget}
            </Button>
          ))}
        </Stack>
        <div
          style={{
            display: "flex",
            justifyContent: "end",
            justifyItems: "center",
          }}
        >
          <Button variant="contained" color="primary" type="button">
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
        {/* <AdviceSelectionBody
          selections={selections}
          handleSelect={handleSelect}
        />
        <AdviceSelectionFuel
          selections={selections}
          handleSelect={handleSelect}
        />
        <AdviceSelectionTransmission
          selections={selections}
          handleSelect={handleSelect}
        />
        <AdviceSelectionBrand
          selections={selections}
          handleSelect={handleSelect}
        /> */}
      </CardContent>
    </Card>
  );
};

export default AdviceSelectionCard;
