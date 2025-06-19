export const fuelOptions = [
  { id: 1, label: 'Petrol' },
  { id: 2, label: 'Diesel' },
  { id: 3, label: 'CNG' },
  {id:4, label:"Electric"}
];


export const transmissionOptions = [
  { id: 1, label: 'Automatic' },
  { id: 2, label: 'Manual' },
  
];




export const seatingCapacityOptions = [
  { id: 1, label: '5' },
  { id: 2, label: '7' },
  
];







export const DEFAULTSEARCHPARAMS={
    brand_name: '',
    model_name: '',
    fuel_type: '',
    transmission_type: '',
    budget: 0,
    seat_capacity: 0,
    body_type: '',
  }


export function getUpperLimitInRupees(budgetRange:string) {
  if (!budgetRange) return null;

  const parts = budgetRange.split('-');
  const upper = parts[1]?.toUpperCase().trim();

  if (upper.endsWith('L')) {
    const number = parseFloat(upper.replace('L', ''));
    return number * 100000; // 1 Lakh = 100,000
  }

  return null;
}
