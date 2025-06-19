import { fuelAdviceOptions } from "@/utils/AdivseSectionAtom";
import { Button, Stack, Typography } from "@mui/material";
import React from "react";

interface Props {
  selections: {
    fuel: string | null;
  };
  handleSelect: (type: "fuel", value: string) => void;
}

const AdviceSelectionFuel: React.FC<Props> = ({ selections, handleSelect }) => {
  return (
    <>
      <Typography variant="body2" component="p" sx={{ fontWeight: 700, mb: 1 }}>
        Fuel
      </Typography>
      <Stack gap={1}>
        {fuelAdviceOptions.map((fuelAdviceOption) => (
          <div
            key={fuelAdviceOption}
            onClick={() => handleSelect("fuel", fuelAdviceOption)}
            style={{
              backgroundColor:
                selections.fuel === fuelAdviceOption ? "#d3e3ff" : "inherit",
              color: selections.fuel === fuelAdviceOption ? "#000" : "inherit",
              borderRadius: "5px",
              textTransform: "none",
              border: "none",
              padding: "8px 12px",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <Typography variant="body2" component="p">
              {fuelAdviceOption}
            </Typography>
          </div>
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
    </>
  );
};

export default AdviceSelectionFuel;
