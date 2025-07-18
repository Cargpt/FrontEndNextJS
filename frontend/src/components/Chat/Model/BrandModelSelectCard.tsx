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
import BrandSelector from "./InlineRadio";
import { DEFAULTSEARCHPARAMS } from "@/utils/services";
import { useChats } from "@/Context/ChatContext";
import { useBotType } from "@/Context/BotTypeContext";

// Type-safe options

type BrandModelSelectCardProps = {
  handleUserMessage: (message: any) => void;
  brands: Brand[] | any;
};

import { useSnackbar } from "@/Context/SnackbarContext";

const BrandModelSelectCard: React.FC<BrandModelSelectCardProps> = ({
  handleUserMessage,
  brands,
}) => {
  const [brand, setBrand] = useState<Brand>(brands[0]);

  const [model, setModel] = useState<ModelProps | null>(null);
  const [models, setModels] = useState<ModelProps[]>([]);
  const [carFeatures, setCarFeatures] = useState<CarFeaturesProps>({
    FuelType: ["petrol", "diesel", "electric"],
    TransmissionType: ["manual", "automatic"],
    Seats: [2, 4, 5, 7],
    bugetTypes: ["0-5L", "5-10L", "10-15L", "15-20L", "20-25L", "25-30L"],
    BodyNames: ["suv", "sedan", "hatchback", "coupe", "convertible"],
  });

  const [disableBtn, setDisableBtn] = useState<boolean>(false);
  const [carFilter, setCarFilter] = useState<CarFilter>(DEFAULTSEARCHPARAMS);

  const handleChange = (name: string, value: number | string) => {
    setCarFilter((prev) => ({
      ...prev,
      [name]:
        name === "budget" || name === "seat_capacity" ? Number(value) : value,
    }));
  };

  const { setCars } = useChats();

  const fetchBrandModes = async () => {
    const searchParams: any = messages[messages.length - 1]?.searchParam;
    console.log("searchParams", messages, searchParams);

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
      } catch (error) { }
    }
  };

  const fetchCarFeatures = async () => {
    const payload = {
      brand_name: brand?.BrandName,
      modle_name: model?.ModelName,
    };
    try {
      const data = await axiosInstance1.post(
        "/api/cargpt/brand-model-parameters/",
        payload
      );

      setCarFeatures(data?.data);
    } catch (error) { }
  };

  const { botType } = useBotType();

  useEffect(() => {
    if (brand) {
      setCarFilter({ ...carFilter, brand_name: brand.BrandName });

      fetchBrandModes();
    }
    return () => { };
  }, [brand]);

  useEffect(() => {
    if (model) {
      setCarFilter({ ...carFilter, model_name: model.ModelName });

      fetchCarFeatures();
    }
    return () => { };
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

  const [openDialouge, setOpenDialouge] = useState<boolean>(false);

  const onChnageFilter = async (key: string, value: string | number) => {
    if (isDisable) return;

    let featuresList = ["fuel_type", "transmission_type", "seat_capacity"];

    // Remove the current key from the list
    if (featuresList.includes(key)) {
      featuresList.splice(featuresList.indexOf(key), 1);
    }

    let payload: any;
    if (key === "fuel_type") {
      payload = {
        brand_name: brand?.BrandName,
        modle_name: model?.ModelName,
        fuel_type: value,
      };
    } else {
      payload = {
        brand_name: brand?.BrandName,
        modle_name: model?.ModelName,
        [key]: value,
      };
      // Add the latest values from carFilter for the other features
      featuresList.forEach((feature) => {
        if ((carFilter as any)[feature] !== undefined) {
          payload[feature] = (carFilter as any)[feature];
        }
      });
    }

    console.log("skks", key, value);
    try {
      const data = await axiosInstance1.post(
        "/api/cargpt/brand-model-parameters/",
        payload
      );

      if (key === "fuel_type") {
        setCarFeatures(prev => ({
          ...prev,
          TransmissionType: data?.data?.TransmissionType,
          Seats: data?.data?.Seats,
          BodyNames: data?.data?.BodyNames,
          budgetTypes: data?.data?.budgetTypes,
          ...(data?.data?.Hatchback && { Hatchback: data?.data?.Hatchback }),
        }));
      } else if (key === "transmission_type") {
        setCarFeatures(prev => ({
          ...prev,
          Seats: data?.data?.Seats,
          BodyNames: data?.data?.BodyNames,
          budgetTypes: data?.data?.budgetTypes,
          ...(data?.data?.Hatchback && { Hatchback: data?.data?.Hatchback }),
        }));
      } else {
        // For other keys, keep the previous logic
        const prevValues = carFeatures[key];
        const NewObj = { ...carFeatures, [key]: prevValues };
        setCarFeatures(NewObj);
      }
    } catch (error) { }
  };

  const { messages } = useChats();
  console.log("brands", carFeatures);
  console.log('Latest values:', {
    brand,
    model,
    fuel_type: carFilter.fuel_type,
    transmission_type: carFilter.transmission_type,
    seat_capacity: carFilter.seat_capacity
  });
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
          {carFeatures?.FuelType?.length > 0 && (
            <BrandSelector
              label="Fuel type"
              options={carFeatures?.FuelType}
              key={0}
              onChange={handleChange}
              onChnageFilter={onChnageFilter}
            />
          )}
          {carFeatures?.TransmissionType?.length > 0 && (
            <div>
              <BrandSelector
                label="Transmission type"
                options={carFeatures?.TransmissionType}
                key={1}
                onChange={handleChange}
                onChnageFilter={onChnageFilter}
              />
            </div>
          )}

          {carFeatures?.Seats?.length > 0 && (
            <div>
              <BrandSelector
                label="Seat capacity"
                options={carFeatures?.Seats}
                key={2}
                onChange={handleChange}
                onChnageFilter={onChnageFilter}
              />
            </div>
          )}

          {carFeatures?.BodyNames?.length > 0 && (
            <div>
              <BrandSelector
                label="Body type"
                options={carFeatures?.BodyNames}
                key={3}
                onChange={handleChange}
                onChnageFilter={onChnageFilter}
              />
            </div>
          )}

          {carFeatures?.budgetTypes?.length > 0 && (
            <div>
              <BrandSelector
                label="Budget"
                options={carFeatures?.budgetTypes}
                key={4}
                onChange={handleChange}
                onChnageFilter={onChnageFilter}
              />
            </div>
          )}

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
        </div>
      </CardContent>
    </Card>
  );
};

export default BrandModelSelectCard;