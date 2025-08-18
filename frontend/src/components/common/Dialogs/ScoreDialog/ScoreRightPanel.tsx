import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Chip,
} from "@mui/material";
import { CheckCircle, Cancel, Info } from "@mui/icons-material";
import { useColorMode } from "@/Context/ColorModeContext";

type Props = {
  activeItem: string;
  carDetails: any;
  loading: boolean;
};

const ScoreRightPanel = ({ activeItem, carDetails, loading }: Props) => {
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

  const formatFieldName = (key: string): string => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const renderValue = (key: string, value: any) => {
    if (typeof value === "boolean" || value === 0 || value === 1) {
      const boolValue = Boolean(value);
      return (
        <Box display="flex" alignItems="center" gap={1}>
          {boolValue ? (
            <CheckCircle color="success" fontSize="small" />
          ) : (
            <Cancel color="error" fontSize="small" />
          )}
          <Typography
            variant="body2"
            color={boolValue ? "success.main" : "error.main"}
          >
            {boolValue ? "Available" : "Not Available"}
          </Typography>
        </Box>
      );
    }

    if (typeof value === "string" || typeof value === "number") {
      return (
        <Box display="flex" alignItems="center" gap={1}>
          <Info color="primary" fontSize="small" />
          <Typography variant="body2" color="primary.main" fontWeight="medium">
            {value}
          </Typography>
        </Box>
      );
    }

    return (
      <Typography variant="body2" color="text.secondary">
        {String(value)}
      </Typography>
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          width: { xs: "100%", md: "70%" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!carDetails) {
    return (
      <Box
        sx={{
          width: { xs: "100%", md: "70%" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No car details available
        </Typography>
      </Box>
    );
  }

  const apiKey = sectionKeyMap[activeItem];
  const sectionData = carDetails[apiKey];

  if (!sectionData) {
    return (
      <Box
        sx={{
          width: { xs: "100%", md: "70%" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No data available for {activeItem}
        </Typography>
      </Box>
    );
  }

  const dataEntries = Object.entries(sectionData);

  const availableEntries = dataEntries.filter(([_, value]) =>
    typeof value === "boolean" || value === 0 || value === 1
      ? Boolean(value)
      : value !== null && value !== "" && value !== undefined
  );

  const notAvailableEntries = dataEntries.filter(([_, value]) =>
    typeof value === "boolean" || value === 0 || value === 1
      ? !Boolean(value)
      : value === null || value === "" || value === undefined
  );
const {mode}=useColorMode()
  return (
    <Box
      sx={{
        width: { xs: "100%", md: "70%" },
        p: { xs: 2, md: 3 },
        overflowY: "auto",
        height: "100%",
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
      {/* Section Header */}

      {/* Available Features */}
      {availableEntries.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="success.main" sx={{ mb: 2 }}>
            Available Features
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr 1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr",
                lg: "1fr 1fr 1fr",
              },
              gap: 2,
            }}
          >
            {availableEntries.map(([key, value], index) => (
              <Card
                key={`available-${index}`}
                sx={{
                  height: "auto",
                  minHeight: "120px",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-2px)",
                  },
                  background: mode=="dark"? "": "linear-gradient(135deg, #e6f1fc, #fff)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  border: mode=="dark"? "":"1px solid #e0e0e0",
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    flex: 1,
                    p: 2,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    component="h6"
                    sx={{
                      mb: 2,
                      fontWeight: "600",
                      color: "text.primary",
                      lineHeight: 1.3,
                      fontSize: "0.9rem",
                    }}
                  >
                    {formatFieldName(key)}
                  </Typography>
                  <Box sx={{ mt: "auto" }}>{renderValue(key, value)}</Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* Not Available Features */}
      {notAvailableEntries.length > 0 && (
        <Box>
          <Typography variant="h6" color="error.main" sx={{ mb: 2 }}>
            Not Available Features
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr 1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr",
                lg: "1fr 1fr 1fr",
              },
              gap: 2,
            }}
          >
            {notAvailableEntries.map(([key, value], index) => (
              <Card
                key={`not-available-${index}`}
                sx={{
                  height: "auto",
                  minHeight: "120px",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-2px)",
                  },
                  background: mode==="dark" ?"": "linear-gradient(135deg, #e6f1fc, #fff)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  border: mode==="dark"? "": "1px solid #e0e0e0",
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    flex: 1,
                    p: 2,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    component="h6"
                    sx={{
                      mb: 2,
                      fontWeight: "600",
                      color: "text.primary",
                      lineHeight: 1.3,
                      fontSize: "0.9rem",
                    }}
                  >
                    {formatFieldName(key)}
                  </Typography>
                  <Box sx={{ mt: "auto" }}>{renderValue(key, value)}</Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ScoreRightPanel;
