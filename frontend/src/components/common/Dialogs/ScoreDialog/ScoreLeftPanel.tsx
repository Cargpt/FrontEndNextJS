import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import React from "react";

type Props = {
  activeItem: string;
  setActiveItem: (item: string) => void;
  carDetails: any;
};

const ScoreLeftPanel = ({ activeItem, setActiveItem, carDetails }: Props) => {
  const theme = useTheme();

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

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
          xs: "30%",
          sm: "40%",
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
                key={item}
                onClick={() => setActiveItem(item)}
                style={{
                  cursor: "pointer",
                  color: isActive ? "#000" : "#555",
                  borderBottom: isActive
                    ? "1px solid #1976d2"
                    : "1px solid transparent",
                  transition: "all 0.3s ease",
                  fontSize: ".9rem",
                  backgroundColor: isActive ? "#e3f2fd" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  flexDirection: isSmallScreen ? "column" : "row",
                  padding: isSmallScreen ? "8px 0" : "12px",
                  gap: isSmallScreen ? "4px" : "12px",
                  textAlign: isSmallScreen ? "center" : "left",
                }}
              >
                <img
                  src={`/assets/icons/${index}${index === 1 ? ".svg" : ".png"}`}
                  width={20}
                  height={20}
                  style={{
                    marginBottom: isSmallScreen ? "4px" : 0,
                  }}
                />
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: {
                      xs: "11.2px",
                      sm: "0.9rem",
                    },
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {item}
                  {(() => {
                    const apiKey = sectionKeyMap[item];
                    const sectionData = carDetails?.[apiKey];
                    if (sectionData && typeof sectionData === "object") {
                      const totalFeatures = Object.keys(sectionData).length;
                      const activeFeatures = Object.values(sectionData).filter(
                        (v) => v === 1
                      ).length;
                      return (
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            marginLeft: 1,
                            color: "text.secondary",
                            fontSize: {
                              xs: "10px",
                              sm: "0.75rem",
                            },
                            display: {
                              xs: "none", // 👈 Hides on extra-small screens (xs)
                              sm: "inline", // 👈 Shows from small screens and up
                            },
                          }}
                        >
                          ({activeFeatures}/{totalFeatures})
                        </Typography>
                      );
                    }
                    return null;
                  })()}
                </Typography>
              </li>
            );
          })}
        </ul>
      )}
    </Box>
  );
};

export default ScoreLeftPanel;
