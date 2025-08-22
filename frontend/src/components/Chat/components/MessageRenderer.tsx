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
  availableBrands?: Brand[];
  onIknowExactly: () => void;
  onNeedAdviceSupport: () => void;
  onBack: () => void;
  onShowCars: () => boolean | void;
  onCarRecommendation: () => Promise<boolean | void>;
  onUserMessage: (text: any) => void;
  onPersistBrandModel?: (partial: any) => void;
  onTriggerOverallRecommendations?: () => Promise<void | boolean>; // Add this prop
};

const MessageRenderer: React.FC<MessageRendererProps> = ({
  message,
  index,
  preferences,
  filter,
  availableBrands,
  onIknowExactly,
  onNeedAdviceSupport,
  onBack,
  onShowCars,
  onCarRecommendation,
  onUserMessage,
  onPersistBrandModel,
}) => {
  switch (message.render) {
    case "brandModelSelect":
      return (
        <BrandModelSelectCard
          handleUserMessage={onUserMessage}
          brands={
            typeof message.message?.brands !== "undefined" &&
            message.message?.brands?.length
              ? message.message.brands
              : availableBrands ?? []
          }
          onPersistState={onPersistBrandModel}
          initialBrand={message.message?.brand ?? null}
          initialModel={message.message?.model ?? null}
        />
      );
    case "carOptions":
      return (
        <TeslaCard
          onClick={onIknowExactly}
          selectedItem={message.message}
          handleNeedAdviceSupport={onNeedAdviceSupport}
          onTriggerOverallRecommendations={onCarRecommendation}
        />
      );
    case "carComponent": // New case for rendering Car.tsx from Feeds.tsx
      return (
        <TeslaCard
          onClick={onIknowExactly}
          selectedItem={message.data} // Pass message.data to Car.tsx
          handleNeedAdviceSupport={onNeedAdviceSupport}
          onTriggerOverallRecommendations={onCarRecommendation}
        />
      );
    case "text":
      return (
        <div
          className="prompt"
          dangerouslySetInnerHTML={{
            __html: capitalizeFirst(message.message as string),
          }}
          id={`user-message-${index}`}
        />
      );
    case "selectOption": {
      const opts = Array.isArray(preferences)
        ? preferences.map((p: any) => p?.price_range?.toString())
        : [];
      const initial = (message as any)?.message?.selections?.["budget"] ?? null;
      console.log("initial", message);
      return (
        <AdviceSelectionCard
          options={opts}
          label="budget"
          h1={
            "Hi! :👋 I can help you choose the right car based on your preferences. Let's get started! First, what's your budget range in INR?"
          }
          initialValue={initial}
          onPersistSelection={onPersistBrandModel}
        />
      );
    }
    case "flueOption":
      return (
        <AdviceSelectionCard
          options={(message as any)?.data?.fuel_types}
          label="fuel type"
          h1={"⛽: Got it! What’s your preferred fuel type?\n"}
          initialValue={
            (message as any)?.message?.selections?.["fuel type"] ?? null
          }
          onPersistSelection={onPersistBrandModel}
        />
      );
    case "transmissionOption":
      return (
        <AdviceSelectionCard
          options={(message as any)?.data?.transmission_types}
          label="transmission type"
          h1="⚙️ Cool! What kind of transmission do you prefer?"
          onBack={onBack}
          initialValue={
            (message as any)?.message?.selections?.["transmission type"] ?? null
          }
          onPersistSelection={onPersistBrandModel}
        />
      );
    case "bodyOption":
      return (
        <AdviceSelectionCard
          options={(message as any)?.data?.body_types}
          label="body type"
          h1="🚙: Great. What type of car body are you looking for?"
          initialValue={
            (message as any)?.message?.selections?.["body type"] ?? null
          }
          onPersistSelection={onPersistBrandModel}
        />
      );
    case "brandOption":
      return (
        <CarModel
          options={(message as any)?.data?.brands}
          label="brand"
          h1="🚗: Awesome! Which car brand do you prefer?"
          onclick={onCarRecommendation}
          initialValue={(message as any)?.selections?.["brand"] ?? null}
          onPersistSelection={onPersistBrandModel}
        />
      );
    case "selectedFilter": {
      const rec =
        typeof (message as any)?.message === "object" &&
        (message as any)?.message
          ? (message as any).message
          : filter;
      return <CarRecommendationTable recommendations={rec} />;
    }
    case "recommendationOption": {
      const disabled = Boolean((message as any)?.fromHistory);
      return (
        <OptionsCard
          onBack={onBack}
          onShowCars={() => Boolean(onShowCars())}
          disabled={disabled}
        />
      );
    }
    case "researchOncar":
      return <CarResearchMenu />;
    default:
      return null;
  }
};

export default MessageRenderer;
