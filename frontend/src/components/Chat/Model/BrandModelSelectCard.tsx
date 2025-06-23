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
import {
  DEFAULTSEARCHPARAMS,
  
} from "@/utils/services";
import { useChats } from "@/Context/ChatContext";
import { useBotType } from "@/Context/BotTypeContext";

// Type-safe options
const brandOptions = ["Toyota", "Honda", "Ford"] as const;
type BrandModelSelectCardProps = {
  handleUserMessage: (message: any) => void;

}
const BrandModelSelectCard: React.FC<BrandModelSelectCardProps> = ({handleUserMessage}) => {
  const [brand, setBrand] = useState<Brand | null>(null);

  const [brands, setBrands] = useState<Brand[]>([]);

  const [model, setModel] = useState<ModelProps | null>(null);
  const [models, setModels] = useState<ModelProps[]>([]);
  const [carFeatures, setCarFeatures] = useState<CarFeaturesProps>({
    FuelType: ["petrol", "diesel", "electric"],
    TransmissionType: ["manual", "automatic"],
    Seats: [2, 4, 5, 7],
    bugetTypes: ["0-5L", "5-10L", "10-15L", "15-20L", "20-25L", "25-30L"],
    BodyNames: [ "suv", "sedan", "hatchback", "coupe", "convertible"],
  });

  const [carFilter, setCarFilter] = useState<CarFilter>(DEFAULTSEARCHPARAMS);

  const handleChange = (name: string, value: number | string) => {
    setCarFilter((prev) => ({
      ...prev,
      [name]:
        name === "budget" || name === "seat_capacity" ? Number(value) : value,
    }));
  };

  
  const {addChat, chats, setCars}=useChats()
  const fetchBrands = async () => {
    try {
      const data = await axiosInstance1.get("/api/brands/");
      
      setBrands(data?.data);
    } catch (error) {}
  };
  const fetchBrandModes = async () => {
    const payload = {
      brand_id: brand?.BrandID,
    };
    try {
      const data = await axiosInstance1.post("/api/models/", payload);
      console.log("data", data);
      setModels(data?.models || []);
    } catch (error) {}
  };

  const fetchCarFeatures = async () => {
    const payload = {
      brand_name: brand?.BrandName,
      modle_name: model?.ModelName,
    };
    try {
      const data = await axiosInstance1.post(
        "/api/brand-model-parameters/",
        payload
      );
      console.log("data", data);
      setCarFeatures(data?.data);


    } catch (error) {}
  };

  useEffect(() => {
    fetchBrands();


  }, []);

const {botType}=useBotType()

  
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


  const fetchDataBasedOnParameters = async () => {
    try {
      const payload = { ...carFilter };
      const data = await axiosInstance1.post(
        "/api/cars-for-prameter/",
        payload
      );
      console.log("/api/cars-for-prameter/", data);
      setCars((prev:any)=> ([...prev, {[`${brand?.BrandName}_${model?.ModelName}`]: data?.data}]))
      

        handleUserMessage({...payload})

    } catch (error) {}
  };

  console.log("carFilter", carFilter);
  return (
    <Card sx={{ minWidth: "600px", p: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {botType}
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          {/* Brand Selector */}
          <FormControl fullWidth>
            <InputLabel id="brand-label">Brand</InputLabel>
            <Select
              labelId="brand-label"
              value={brand?.BrandID}
              label="Brand"
              onChange={(e) =>
                setBrand(brands.filter((b) => b.BrandID === e.target.value)[0])
              }
            >
              {brands.map((brand: Brand, index: number) => (
                <MenuItem key={index} value={brand.BrandID}>
                  {brand.BrandName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Model Selector */}
          <FormControl fullWidth disabled={!brand}>
            <InputLabel id="model-label">Model</InputLabel>
            <Select
              labelId="model-label"
              value={model?.ModelID}
              label="Model"
              onChange={(e) =>{
                setModel(
                  models.filter((m) => m.ModelID === Number(e.target.value))[0]
                )
              
              }
              }
            >
              {models.length > 0 &&
                models.map((model: ModelProps, index: number) => (
                  <MenuItem key={index} value={model.ModelID}>
                    {model.ModelName}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Box>

        <div style={{ marginTop: "1rem" }}>
          {carFeatures?.FuelType.length > 0 && (
            <BrandSelector
              label="Fuel type"
              options={carFeatures?.FuelType}
              key={0}
              onChange={handleChange}
            />
          )}
          {carFeatures?.TransmissionType.length > 0 && (
            <div>
              <BrandSelector
                label="Transmission type"
                options={carFeatures?.TransmissionType}
                key={1}
                onChange={handleChange}
              />
            </div>
          )}

          {carFeatures?.Seats.length > 0 && (
            <div>
              <BrandSelector
                label="Seat capacity"
                options={carFeatures?.Seats}
                key={2}
                onChange={handleChange}
              />
            </div>
          )}

          {carFeatures?.BodyNames.length > 0 && (
            <div>
              <BrandSelector
                label="Body type"
                options={carFeatures?.BodyNames}
                key={3}
                onChange={handleChange}
              />
            </div>
          )}

          {carFeatures?.bugetTypes.length > 0 && (
            <div>
              <BrandSelector
                label="Budget"
                options={carFeatures?.bugetTypes}
                key={4}
                onChange={handleChange}
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
