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
  fuel_type: "Petrol",
  transmission_type: "MT",
  budget:1500000,
  seat_capacity: 5,
  body_type: "suv",
  brands:[]
};

export function getUpperLimitInRupees(budgetRange: string) {
  if (!budgetRange) return null;
  if(budgetRange.includes("Up to 5L")) return 500000

  if(budgetRange.includes("Above")) return 1000000000

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
export const SEATCAPACITY = [2, 4, 5, 7];
export const BODYTYPES = ["Suv", "Sedan", "Hatchback", "Coupe", "Convertible","Sedan"];
export const FUELTYPES = ["Petrol", "Diesel", "CNG", "Electric"];
export const TRANSMISSIONTYPES = ["MT", "AT"];

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
export const FuelTypeOptions = [];

export const CustomFilter = [
  "Hatchback",
  "Sedan",
  "SUV",
  "Crossover",
  "MPV",

  "MT",
  "AT",

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
  "35-40L",
];
export const Priorities = ["Petrol", "Diesel", "Electric", "Hybrid", "CNG", "LPG", "Hydrogen", "Biofuel", "Manual", "Automatic", "Semi-Automatic", "CVT", "Dual-Clutch", 1, 2, 3, 4];


export const transmissionTypes:{[key:string]:string} = {
  "MT": "MT",
  "AT": "AT",
  "Semi-Automatic": "SAT",
  "Continuously Variable Transmission": "CVT",
  "Dual-Clutch Transmission": "DCT",
  "Tiptronic": "TT",
  "Automated Manual Transmission": "AMT"
};


export const TransmissionFullForm:{[key:string]:string}={
  "MT": "Manual",
  "AT": "Automatic",
  "CVT":"CVT",
  "AMT":"AMT",
  'e-drive':"E-drive"
}



export const BudgetToRange: Record<number, string> = {
  500000: "0-5L",
  1000000: "5-10L",
  1500000: "10-15L",
  2000000: "15-20L",
  2500000: "20-25L",
  3000000: "25-30L",
  3500000: "30-35L",
  4000000: "35-40L",
  1000000000: "Above 40L",
};









export const capitalizeFirst = (str:string) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};



export const  SEATCAPACITIES =["5", "6", "7"]
export const BODYNAMES=[
    "Hatchback",
    "Sedan",
    "SUV",
    "Coupe",
    "Convertible",
    "MPV",
    "MUV"
  ]
  export const FUELTYPE  = [
    "Petrol",
    "Diesel",
    "CNG",
    "Electric",
  ]
  export const TRANSMISSION=[
    "AT",
    "MT",
  ]


  export const BUDGETS=[
    "Up to 5L",
    "5-10L",
    "10-15L",
    "15-20L",
    "20-25L",
    "25-30L",
    "30-35L",
    "35-40L",
    "Above 40L"
  ]


  export const petrolPump =`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-fuel-pump" viewBox="0 0 16 16">
  <path d="M3 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5z"/>
  <path d="M1 2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v8a2 2 0 0 1 2 2v.5a.5.5 0 0 0 1 0V8h-.5a.5.5 0 0 1-.5-.5V4.375a.5.5 0 0 1 .5-.5h1.495c-.011-.476-.053-.894-.201-1.222a.97.97 0 0 0-.394-.458c-.184-.11-.464-.195-.9-.195a.5.5 0 0 1 0-1q.846-.002 1.412.336c.383.228.634.551.794.907.295.655.294 1.465.294 2.081v3.175a.5.5 0 0 1-.5.501H15v4.5a1.5 1.5 0 0 1-3 0V12a1 1 0 0 0-1-1v4h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1zm9 0a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v13h8z"/>
</svg>`





  export  const COMBINEOPTIONS = [
  "Suv", "Sedan", "Hatchback", "Coupe", "Convertible",
  "Petrol", "Diesel", "CNG", "Electric",
  "MT", "AT"
]






export function formatInternational(num:number) {
  if (num >= 10000000) {
    return (num / 10000000).toFixed(2) + 'Cr'; // Crore
  } else if (num >= 100000) {
    return (num / 100000).toFixed(2) + 'L'; // Lakh
  } else {
    return num.toString();
  }
}

