import { Box, Typography } from "@mui/material";
import React from "react";

type Props = {
  activeItem: string;
  setActiveItem: (item: string) => void;
  carDetails: any;
};

const ScoreLeftPanel = ({ activeItem, setActiveItem, carDetails }: Props) => {
  const sectionKeyMap: Record<string, string> = {
    Engine: "Engine",
    Interior: "Interior",
    Exterior: "EXTERIOR",
    Entertainment: "ENTERTAINMENTANDCONNECT",
    Safety: "Safety",
    Luxury: "Luxury",
    "Driver Display": "DRIVERDISPLAY",
    "Parking Support": "PARKINGSUPPORT",
    Automations: "AutomationsID",
  };

  const items = [
    "Engine",
    "Interior",
    "Exterior",
    "Entertainment",
    "Safety",
    "Luxury",
    "Driver Display",
    "Parking Support",
    "Automations",
  ].filter((item) => {
    if (!carDetails) {
      return false;
    }
    const apiKey = sectionKeyMap[item];
    const hasData =
      carDetails[apiKey] && Object.keys(carDetails[apiKey]).length > 0;
    return hasData;
  });

  return (
    <Box
      sx={{
        width: {
          xs: "100%",
          md: "30%",
        },
        backgroundColor: "#f5f5f5",
        borderRight: {
          xs: "none",
          md: "1px solid #ddd",
        },
        borderBottom: {
          xs: "1px solid #ddd",
          md: "none",
        },
        p: 2,
        height: "100%",
        overflowY: "auto",
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#bbb",
          borderRadius: "3px",
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "#f0f0f0",
        },
        scrollbarWidth: "thin",
        scrollbarColor: "#bbb #f0f0f0",
      }}
    >
      {!carDetails ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", mt: 4 }}
        >
          Loading sections...
        </Typography>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {items.map((item, index) => {
            const isActive = item === activeItem;

            return (
              <li
                key={index}
                onClick={() => setActiveItem(item)}
                style={{
                  padding: "12px",
                  cursor: "pointer",
                  color: isActive ? "#000" : "#555",
                  borderLeft: isActive
                    ? "4px solid #1976d2"
                    : "4px solid transparent",
                  transition: "all 0.3s ease",
                  fontSize: ".9rem",
                  backgroundColor: isActive ? "#e3f2fd" : "transparent",
                }}
              >
                <Typography variant="body1">{item}</Typography>
              </li>
            );
          })}
        </ul>
      )}
    </Box>
  );
};

export default ScoreLeftPanel;
