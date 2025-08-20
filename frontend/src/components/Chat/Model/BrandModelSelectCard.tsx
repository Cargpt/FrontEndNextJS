"use client";
import React, { ChangeEvent, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  SelectChangeEvent,
  Button,
  useTheme,
  IconButton,
  InputAdornment, // Add InputAdornment
} from "@mui/material";
import { axiosInstance1 } from "@/utils/axiosInstance";
import {
  BODYNAMES,
  BUDGETS,
  COMBINEOPTIONS,
  DEFAULTSEARCHPARAMS,
  FUELTYPE,
  getUpperLimitInRupees,
  SEATCAPACITIES,
  TRANSMISSION,
} from "@/utils/services";
import { useChats } from "@/Context/ChatContext";
import { useBotType } from "@/Context/BotTypeContext";

// Type-safe options

type BrandModelSelectCardProps = {
  handleUserMessage: (message: any) => void;
  brands: Brand[] | any;
  onPersistState?: (partial: any) => void;
  initialBrand?: Brand | null;
  initialModel?: ModelProps | null;
};

import { useSnackbar } from "@/Context/SnackbarContext";
import BudgetSelector from "./InlineRadio";
import { useColorMode } from "@/Context/ColorModeContext";
import {
  DifferenceRounded,
  DirectionsCarFilledOutlined,
} from "@mui/icons-material";
import DirectionsCarFilledIcon from "@mui/icons-material/DirectionsCarFilled";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"; // Import the new icon
import SettingsIcon from "@mui/icons-material/Settings"; // Import SettingsIcon
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation"; // Fuel Type
import EngineeringIcon from "@mui/icons-material/Engineering"; // Transmission Type
import EventSeatIcon from "@mui/icons-material/EventSeat"; // Seating Capacity
import DriveEtaIcon from "@mui/icons-material/DriveEta"; // Body Type
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"; // Budget
import StyleIcon from "@mui/icons-material/Style"; // Icon for Body Type
import SpeedIcon from "@mui/icons-material/Speed"; // Import SpeedIcon
import AutoAwesome from "@mui/icons-material/AutoAwesome"; // Import AutoAwesome icon

const BrandModelSelectCard: React.FC<BrandModelSelectCardProps> = ({
  handleUserMessage,
  brands,
  onPersistState,
  initialBrand = null,
  initialModel = null,
}) => {
  const [brand, setBrand] = useState<Brand>(initialBrand ?? brands[0]);

  const [model, setModel] = useState<ModelProps | null>(initialModel);
  const [models, setModels] = useState<ModelProps[]>([]);
  const [carFeatures, setCarFeatures] = useState<CarFeaturesProps>({
    FuelType: ["petrol", "diesel", "CNG", "electric"],
    TransmissionType: ["manual", "automatic"],
    Seats: [2, 4, 5, 7],
    budgetTypes: ["0-5L", "5-10L", "10-15L", "15-20L", "20-25L", "25-30L"],
    BodyNames: ["suv", "sedan", "hatchback", "coupe", "convertible"],
  });

  const [SeatCaps, setSeatCaps] = useState<string[]>(SEATCAPACITIES);
  const [bodyTypes, setBodyTypes] = useState<string[]>(BODYNAMES);
  const [FuelTypes, setFuelTypes] = useState<string[]>(FUELTYPE);
  const [TransmissionTypes, setTransmissionType] =
    useState<string[]>(TRANSMISSION);
  const [bugetTypes, setBugetTypes] = useState<string[]>(BUDGETS);

  const [currentFuelType, setCurrentFuelType] = useState<string>("Petrol");
  const [currentTransmissionType, setCurrentTransmissionType] =
    useState<string>("MT");
  const [currentBudget, setCurrentBudget] = useState<string>("10-15L");
  const [currentSeatCap, setCurrentSeatCap] = useState<number>(5);
  const [currentBodyType, setCurrentBodyType] = useState<string>("suv");

  const [disableBtn, setDisableBtn] = useState<boolean>(false);
  const [carFilter, setCarFilter] = useState<CarFilter>(DEFAULTSEARCHPARAMS);

  const [isBrandChange, setisBrandChange] = useState<boolean>(false);

  const { setCars } = useChats();
  const { messages } = useChats();
  const isFromHistory = Boolean(
    (messages[messages.length - 1] as any)?.fromHistory
  );

  const searchParams: any = messages[messages.length - 1]?.searchParam;

  const fetchBrandModes = async () => {
    if (
      messages[messages.length - 1]?.message?.models?.length > 0 &&
      !isBrandChange
    ) {
      const m = messages[messages.length - 1].message?.models;
      setModel(m[0]);
      setModels(m);
      return;
    }
    // else if (searchParams) {
    //   let payload: any = {};
    //   payload["brand_name"] = brand.BrandName;
    //   payload = { ...payload, ...searchParams };

    //   const data = await axiosInstance1.post("/api/cargpt/search/", payload);

    //   setModels(data?.models || []);
    //   setModel(data?.models[0] || null);
    // }
    else if (brand?.BrandID) {
      const payload = {
        brand_id: brand?.BrandID,
      };
      try {
        const data = await axiosInstance1.post("/api/cargpt/models/", payload);

        setModels(data?.models || []);
        setModel(data?.models?.[0] || null);
        setisBrandChange(false);
      } catch (error) {}
    }
  };

  // Initialize brand/model from persisted state if available
  useEffect(() => {
    if (initialBrand) {
      setBrand(initialBrand);
    } else if (brands && brands.length > 0 && !brand) {
      setBrand(brands[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBrand, brands]);

  useEffect(() => {
    if (initialModel) {
      setModel(initialModel);
    }
  }, [initialModel]);

  const fetchCarFeatures = async () => {
    const payload = {
      brand_name: brand?.BrandID,
      modle_name: model?.ModelID,
    };
    try {
      const response = await axiosInstance1.post(
        "/api/cargpt/brand-model-parameters/",
        payload
      );
      const data = response?.data;
      const updateCarFeatures: CarFeaturesProps = {
        ...carFeatures,
        FuelType: data?.data?.FuelType,
      };

      setFuelTypes([...data?.FuelType]);

      function prioritizeFuels(fuels: any) {
        const priority: any = {
          Petrol: 1,
          Diesel: 2,
          CNG: 3,
          Electric: 4,
        };

        return fuels
          .filter((fuel: any) => priority.hasOwnProperty(fuel)) // remove "Hybrid" or others
          .sort((a: any, b: any) => priority[a] - priority[b]);
      }

      //  When user choose best  car under the fuel type
      const defaultFuel = COMBINEOPTIONS.includes(searchParams)
        ? searchParams
        : currentFuelType;
      if (data.FuelType && !data.FuelType.includes(defaultFuel)) {
        setCurrentFuelType(prioritizeFuels(data.FuelType)[0]);
        setCarFilter((prev) => ({
          ...prev,
          fuel_type: prioritizeFuels(data.FuelType)[0],
        }));

        fetchBrandModelWithFuel(prioritizeFuels(data.FuelType)[0]);
      } else {
        setCurrentFuelType(defaultFuel);

        setCarFilter((prev) => ({
          ...prev,
          fuel_type: defaultFuel,
        }));

        fetchBrandModelWithFuel(defaultFuel);
      }
    } catch (error) {}
  };

  const { botType } = useBotType();

  useEffect(() => {
    if (brand) {
      setCarFilter({ ...carFilter, brand_name: brand.BrandName });

      fetchBrandModes();
    }
  }, [brand]);

  useEffect(() => {
    if (model) {
      setCarFilter({ ...carFilter, model_name: model.ModelName });

      fetchCarFeatures();
    }
    return () => {};
  }, [model]);

  const { showSnackbar } = useSnackbar();
  const [isDisable, setIsDisable] = useState<boolean>(false);

  const fetchDataBasedOnParameters = async () => {
    setDisableBtn(true);
    try {
      const payload = { ...carFilter };
      const data = await axiosInstance1.post(
        "/api/cargpt/cars-for-prameter/",
        payload
      );
      if (data?.data.length === 0) {
        setDisableBtn(false);
        showSnackbar("No cars found for the selected parameters.", {
          horizontal: "center",
          vertical: "bottom",
        });

        return false;
      }

      setCars((prev: any) => [
        ...prev,
        { [`${brand?.BrandName}_${model?.ModelName}`]: data?.data },
      ]);

      handleUserMessage({ ...payload });

      setIsDisable(true); // Disable input fields
      // The disableBtn remains true, keeping the button disabled after successful submission.
    } catch (error) {
      setDisableBtn(false); // Re-enable button on error
    }
  };

  const fetchParametersWithSeat = async (
    seat: number,
    transmission_type?: string,
    fuel_type?: string
  ) => {
    try {
      const payload = {
        brand_name: brand?.BrandID,
        modle_name: model?.ModelID,
        fuel_type: fuel_type,
        transmission_type: transmission_type,
        seats: seat,
      };
      const response = await axiosInstance1.post(
        "/api/cargpt/brand-model-parameters/",
        payload
      );

      // DECRYPT the encrypted data
      const data = response?.data;

      const bugetTypes_length = bugetTypes.length;
      for (let i = 0; i < bugetTypes_length; i++) {
        bugetTypes.pop();
      }

      setBugetTypes([...bugetTypes]);

      for (let f = 0; f < data["budgetTypes"].length; f++) {
        bugetTypes.push(data["budgetTypes"][f]);
      }
      setBugetTypes([...bugetTypes]);

      if (data.budgetTypes && !data.budgetTypes.includes(currentBudget)) {
        setCurrentBudget(data.budgetTypes[0]);
        const bgt = getUpperLimitInRupees(data.budgetTypes[0]);
        if (bgt) {
          setCarFilter((prev) => ({ ...prev, budget: bgt }));
        }
      }

      const bodytype_length = bodyTypes.length;
      for (let i = 0; i < bodytype_length; i++) {
        bodyTypes.pop();
      }
      setBodyTypes([...bodyTypes]);

      for (let f = 0; f < data["BodyNames"].length; f++) {
        bodyTypes.push(data["BodyNames"][f]);
      }
      setBodyTypes([...bodyTypes]);

      const defaultFuel = COMBINEOPTIONS.includes(searchParams)
        ? searchParams
        : currentBodyType;

      if (data.BodyNames && !data.BodyNames.includes(defaultFuel)) {
        setCurrentBodyType(data.BodyNames[0]);
        setCarFilter((prev) => ({ ...prev, body_type: data.BodyNames[0] }));
      } else {
        setCurrentBodyType(defaultFuel);
        setCarFilter((prev) => ({ ...prev, body_type: defaultFuel }));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchParametersWithBrandModelFuelTransmission = async (
    transmission_type: string,
    fuel_type?: string
  ) => {
    try {
      const payload = {
        brand_name: brand?.BrandID,
        modle_name: model?.ModelID,
        fuel_type: fuel_type,
        transmission_type: transmission_type,
      };
      const response = await axiosInstance1.post(
        "/api/cargpt/brand-model-parameters/",
        payload
      );

      // DECRYPT the encrypted data
      const data = response?.data;
      console.log("FuelType :" + data["FuelType"]);
      console.log("TransmissionType :" + data["TransmissionType"]);
      console.log("Seats :" + data["Seats"]);
      console.log("BodyNames :" + data["BodyNames"]);
      console.log("FuelTypes length :" + FuelTypes.length);
      const SeatCaps_length = SeatCaps?.length;
      for (let i = 0; i < SeatCaps_length; i++) {
        SeatCaps.pop();
      }
      setSeatCaps([...SeatCaps]);

      for (let f = 0; f < data["Seats"].length; f++) {
        SeatCaps.push(data["Seats"][f]);
      }
      setSeatCaps([...SeatCaps]);

      if (data.Seats && !data.Seats.includes(currentSeatCap)) {
        setCurrentSeatCap(data.Seats[0]);
        setCarFilter((prev) => ({ ...prev, seat_capacity: data.Seats[0] }));

        fetchParametersWithSeat(data.Seats[0], transmission_type, fuel_type);
      } else {
        setCurrentSeatCap(data.Seats[0]);
        setCarFilter((prev) => ({ ...prev, seat_capacity: data.Seats[0] }));

        fetchParametersWithSeat(data.Seats[0], transmission_type, fuel_type);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchBrandModelWithFuel = async (fuel_type: string) => {
    try {
      const payload = {
        brand_name: brand?.BrandID,
        modle_name: model?.ModelID,
        fuel_type,
      };
      const response = await axiosInstance1.post(
        "/api/cargpt/brand-model-parameters/",
        payload
      );
      const data = response?.data;
      const transmission_length = TransmissionTypes.length;
      for (let i = 0; i < transmission_length; i++) {
        TransmissionTypes.pop();
      }
      setTransmissionType([...TransmissionTypes]);

      for (let f = 0; f < data["TransmissionType"].length; f++) {
        TransmissionTypes.push(data["TransmissionType"][f]);
      }
      setTransmissionType([...TransmissionTypes]);

      const defaultTransmisssionType = COMBINEOPTIONS.includes(searchParams)
        ? searchParams
        : currentTransmissionType;

      if (
        data.TransmissionType &&
        !data.TransmissionType.includes(defaultTransmisssionType)
      ) {
        setCurrentTransmissionType(data.TransmissionType[0]);
        setCarFilter((prev) => ({
          ...prev,
          transmission_type: data.TransmissionType[0],
        }));

        fetchParametersWithBrandModelFuelTransmission(
          data.TransmissionType[0],
          fuel_type
        );
      } else {
        setCurrentTransmissionType(defaultTransmisssionType);
        setCarFilter((prev) => ({
          ...prev,
          transmission_type: defaultTransmisssionType,
        }));
        fetchParametersWithBrandModelFuelTransmission(
          defaultTransmisssionType,
          fuel_type
        );
      }
    } catch (error) {}
  };

  const handleFuelChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentFuelType(e.target.value);
    setCarFilter((prev) => ({ ...prev, fuel_type: e.target.value }));
    fetchBrandModelWithFuel(e.target.value);
  };

  const handleTransmissionChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentTransmissionType(e.target.value);
    setCarFilter((prev) => ({ ...prev, transmission_type: e.target.value }));
    fetchParametersWithBrandModelFuelTransmission(
      e.target.value,
      currentFuelType
    );
  };

  const handleBudgetChange = (e: ChangeEvent<HTMLInputElement>) => {
    const bgt = getUpperLimitInRupees(e.target.value);
    if (bgt) {
      setCarFilter((prev) => ({ ...prev, budget: bgt }));
    }
    setCurrentBudget(e.target.value);
    // If you want to trigger an API here, add the call below
    // fetchDataBasedOnParameters();
  };

  const handleSeatCapChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newSeatCapacity = Number(e.target.value);
    setCurrentSeatCap(newSeatCapacity);
    setCarFilter((prev) => ({
      ...prev,
      seat_capacity: newSeatCapacity,
    }));
    fetchParametersWithSeat(
      newSeatCapacity,
      currentTransmissionType,
      currentFuelType
    );
  };

  const handleBodyTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCarFilter((prev) => ({ ...prev, body_type: e.target.value }));
    setCurrentBodyType(e.target.value);
    // If you want to trigger an API here, add the call below
    // fetchDataBasedOnParameters();
  };

  const theme = useTheme();
  const { mode } = useColorMode();
  return (
    <Card
      sx={{
        minWidth: "280px", // Reduced minWidth

        px: 0.5,
        pt: 0, // Reduced padding

        boxShadow: "none",
        border: "none",
        borderBottom: "none",
        backgroundColor: "transparent",
        backgroundImage: "none",
        borderRadius: "16px",
      }}
    >
      <CardContent sx={{ py: 0 }}>
        {" "}
        {/* Further reduced padding-bottom */}
        <Box sx={{ p: 2, pb: 0, pt: 0 }}>
          {" "}
          {/* Padding for the entire card content, reduced top padding */}
          <Typography
            variant="h6"
            sx={{ display: "flex", alignItems: "center", gap: 1, pb: 0 }}
          >
            <Box
              sx={{
                background: mode === "dark" ? "#ffffff" : "#0062ee",
                borderRadius: { xs: "6px", sm: "8px" },
                width: { xs: 24, sm: 28 },
                height: { xs: 24, sm: 28 },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  mode === "dark"
                    ? "0 2px 8px rgba(255, 255, 255, 0.2)"
                    : "0 2px 8px rgba(0, 98, 238, 0.3)",
              }}
            >
              <AutoAwesome
                sx={{
                  color: mode === "dark" ? "#000000" : "white",
                  fontSize: { xs: 12, sm: 14 },
                }}
              />
            </Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", fontSize: "1.1rem", mt: 0 }}
            >
              Find Your Car
            </Typography>
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, ml: 4 }}
          >
            {" "}
            {/* Subtitle moved here with ml for indentation */}
            Pick your preferences — we'll match the best options
          </Typography>
          <Box
            sx={{
              display: "flex",
              // REMOVED: flexWrap: "wrap",
              gap: 2, // Increased gap for better spacing
              flexDirection: "row",
              mt: 3,
              justifyContent: "space-between", // Distribute space between items
              alignItems: "center", // Align items vertically in the center
            }}
          >
            <FormControl
              fullWidth
              size="small"
              sx={{
                flex: 1, // Make it take equal space
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  background:
                    mode === "dark"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 98, 238, 0.03)",
                  border: "none",
                  outline: "none",
                  minHeight: { xs: "32px", sm: "36px" },
                  "&:hover": {
                    background:
                      mode === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 98, 238, 0.03)",
                  },
                  "&.Mui-focused": {
                    background:
                      mode === "dark"
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(0, 98, 238, 0.08)",
                    boxShadow:
                      mode === "dark"
                        ? "0 0 0 4px rgba(255, 255, 255, 0.1)"
                        : "0 0 0 4px rgba(0, 98, 238, 0.1)",
                  },
                  "& fieldset": {
                    border: "none",
                  },
                },
                "& .MuiInputLabel-root": {
                  color:
                    mode === "dark"
                      ? "rgba(255, 255, 255, 0.7)"
                      : "rgba(0, 0, 0, 0.6)",
                  fontWeight: 500,
                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                },
                "& .MuiSelect-select": {
                  fontSize: { xs: "0.75rem", sm: "0.8rem" },
                  fontWeight: 500,
                  color:
                    mode === "dark"
                      ? "rgba(255, 255, 255, 0.9)"
                      : "rgba(0, 0, 0, 0.8)",
                  py: { xs: 0.5, sm: 0.75 },
                },
              }}
            >
              <InputLabel id="brand-label">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <DirectionsCarFilledIcon
                    sx={{
                      fontSize: 20,
                      color: mode === "dark" ? "#ffffff" : "#0062ee",
                    }}
                  />
                  Brand
                </Box>
              </InputLabel>
              <Select
                disabled={isDisable || isFromHistory}
                labelId="brand-label"
                value={brand?.BrandID != null ? String(brand.BrandID) : ""}
                label="Brand"
                onChange={(e) => {
                  const nextBrandIdStr = String(e.target.value);
                  const selectedBrand = brands.find(
                    (b: Brand) => String(b.BrandID) === nextBrandIdStr
                  );
                  if (selectedBrand) {
                    setBrand(selectedBrand);
                    setisBrandChange(true);
                    onPersistState?.({ brand: selectedBrand });
                  }
                }}
                renderValue={() => brand?.BrandName ?? ""}
                // REMOVED: startAdornment={ // Add InputAdornment for icon
                //   <InputAdornment position="start">
                //     <DirectionsCarFilledOutlined />
                //   </InputAdornment>
                // }
                sx={{
                  fontSize: "15px",
                  "& .MuiSelect-select": {
                    fontSize: "15px",
                  },
                }}
              >
                {Array.isArray(brands) &&
                  brands?.map((brand: Brand, index: number) => (
                    <MenuItem
                      key={index}
                      value={String(brand.BrandID)}
                      sx={{
                        borderRadius: "8px",
                        margin: "4px 8px",
                        "&:hover": {
                          background:
                            mode === "dark"
                              ? "rgba(255, 255, 255, 0.1)"
                              : "rgba(0, 98, 238, 0.1)",
                        },
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        {brand.logo && (
                          <img
                            src={brand.logo}
                            alt={brand.BrandName}
                            style={{
                              width: 28,
                              height: 28,
                              objectFit: "contain",
                              borderRadius: "6px",
                            }}
                          />
                        )}
                        <Typography sx={{ fontWeight: 500 }}>
                          {brand.BrandName}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <FormControl
              fullWidth
              size="small"
              disabled={!brand || isFromHistory}
              sx={{
                flex: 1, // Make it take equal space
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  background:
                    mode === "dark"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 98, 238, 0.03)",
                  border: "none",
                  outline: "none",
                  minHeight: { xs: "32px", sm: "36px" },
                  "&:hover": {
                    background:
                      mode === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 98, 238, 0.03)",
                  },
                  "&.Mui-focused": {
                    background:
                      mode === "dark"
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(0, 98, 238, 0.08)",
                    boxShadow:
                      mode === "dark"
                        ? "0 0 0 4px rgba(255, 255, 255, 0.1)"
                        : "0 0 0 4px rgba(0, 98, 238, 0.1)",
                  },
                  "& fieldset": {
                    border: "none",
                  },
                },
                "& .MuiInputLabel-root": {
                  color:
                    mode === "dark"
                      ? "rgba(255, 255, 255, 0.7)"
                      : "rgba(0, 0, 0, 0.6)",
                  fontWeight: 500,
                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                },
                "& .MuiSelect-select": {
                  fontSize: { xs: "0.75rem", sm: "0.8rem" },
                  fontWeight: 500,
                  color:
                    mode === "dark"
                      ? "rgba(255, 255, 255, 0.9)"
                      : "rgba(0, 0, 0, 0.8)",
                  py: { xs: 0.5, sm: 0.75 },
                },
              }}
            >
              <InputLabel id="model-label">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <SpeedIcon
                    sx={{
                      fontSize: 20,
                      color: mode === "dark" ? "#ffffff" : "#0062ee",
                    }}
                  />
                  Model
                </Box>
              </InputLabel>
              <Select
                disabled={isDisable || isFromHistory}
                labelId="model-label"
                value={model?.ModelID != null ? String(model.ModelID) : ""}
                label="Model"
                onChange={(e) => {
                  const nextModelIdStr = String(e.target.value);
                  const selectedModel = models.find(
                    (m) => String(m.ModelID) === nextModelIdStr
                  );
                  if (selectedModel) {
                    setModel(selectedModel);
                    onPersistState?.({ model: selectedModel });
                  }
                }}
                // REMOVED: startAdornment={ // Add InputAdornment for icon
                //   <InputAdornment position="start">
                //     <SettingsIcon />
                //   </InputAdornment>
                // }
                sx={{
                  fontSize: "15px",
                  "& .MuiSelect-select": {
                    fontSize: "15px",
                  },
                }}
              >
                {models.map((model: ModelProps, index: number) => (
                  <MenuItem
                    key={index}
                    value={String(model.ModelID)}
                    sx={{
                      borderRadius: "8px",
                      margin: "4px 8px",
                      "&:hover": {
                        background: "rgba(102, 126, 234, 0.1)",
                      },
                    }}
                  >
                    <Typography sx={{ fontWeight: 500 }}>
                      {model.ModelName}
                    </Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1.5, // Increase spacing slightly
              mt: 3,
              flexDirection: {
                xs: "column",
                sm: "row",
              },
            }}
          >
            {/* Fuel Type */}
            <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: "30%" } }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <LocalGasStationIcon
                  sx={{
                    fontSize: 18,
                    color: mode === "dark" ? "#ffffff" : "#0062ee",
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Fuel Type
                </Typography>
              </Box>
              <BudgetSelector
                budgetTypes={FuelTypes}
                currentBudget={currentFuelType}
                handleBudgetChange={handleFuelChange}
                // REMOVED: icon={<LocalGasStationIcon sx={{ fontSize: 20 }} />} // Add icon prop
              />
            </Box>

            {/* Transmission Type */}
            <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: "30%" } }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <SettingsIcon
                  sx={{
                    fontSize: 18,
                    color: mode === "dark" ? "#ffffff" : "#0062ee",
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Transmission Type
                </Typography>
              </Box>
              <BudgetSelector
                budgetTypes={TransmissionTypes}
                currentBudget={currentTransmissionType}
                handleBudgetChange={handleTransmissionChange}
                // REMOVED: icon={<SettingsIcon sx={{ fontSize: 20 }} />} // Changed to SettingsIcon
              />
            </Box>

            {/* Seating Capacity */}
            <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: "30%" } }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <EventSeatIcon
                  sx={{
                    fontSize: 18,
                    color: mode === "dark" ? "#ffffff" : "#0062ee",
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Seating Capacity
                </Typography>
              </Box>
              <BudgetSelector
                budgetTypes={SeatCaps}
                currentBudget={currentSeatCap?.toString?.() ?? ""}
                handleBudgetChange={handleSeatCapChange}
                // REMOVED: icon={<EventSeatIcon sx={{ fontSize: 20 }} />} // Add icon prop
              />
            </Box>
          </Box>
          {/* Second Row: Body Type + Budget */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1.5,
              mt: 1,
              flexDirection: {
                xs: "column",
                sm: "row",
              },
            }}
          >
            {/* Body Type */}
            <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: "48%" } }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <StyleIcon
                  sx={{
                    fontSize: 18,
                    color: mode === "dark" ? "#ffffff" : "#0062ee",
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Body Type
                </Typography>
              </Box>
              <BudgetSelector
                budgetTypes={bodyTypes}
                currentBudget={currentBodyType?.toString?.() ?? ""}
                handleBudgetChange={handleBodyTypeChange}
                // REMOVED: icon={<DriveEtaIcon sx={{ fontSize: 20 }} />} // Add icon prop
              />
            </Box>

            {/* Budget */}
            <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: "48%" } }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <AccountBalanceWalletIcon
                  sx={{
                    fontSize: 18,
                    color: mode === "dark" ? "#ffffff" : "#0062ee",
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Budget
                </Typography>
              </Box>
              <BudgetSelector
                budgetTypes={bugetTypes}
                currentBudget={currentBudget?.toString?.() ?? ""}
                handleBudgetChange={handleBudgetChange}
                // REMOVED: icon={<AccountBalanceWalletIcon sx={{ fontSize: 20 }} />} // Add icon prop
              />
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "0.5rem", // Reduced margin-top to move it slightly up
              pb: 1,
            }}
          >
            <IconButton
              disabled={disableBtn || isDisable}
              color="primary"
              onClick={fetchDataBasedOnParameters}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: "white",
                width: 40, // Decreased width
                height: 40, // Decreased height
                borderRadius: "50%", // Make it circular
                marginRight: "1rem", // Added margin-right to move it slightly left
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
                "&.Mui-disabled": {
                  backgroundColor: theme.palette.action.disabledBackground, // Revert to default disabled background
                  color: theme.palette.action.disabled, // Revert to default disabled color
                },
              }}
            >
              <ArrowForwardIcon sx={{ fontSize: 20, mb: 0.5 }} />{" "}
              {/* Further adjusted font size */}
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BrandModelSelectCard;
