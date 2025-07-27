
type Brand = {
  BrandID: number ;
  BrandName: string;
  logo: string;
};

type ModelProps = {ModelID: number, ModelName: string}


type BrandSelectorProps = {
  label: string;
  options: any[] ;
  defaultValue?: number | string;
  modelDataIntialFetched?:boolean
  setModelDataIntialFetched?: React.Dispatch<React.SetStateAction<boolean>>;

  onChange?: (name:string,value: number | string) => void;

 
  onChnageFilter:(key:string, value:string|number)=>void

};


type CarFeaturesProps = {
  FuelType: string[];
  TransmissionType: string[];
  Seats: number[];
  budgetTypes: string[];
  BodyNames: string[];
  [key:string]: number[] | string[]
  
};

type CarFilter = {
  brand_name: string;
  model_name: string;
  fuel_type: string; // example union type
  transmission_type:string;
  budget: number;
  seat_capacity: number;
  body_type: string // example,
  brands:string[]
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
  message:  any ;
  data?: any;
  prompt?: boolean;
  searchParam?:any;
  bookmark?: boolean;
}


interface ObjectProps{
    key:string
    value:string|number
  }




interface VariantColor {
  
ColorHex:string;
ColorName:string
}