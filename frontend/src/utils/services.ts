import { Value } from "sass";

export const fuelOptions = [
  { id: 1, label: "Petrol" },
  { id: 2, label: "Diesel" },
  { id: 3, label: "CNG" },
  { id: 4, label: "Electric" },
];

export const transmissionOptions = [
  { id: 1, label: "Automatic" },
  { id: 2, label: "Manual" },
];

export const seatingCapacityOptions = [
  { id: 1, label: "5" },
  { id: 2, label: "7" },
];

export const DEFAULTSEARCHPARAMS = {
  brand_name: "",
  model_name: "",
  fuel_type: "",
  transmission_type: "",
  budget: 0,
  seat_capacity: 0,
  body_type: "",
};

export function getUpperLimitInRupees(budgetRange: string) {
  if (!budgetRange) return null;

  const parts = budgetRange.split("-");
  const upper = parts[1]?.toUpperCase().trim();

  if (upper) {
    const number = parseFloat(upper.replace("L", ""));

    console.log("number111", number);
    return number * 100000; // 1 Lakh = 100,000
  }

  return null;
}

export const BUDGET = ["0-5L", "5-10L", "10-15L", "15-20L", "20-25L", "25-30L"];
export const BODYTYPES = ["suv", "sedan", "hatchback", "coupe", "convertible"];
export const SEATCAPACITY = [2, 4, 5, 7];
export const FUELTYPES = ["petrol", "diesel", "cng", "electric"];
export const TRANSMISSIONTYPES = ["manual", "automatic"];

export const MORERESEARCHONCAROPTIONS = [
  "Fuel types",
  "Transmission types",
  "Manual and Automation",
  "Technical Details",
  "Brand Recommendations",
  "Brand Opinion",
  // "I know exactly what I want",
  // "I need advisor support",
  // "Back to Car Research",
];
export const FuelTypeOptions = [
  
]




export  const CustomFilter = [
  "Hatchback",
  "Sedan",
  "SUV",
  "Crossover",
  "MPV",

  "Manual",
  "Automatic",

  "Petrol",
  "Diesel",
  "CNG",
  "Hybrid",
  "Electric",

  "5-10L",
  "10-15L",
  "15-20L",
  "20-25L",
  "25-30L",
  "30-35L",
  "35-40L"
]







 