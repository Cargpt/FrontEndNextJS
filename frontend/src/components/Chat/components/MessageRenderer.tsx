"use client";
import React from "react";
import BrandModelSelectCard from "../Model/BrandModelSelectCard";
import TeslaCard from "../Model/Cards/Car";
import AdviceSelectionCard from "../Model/AdviceSelectionCard";
import CarModel from "../Model/AdviceSelectionCard/CarOptions";
import CarRecommendationTable from "../Model/AdviceSelectionCard/Recommondation";
import OptionsCard from "../Model/AdviceSelectionCard/OptionCard";
import CarResearchMenu from "../../MoreResearchOnCar/MoreResearchOnCar";
import { Typography } from "@mui/material";
import { capitalizeFirst } from "@/utils/services";

type MessageRendererProps = {
  message: Message;
  index: number;
  preferences: any[];
  filter: any;
  onIknowExactly: () => void;
  onNeedAdviceSupport: () => void;
  onBack: () => void;
  onShowCars: () => boolean | void;
  onCarRecommendation: () => Promise<void>;
  onUserMessage: (text: any) => void;
};

const MessageRenderer: React.FC<MessageRendererProps> = ({
  message,
  index,
  preferences,
  filter,
  onIknowExactly,
  onNeedAdviceSupport,
  onBack,
  onShowCars,
  onCarRecommendation,
  onUserMessage,
}) => {
  switch (message.render) {
    case "brandModelSelect":
      return (
        <BrandModelSelectCard
          handleUserMessage={onUserMessage}
          brands={message.message?.brands}
        />
      );
    case "carOptions":
      return (
        <TeslaCard
          onClick={onIknowExactly}
          selectedItem={message.message}
          handleNeedAdviceSupport={onNeedAdviceSupport}
        />
      );
    case "text":
      return (
        <Typography sx={{ fontSize: "14px" }} id={`user-message-${index}`}>
          {capitalizeFirst(message.message)}
        </Typography>
      );
    case "selectOption":
      return (
        <AdviceSelectionCard
          options={preferences?.map((preference: any) => preference?.price_range?.toString())}
          label="budget"
          h1={
            "Hi! :👋 I can help you choose the right car based on your preferences. Let's get started! First, what's your budget range in INR?"
          }
        />
      );
    case "flueOption":
      return (
        <AdviceSelectionCard
          options={(message as any)?.data?.fuel_types}
          label="fuel type"
          h1={"⛽: Got it! What’s your preferred fuel type?\n"}
        />
      );
    case "transmissionOption":
      return (
        <AdviceSelectionCard
          options={(message as any)?.data?.transmission_types}
          label="transmission type"
          h1="⚙️ Cool! What kind of transmission do you prefer?"
          onBack={onBack}
        />
      );
    case "bodyOption":
      return (
        <AdviceSelectionCard
          options={(message as any)?.data?.body_types}
          label="body type"
          h1="🏎️: Great. What type of car body are you looking for?"
        />
      );
    case "brandOption":
      return (
        <CarModel
          options={(message as any)?.data?.brands}
          label="brand"
          h1="🚗: Awesome! Which car brand do you prefer?"
          onclick={onCarRecommendation}
        />
      );
    case "selectedFilter":
      return <CarRecommendationTable recommendations={filter} />;
    case "recommendationOption":
      return <OptionsCard onBack={onBack} onShowCars={onShowCars} />;
    case "researchOncar":
      return <CarResearchMenu />;
    default:
      return null;
  }
};

export default MessageRenderer;


