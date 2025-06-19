
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
