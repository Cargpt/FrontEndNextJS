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
} from "@mui/material";
import { axiosInstance1 } from "@/utils/axiosInstance";
import {
  BODYNAMES,
  BUDGETS,
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
};

import { useSnackbar } from "@/Context/SnackbarContext";
import BudgetSelector from "./InlineRadio";

const BrandModelSelectCard: React.FC<BrandModelSelectCardProps> = ({
  handleUserMessage,
  brands,
}) => {
  const [brand, setBrand] = useState<Brand>(brands[0]);

  const [model, setModel] = useState<ModelProps | null>(null);
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

  const { setCars } = useChats();

  const fetchBrandModes = async () => {
    const searchParams: any = messages[messages.length - 1]?.searchParam;

    if (messages[messages.length - 1].message?.models?.length > 0) {
      const m = messages[messages.length - 1].message?.models;
      setModel(m[0]);
      setModels(m);
    } else if (searchParams) {
      let payload: any = {};
      payload["brand_name"] = brand.BrandName;
      payload = { ...payload, ...searchParams };

      const data = await axiosInstance1.post("/api/cargpt/search/", payload);

      setModels(data?.models || []);
      setModel(data?.models[0] || null);
    } else {
      const payload = {
        brand_id: brand?.BrandID,
      };
      try {
        const data = await axiosInstance1.post("/api/cargpt/models/", payload);

        setModels(data?.models || []);
        setModel(data?.models[0] || null);
      } catch (error) {}
    }
  };

  const [modelDataIntialFetched, setmodelDataIntialFetched] =
    useState<boolean>(Boolean);
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

      if (data.FuelType && !data.FuelType.includes(currentFuelType)) {
        console.log("fuel type1", prioritizeFuels(data.FuelType))
        setCurrentFuelType(prioritizeFuels(data.FuelType)[0]);
        setCarFilter((prev) => ({ ...prev, fuel_type: data.FuelType[0] }));

        fetchBrandModelWithFuel(prioritizeFuels(data.FuelType)[0]);
      } else {
          console.log("fuel type2", prioritizeFuels(data.FuelType))
        setCurrentFuelType(prioritizeFuels(data.FuelType)[0]);

        setCarFilter((prev) => ({
          ...prev,
          fuel_type: prioritizeFuels(data.FuelType)[0],
        }));

        fetchBrandModelWithFuel(prioritizeFuels(data.FuelType)[0]);
      }

      setmodelDataIntialFetched(true);
    } catch (error) {}
  };

  const { botType } = useBotType();

  useEffect(() => {
    if (brand) {
      setCarFilter({ ...carFilter, brand_name: brand.BrandName });

      fetchBrandModes();
    }
    return () => {};
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

      setIsDisable(true);
    } catch (error) {
      setDisableBtn(false);
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

      console.log("FuelType :" + data["FuelType"]);
      console.log("TransmissionType :" + data["TransmissionType"]);
      console.log("Seats :" + data["Seats"]);
      console.log("BodyNames :" + data["BodyNames"]);
      console.log("FuelTypes length :" + FuelTypes.length);
      console.log("data budget", data["budgetTypes"]);

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

      if (data.BodyNames && !data.BodyNames.includes(currentBodyType)) {
        setCurrentBodyType(data.BodyNames[0]);
        setCarFilter((prev) => ({ ...prev, body_type: data.BodyNames[0] }));
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

      if (
        data.TransmissionType &&
        !data.TransmissionType.includes(currentTransmissionType)
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
        setCurrentTransmissionType(currentTransmissionType);
        fetchParametersWithBrandModelFuelTransmission(
          currentTransmissionType,
          fuel_type
        );
      }
    } catch (error) {}
  };

  const { messages } = useChats();

  const handleFuelChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentFuelType(e.target.value);
    setCarFilter((prev) => ({ ...prev, fuel_type: e.target.value }));
    fetchBrandModelWithFuel(e.target.value);
  };

  const handleTransmissionChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentTransmissionType(e.target.value);
    setCarFilter((prev) => ({ ...prev, transmission_type: e.target.value }));
    fetchParametersWithBrandModelFuelTransmission(e.target.value, currentFuelType);
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
    fetchParametersWithSeat(newSeatCapacity, currentTransmissionType, currentFuelType);
  };

  const handleBodyTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCarFilter((prev) => ({ ...prev, body_type: e.target.value }));
    setCurrentBodyType(e.target.value);
    // If you want to trigger an API here, add the call below
    // fetchDataBasedOnParameters();
  };

  return (
    <Card
      sx={{
        minWidth: "300px",
        p: 2,
        boxShadow: "none",
        border: "none",
        borderBottom: "none",
      }}
    >
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {botType}
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            flexDirection: {
              xs: "column",
              sm: "row",
            },
          }}
        >
          {/* Brand Selector */}
          <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            <InputLabel id="brand-label">Brand</InputLabel>
            <Select
              disabled={isDisable}
              labelId="brand-label"
              value={brand?.BrandID ?? ""}
              label="Brand"
              onChange={(e) => {
                const selectedBrand = brands.find(
                  (b: Brand) => b.BrandID === e.target.value
                );
                if (selectedBrand) {
                  setBrand(selectedBrand);
                }
              }}
              sx={{
                fontSize: "15px",
                "& .MuiSelect-select": {
                  fontSize: "15px",
                },
              }}
            >
              {Array.isArray(brands) &&
                brands?.map((brand: Brand, index: number) => (
                  <MenuItem key={index} value={brand.BrandID}>
                    {/* Show logo before brand name */}
                    {brand.logo && (
                      <img
                        src={brand.logo}
                        alt={brand.BrandName}
                        style={{
                          width: 24,
                          height: 24,
                          objectFit: "contain",
                          marginRight: 8,
                          verticalAlign: "middle",
                        }}
                      />
                    )}
                    {brand.BrandName}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          {/* Model Selector */}
          <FormControl
            sx={{ m: 1, minWidth: 120 }}
            size="small"
            disabled={!brand}
          >
            <InputLabel id="model-label">Model</InputLabel>
            <Select
              disabled={isDisable}
              labelId="model-label"
              value={model?.ModelID ?? ""}
              label="Model"
              onChange={(e) => {
                const selectedModel = models.find(
                  (m) => m.ModelID === Number(e.target.value)
                );
                if (selectedModel) {
                  setModel(selectedModel);
                }
              }}
              sx={{
                fontSize: "15px",
                "& .MuiSelect-select": {
                  fontSize: "15px",
                },
              }}
            >
              {models.map((model: ModelProps, index: number) => (
                <MenuItem key={index} value={model.ModelID}>
                  {model.ModelName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <div style={{ marginTop: "1rem" }}>
          <BudgetSelector
            budgetTypes={FuelTypes}
            currentBudget={currentFuelType}
            label="Fuel Type"
            handleBudgetChange={handleFuelChange}
          />
        </div>

        <div style={{ marginTop: "1rem" }}>
          <BudgetSelector
            budgetTypes={TransmissionTypes}
            currentBudget={currentTransmissionType}
            label="Transmission Type"
            handleBudgetChange={handleTransmissionChange}
          />
        </div>
        <div style={{ marginTop: "1rem" }}>
          <BudgetSelector
            budgetTypes={SeatCaps}
            currentBudget={currentSeatCap.toString()}
            label="Seating Capacity"
            handleBudgetChange={handleSeatCapChange}
          />
        </div>

        <div style={{ marginTop: "1rem" }}>
          <BudgetSelector
            budgetTypes={bodyTypes}
            currentBudget={currentBodyType.toString()}
            label="Body Type"
            handleBudgetChange={handleBodyTypeChange}
          />
        </div>

        <div style={{ marginTop: "1rem" }}>
          <BudgetSelector
            budgetTypes={bugetTypes}
            currentBudget={currentBudget.toString()}
            label="Budget"
            handleBudgetChange={handleBudgetChange}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "end",
            justifyItems: "center",
          }}
        >
          <Button
            disabled={disableBtn}
            variant="contained"
            color="primary"
            onClick={fetchDataBasedOnParameters}
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

export default BrandModelSelectCard;
