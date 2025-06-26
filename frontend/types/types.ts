
type Brand = {
  BrandID: number ;
  BrandName: string;
};

type ModelProps = {ModelID: number, ModelName: string}


type BrandSelectorProps = {
  label: string;
  options: any[] ;
  defaultValue?: number | string;
  onChange?: (name:string,value: number | string) => void;

};


type CarFeaturesProps = {
  FuelType: string[];
  TransmissionType: string[];
  Seats: number[];
  bugetTypes: string[];
  BodyNames: string[];
  
};

type CarFilter = {
  brand_name: string;
  model_name: string;
  fuel_type: string; // example union type
  transmission_type:string;
  budget: number;
  seat_capacity: number;
  body_type: string // example
};





interface CarRecommendation {
  budget: number;
  fuel: string;
  body: string;
  transmission: string;
  brand: string;
  models: string[];


}


 interface CarImageDetail {
  CarImageURL: string;
  color: string;
  Description: string;
}

interface CarDetails {
  CarID: number;
  FuelType: string;
  BrandName: string;
  TransmissionType: string;
  ModelName: string;
  VariantName: string;
  Price: number;
  Mileage: number;
  Seats: number;
  EngineCapacity: string;
  CarImageDetails: CarImageDetail[];
}

interface Message {
  id: string;
  sender: "user" | "bot";
  render:
    | "brandModelSelect"
    | "carOptions"
    | "text"
    | "selectOption"
    | "flueOption"
    | "bodyOption"
    | "transmissionOption"
    | "brandOption"
    | "selectedFilter"
    | "recommendationOption"
    | "researchOncar"
    |"BestCarOption";
  message: string | any;
  data?: any;
  prompt?: boolean;
}
