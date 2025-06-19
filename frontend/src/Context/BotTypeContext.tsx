"use client";
import React, { createContext, useState, useContext } from "react";

type BotType = string;

interface BotTypeContextType {
  botType: BotType;
  setBotType: (type: BotType) => void;
}

const BotTypeContext = createContext<BotTypeContextType | undefined>(undefined);

export const BotTypeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [botType, setBotType] = useState<BotType>("want");

  return (
    <BotTypeContext.Provider value={{ botType, setBotType }}>
      {children}
    </BotTypeContext.Provider>
  );
};

export const useBotType = (): BotTypeContextType => {
  const context = useContext(BotTypeContext);
  if (!context) {
    throw new Error("useBotType must be used within a BotTypeProvider");
  }
  return context;
};
