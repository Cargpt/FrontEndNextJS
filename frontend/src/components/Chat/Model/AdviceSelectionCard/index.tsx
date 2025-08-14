"use client";

import React, { FC, useEffect, useState } from "react";
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
import { useChats } from "@/Context/ChatContext";
import { getUpperLimitInRupees } from "@/utils/services";
import { axiosInstance1 } from "@/utils/axiosInstance";
import { useSnackbar } from "@/Context/SnackbarContext";

interface AdviceSelectionCardProps {
  options: string[];
  label: string;
  h1: string;
  onBack?:()=>void;
  initialValue?: string | null;
  onPersistSelection?: (partial: any) => void;
}
const AdviceSelectionCard: FC<AdviceSelectionCardProps> = ({
  options,
  label,
  h1,
  onBack,
  initialValue = null,
  onPersistSelection,
}) => {
  const [selections, setSelections] = useState<{
    [key: string]: string | null;
  }>({
    value: null,
  });
  const [isDisable, setIsDisable] = useState<boolean>(false);

  const { updateFilter, filter, setMessages, setFilter, messages } = useChats();
  const isFromHistory = Boolean((messages[messages.length - 1] as any)?.fromHistory);

  const handleSelect = (type: string, value: string) => {
    const updated = { [type]: value };

    setSelections(updated);

    if (label === "budget") {
      const upperLimit = getUpperLimitInRupees(value.toString());
      if (upperLimit) {
        updateFilter(label, upperLimit);
      }
    } else {
      updateFilter(label.toLowerCase().replace(/\s+/g, "_"), value);
    }

    // Persist selection into last bot message so history restores selected option
    onPersistSelection?.({ selections: { [label]: value } });
  };


  
  useEffect(() => {
    const chosen = initialValue ?? (label === "budget" ? '0-5L' : options?.[0]);
    setSelections({ [label]: chosen });

    if (label === "budget") {
      const upperLimit = getUpperLimitInRupees((initialValue ?? options?.[0])?.toString()) || 500000;
      if (upperLimit) {
        updateFilter(label, upperLimit);
      }
    } else if (chosen) {
      updateFilter(label.toLowerCase().replace(/\s+/g, "_"), chosen);
    }
  }, [initialValue]);

  const handleNext = async() => {
    // if(label=="transmission type") {
      const fx= await fetchBrandsBasedOnQuery()

      console.log("fx", fx)



      
      if(!fx) return false;

      setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        message: `${label} set to ${selections[label]}`,
        render: "text",
        sender: "user",
        data:fx
      
      },
    ]);
  
    

    
    setIsDisable(true);
  };

  const {showSnackbar}=useSnackbar()
    const [showOnBack, setshowOnBack] = useState<boolean>(false);
    
   const fetchBrandsBasedOnQuery = async()=>{
    let payload = {
      ...filter,
      brand_name:"",
      brands:[]
    
      }
    
    const data = await axiosInstance1.post('/api/cargpt/brand-models-detailed/', payload)
    const  brands=data || []
    if(brands.length < 1 ){

      showSnackbar("No brand found based on selected parameters")
          setIsDisable(true);

      setshowOnBack(true)
      return false
    }
    if(label==="transmission type"){
    updateFilter('brands', brands)

    }
    
    return brands
     
    
  }


  useEffect(() => {
    if(label==='budget'){
      const upperLimit = getUpperLimitInRupees(options[0]?.toString()) ||  500000
      setFilter({...filter, body_type:"", transmission_type:"", fuel_type:"", budget:upperLimit})

    }
    
    
  }, [label]);

  
  console.log("selections", initialValue)
  return (
    <Card
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        border: "none",
        borderBottom: "none",
        boxShadow: "none",
        backgroundColor: "transparent",
        backgroundImage:"none"
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
        sx={{
          pt:0
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

        <Stack direction="row" flexWrap="wrap" gap={1}>
          {options?.map((option, index) => (
            <Button
              key={index}
              variant={option === selections[label] ? "contained" : "outlined"}
              onClick={() => handleSelect(label, option)}
              sx={{
                backgroundColor:
                  selections[label] === option ? "#d3e3ff" : "inherit",
                color: selections[label] === option ? "#000" : "inherit",
                borderRadius: "5px",
                textTransform: "none",
                border: "none",
              }}
            >
              {option}
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
            <Button
              disabled={isDisable || isFromHistory}
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
              {
                showOnBack &&
                 <Button
            onClick={onBack}
            variant="contained"
            color="primary"
            type="button"
            sx={{marginX:"1rem"}}
          >
           Go Back
          </Button>


              }
          


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
