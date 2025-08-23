import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  useTheme,
  useMediaQuery,
  IconButton,
  AppBar,
  Toolbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { KeyboardBackspaceSharp } from '@mui/icons-material';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import EngineIcon from '@mui/icons-material/Settings';
import InteriorIcon from '@mui/icons-material/EventSeat';
import DriverDisplayIcon from '@mui/icons-material/Dashboard';
import AutomationIcon from '@mui/icons-material/SmartToy';
import ParkingSupportIcon from '@mui/icons-material/LocalParking';
import ExteriorIcon from '@mui/icons-material/CarRepair';
import LuxuryIcon from '@mui/icons-material/Diamond';
import SafetyIcon from '@mui/icons-material/HealthAndSafety';
import EntertainmentIcon from '@mui/icons-material/Speaker';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import { axiosInstance1 } from '@/utils/axiosInstance';
import { formatInternational } from '@/utils/services';
import { useColorMode } from '@/Context/ColorModeContext';
import { useAndroidBackClose } from '@/hooks/useAndroidBackClose';

interface CompareCarsDialogProps {
  open: boolean;
  onClose: () => void;
  variantId: number;
  carName: string;
  primaryCar: any; // full object of the selected car
}

type SuggestedComparisonResponse = {
  mode?: string; // "suggested"
  comparisons?: any[]; // list of suggested cars to compare with primaryCar
};

type PairComparisonResponse = {
  car1: any;
  car2: any;
  car3?: any;
  comparison?: {
    price_difference: number;
    mileage_difference: number;
    power_difference: number;
    torque_difference: number;
    fuel_efficiency_winner: string;
    value_for_money_winner: string;
    overall_winner: string;
  };
};

const CompareCarsDialog: React.FC<CompareCarsDialogProps> = ({
  open,
  onClose,
  variantId,
  carName,
  primaryCar,
}) => {
  const [comparisonData, setComparisonData] = useState<
    SuggestedComparisonResponse | PairComparisonResponse | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const { mode } = useColorMode();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  useAndroidBackClose(open && isMobile, onClose);

  // State to force full screen mode
  const [forceFullScreen, setForceFullScreen] = useState(false);
  const [isViewingPairComparison, setIsViewingPairComparison] = useState(false);

  // Right-side add-car selector state
  const [isAddingRightCar, setIsAddingRightCar] = useState<boolean>(false);
  const [brandOptions, setBrandOptions] = useState<any[]>([]);
  const [modelOptions, setModelOptions] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<any | null>(null);
  const [selectedModel, setSelectedModel] = useState<any | null>(null);
  const [loadingAdd, setLoadingAdd] = useState<boolean>(false);
  const [variantOptions, setVariantOptions] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [selectedRightCar, setSelectedRightCar] = useState<any | null>(null);

  // Third car add via images-row '+'
  const [addThirdOpen, setAddThirdOpen] = useState<boolean>(false);
  const [thirdBrandOptions, setThirdBrandOptions] = useState<any[]>([]);
  const [thirdModelOptions, setThirdModelOptions] = useState<any[]>([]);
  const [thirdVariantOptions, setThirdVariantOptions] = useState<any[]>([]);
  const [thirdSelectedBrand, setThirdSelectedBrand] = useState<any | null>(null);
  const [thirdSelectedModel, setThirdSelectedModel] = useState<any | null>(null);
  const [thirdSelectedVariant, setThirdSelectedVariant] = useState<any | null>(null);
  const [thirdLoading, setThirdLoading] = useState<boolean>(false);

  // Call external API to fetch full car details by id and return parsed JSON
  const fetchCarDetailsById = async (carId: number) => {
    if (!carId) throw new Error('Invalid car id');
    const token =
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzgyMjEzMTA0LCJpYXQiOjE3NTA2NzcxMDQsImp0aSI6IjZjYTA0M2M4YWY4NzQyYjRiMWNkNGM1YzRiZmY0ODQ5IiwidXNlcl9pZCI6NH0.1jDNN4jz5TA4eNvZI1RHDen6uD2e-AznkhyUv_ijlPE';
    const headers = new Headers();
    headers.append('Authorization', token);
    headers.append('Content-Type', 'text/plain');
    // The API expects car_id parameter, which can be either CarID or VariantID
    const raw = JSON.stringify({ car_id: carId });
    const resp = await fetch(
      'http://ec2-3-110-170-230.ap-south-1.compute.amazonaws.com/api/cargpt/car-details/',
      {
        method: 'POST',
        headers,
        body: raw,
        redirect: 'follow' as RequestRedirect,
      }
    );
    const text = await resp.text();
    try {
      return JSON.parse(text);
    } catch (_e) {
      return text as any;
    }
  };

  const normalizeCar = (raw: any) => {
    if (!raw) return raw;

    let carData = raw;
    if (Array.isArray(raw)) {
      carData = raw[0];
    } else if (raw?.car) {
      carData = raw.car;
    } else if (raw?.data?.car) {
      carData = raw.data.car;
    } else if (raw?.data && (raw.data.BrandName || raw.data.ModelName || raw.data.VariantName)) {
      carData = raw.data;
    }

    // Ensure basic details are at the top level for consistent access
    const normalized = {
      ...carData,
      BrandName: carData?.BrandName || carData?.Brand || carData?.data?.BrandName || carData?.data?.Brand || carData?.Car?.BrandName || carData?.Car?.Brand || carData?.data?.Brand,
      ModelName: carData?.ModelName || carData?.Model || carData?.data?.ModelName || carData?.data?.Model || carData?.Car?.ModelName || carData?.Car?.Model || carData?.data?.Model,
      VariantName: carData?.VariantName || carData?.Variant || carData?.data?.VariantName || carData?.data?.Variant || carData?.Car?.VariantName || carData?.Car?.Variant || carData?.data?.Variant,
      Price: carData?.Price || carData?.data?.Price || carData?.Car?.Price || carData?.data?.car?.Price || carData?.car?.Price,
      CarImageDetails: carData?.CarImageDetails || carData?.data?.CarImageDetails || carData?.Car?.CarImageDetails,
      images: carData?.images || carData?.data?.images || carData?.Car?.images,
    };
    return normalized;
  };

  useEffect(() => {
    if (open && variantId) {
      setSelectedRightCar(null);
      fetchComparisonData();
    }
    // eslint-disable-next-line
  }, [open, variantId]);

  const fetchComparisonData = async () => {
    setLoading(true);
    setError(null);
    setIsViewingPairComparison(false); // Reset to suggested view when fetching initial data

    try {
      // New API contract expects an array of variant IDs under the key `variants`
      const payload = { variants: [variantId] };
      const data = await axiosInstance1.post('/api/cargpt/compare_cars/', payload);

      if (data) {
        setComparisonData(data as any);
      } else {
        setError('No comparison data available');
      }
    } catch (err: any) {
      const apiMessage = err?.response?.data?.error || err?.message;
      setError(apiMessage || 'Failed to fetch comparison data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // const renderCarCard = (car: any, title: string) => (
  //   <Card
  //     sx={{
  //       height: '100%',
  //       backgroundColor: mode === 'dark' ? theme.palette.background.paper : '#ffffff',
  //       border: '1px solid',
  //       borderColor: mode === 'dark' ? theme.palette.divider : 'grey.300',
  //     }}
  //   >
  //     <CardContent>
  //       <Typography variant="h6" gutterBottom fontWeight="bold">
  //         {title}
  //       </Typography>

  //       {/* {(car?.CarImageDetails?.[0]?.CarImageURL || car?.images?.[0]?.CarImageURL) && (
  //         <Box
  //           sx={{
  //             width: '100%',
  //             height: 120,
  //             display: 'flex',
  //             justifyContent: 'center',
  //             alignItems: 'center',
  //             mb: 2,
  //           }}
  //         >
  //           <img
  //             src={car?.CarImageDetails?.[0]?.CarImageURL || car?.images?.[0]?.CarImageURL}
  //             alt={car?.VariantName || car?.ModelName}
  //             style={{
  //               maxWidth: '100%',
  //               maxHeight: '100%',
  //               objectFit: 'contain',
  //             }}
  //           />
  //         </Box>
  //       )} */}

  //       <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, mb: 1 }}>
  //         <Typography variant="h6" fontWeight="bold">
  //           {(car?.BrandName || car?.Brand) as any} {car?.ModelName}
  //         </Typography>
  //         {car?.VariantName && (
  //           <Chip label={car?.VariantName} size="small" sx={{ fontSize: '10px' }} />
  //         )}
  //       </Box>

  //       <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
  //         ₹{formatInternational(car?.Price || 0)}
  //       </Typography>

  //       <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
  //         {car?.FuelType && (
  //           <Chip label={`${car?.FuelType}`} size="small" sx={{ fontSize: '10px' }} />
  //         )}
  //         {(car?.Trans_fullform || car?.Engine?.Transmission) && (
  //           <Chip
  //             label={`Transmission: ${car?.Trans_fullform || car?.Engine?.Transmission}`}
  //             size="small"
  //             sx={{ fontSize: '10px' }}
  //           />
  //         )}
  //         {car?.Mileage && (
  //           <Chip label={`${Number(car?.Mileage)} kmpl`} size="small" sx={{ fontSize: '10px' }} />
  //         )}
  //         {(car?.Seats || car?.Interior?.Doors) && (
  //           <Chip
  //             label={`${car?.Seats ? `${car?.Seats} Seater` : `${car?.Interior?.Doors} Doors`}`}
  //             size="small"
  //             sx={{ fontSize: '10px' }}
  //           />
  //         )}
  //         {car?.Engine?.DriveType && (
  //           <Chip label={`Drive: ${car?.Engine?.DriveType}`} size="small" sx={{ fontSize: '10px' }} />
  //         )}
  //         {car?.Safety?.AirbagCount && (
  //           <Chip label={`${car?.Safety?.AirbagCount} Airbags`} size="small" sx={{ fontSize: '10px' }} />
  //         )}
  //       </Box>
  //     </CardContent>
  //   </Card>
  // );

  const formatPrice = (price: number) => {
    return `₹${formatInternational(price || 0)}`;
  };

  const getDisplayName = (car: any) => car?.VariantName || car?.ModelName || 'Car';

  const getFeatureValue = (car: any, category: string, feature: string) => {
    // For BasicDetails, check directly on the car object first
    if (category === 'BasicDetails') {
      if (feature === 'Price') {
        return formatPrice(car?.Price || 0);
      }
      const value = car?.[feature];
      if (value !== null && value !== undefined && value !== '') {
        return String(value);
      }
      return <ClearIcon fontSize="small" color="error" />;
    }

    if (feature === 'Price') {
      return formatPrice(car?.Price || 0);
    }
    const value = car?.[category]?.[feature] || car?.[feature]; // Also check directly on car object for other features
    if (feature === 'CarImages') {
      const images = car?.CarImageDetails || car?.images;
      if (!images || images.length === 0) return <ClearIcon fontSize="small" color="error" />;
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
          {images.map((img: any, idx: number) => (
            <img
              key={idx}
              src={img?.CarImageURL || '/assets/card-img.png'}
              alt={`Car Image ${idx + 1}`}
              style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }}
            />
          ))}
        </Box>
      );
    }
    if (typeof value === 'boolean' || (typeof value === 'number' && (value === 0 || value === 1))) {
      return value ? <CheckIcon fontSize="small" color="success" /> : <ClearIcon fontSize="small" color="error" />;
    }
    if (value === null || value === undefined || value === '') {
      return <ClearIcon fontSize="small" color="error" />;
    }
    return String(value);
  };

  // Helper to get car image consistently
  const getCarImage = (car: any) => {
    // Check multiple possible image field structures
    const imageUrl = 
      car?.CarImageDetails?.[0]?.CarImageURL ||
      car?.images?.[0]?.CarImageURL ||
      car?.data?.CarImageDetails?.[0]?.CarImageURL ||
      car?.data?.images?.[0]?.CarImageURL ||
      car?.Car?.CarImageDetails?.[0]?.CarImageURL ||
      car?.Car?.images?.[0]?.CarImageURL ||
      car?.CarImageURL || // Direct image URL
      car?.ImageURL || // Alternative direct image URL
      car?.data?.CarImageURL ||
      car?.data?.ImageURL ||
      car?.Car?.CarImageURL ||
      car?.Car?.ImageURL;
    
    return imageUrl || '/assets/card-img.png';
  };

  // Helper to get car price consistently
  const getCarPrice = (car: any) => {
    // Check multiple possible price field structures
    const price = 
      car?.Price ||
      car?.data?.Price ||
      car?.Car?.Price ||
      car?.data?.car?.Price ||
      car?.car?.Price;
    
    return price || 0;
  };

  // Helper to get car ID consistently (prioritizing CarID over VariantID)
  const getCarId = (car: any) => {
    return car?.CarID || car?.VariantID || car?.Car?.CarID || car?.Car?.VariantID || car?.data?.CarID || car?.data?.VariantID;
  };

  // Helper to get car brand name consistently
  const getCarBrand = (car: any) => {
    // Check multiple possible brand field structures
    const brand = 
      car?.BrandName ||
      car?.Brand ||
      car?.data?.BrandName ||
      car?.data?.Brand ||
      car?.Car?.BrandName ||
      car?.Car?.Brand;
    
    return brand || '';
  };

  // Helper to get car model name consistently
  const getCarModel = (car: any) => {
    // Check multiple possible model field structures
    const model = 
      car?.ModelName ||
      car?.Model ||
      car?.data?.ModelName ||
      car?.data?.Model ||
      car?.Car?.ModelName ||
      car?.Car?.Model;
    
    return model || '';
  };

  // Helper to get car variant name consistently
  const getCarVariant = (car: any) => {
    // Check multiple possible variant field structures
    const variant = 
      car?.VariantName ||
      car?.Variant ||
      car?.data?.VariantName ||
      car?.data?.Variant ||
      car?.Car?.VariantName ||
      car?.Car?.Variant;
    
    return variant || '';
  };

  // Open handler for '+' button in images section
  const openAddThird = async () => {
    setAddThirdOpen(true);
    if (thirdBrandOptions.length === 0) {
      setThirdLoading(true);
      try {
        const resp = await axiosInstance1.get('/api/cargpt/brands/');
        const brands = Array.isArray((resp as any)?.data) ? (resp as any).data : (Array.isArray(resp) ? resp : []);
        setThirdBrandOptions(brands);
      } catch (_e) {
        setThirdBrandOptions([]);
      } finally {
        setThirdLoading(false);
      }
    }
  };

  const confirmThirdSelection = async () => {
    if (!thirdSelectedVariant?.VariantID) return;
    try {
      setLoading(true);
      setError(null);
      // Get the 3 car IDs for comparison
      const car1Id = (comparisonData as any)?.displayCar1?.VariantID || primaryCar?.VariantID;
      const car2Id = (comparisonData as any)?.displayCar2?.VariantID || (comparisonData as any)?.car2?.VariantID;
      // Prioritize CarID over VariantID for the third car
      const car3Id = thirdSelectedVariant?.CarID || thirdSelectedVariant?.VariantID;
      
      // Debug: Log the IDs being used for comparison
      console.log('Car IDs for comparison:', {
        car1Id,
        car2Id,
        car3Id,
        thirdSelectedVariant: {
          CarID: thirdSelectedVariant?.CarID,
          VariantID: thirdSelectedVariant?.VariantID,
          fullObject: thirdSelectedVariant
        }
      });

      // Call compare API with exactly 3 car IDs
      const resp: any = await axiosInstance1.post('/api/cargpt/compare/', { 
        car_ids: [car1Id, car2Id, car3Id].filter(Boolean) 
      });
      
      const cars = Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp) ? resp : []);
      
      // Use the exact cars returned from compare API for display purposes
      const [car1Data, car2Data, car3Data] = cars;
      
      // Debug: Log the data structure from compare API
      console.log('Compare API response cars:', {
        car1: car1Data,
        car2: car2Data,
        car3: car3Data,
        car3Images: car3Data?.CarImageDetails,
        car3Price: car3Data?.Price,
        car3Brand: car3Data?.BrandName,
        car3Model: car3Data?.ModelName,
        car3Variant: car3Data?.VariantName
      });
      
      // Fetch detailed car information for each car to get complete feature comparison data
      const [detailedCar1, detailedCar2, detailedCar3] = await Promise.all([
        fetchCarDetailsById(car1Data?.CarID || car1Data?.VariantID),
        fetchCarDetailsById(car2Data?.CarID || car2Data?.VariantID),
        fetchCarDetailsById(car3Data?.CarID || car3Data?.VariantID)
      ]);
      
      console.log('Detailed car data fetched:', {
        car1: detailedCar1,
        car2: detailedCar2,
        car3: detailedCar3
      });
      
      const payload: any = {
        car1: normalizeCar(detailedCar1),
        car2: normalizeCar(detailedCar2),
        displayCar1: car1Data, // Keep original compare API data for display
        displayCar2: car2Data,
      };
      const normalizedCar3 = normalizeCar(detailedCar3);
      payload.car1.__car3 = normalizedCar3;
      payload.car1.__displayCar3 = car3Data; // Keep original compare API data for display
      
      // Debug: Log the normalized third car data
      console.log('Normalized third car data:', {
        original: detailedCar3,
        normalized: normalizedCar3,
        finalPrice: normalizedCar3?.Price,
        finalPriceFromHelper: getCarPrice(normalizedCar3)
      });
      
            setComparisonData(payload as PairComparisonResponse & { displayCar1: any; displayCar2: any });
      setForceFullScreen(true);
      setIsViewingPairComparison(true);
      setAddThirdOpen(false);
      
      // Reset all third car selection fields after successful comparison
      setThirdSelectedBrand(null);
      setThirdSelectedModel(null);
      setThirdSelectedVariant(null);
      setThirdBrandOptions([]);
      setThirdModelOptions([]);
      setThirdVariantOptions([]);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch car details');
    } finally {
      setLoading(false);
    }
  };

  const renderSuggestedList = (primary: any, suggestions: any[]) => {
    // Remove duplicates that exactly match the primary car by VariantID or Model+Brand
    const filtered = (suggestions || []).filter((s: any) => {
      if (primary?.VariantID && s?.VariantID) {
        return s.VariantID !== primary.VariantID;
      }
      if (primary?.ModelName && s?.ModelName) {
        return (
          s.ModelName !== primary.ModelName ||
          (s.BrandName && primary.BrandName && s.BrandName !== primary.BrandName)
        );
      }
      return true;
    });

    if (!filtered.length)
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <Typography color="error">No comparison data available</Typography>
        </Box>
      );

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
        {filtered.map((s, idx) => (
          <Card
            key={idx}
            sx={{ border: '1px solid', borderColor: 'divider', p: 2 }}
            variant="outlined"
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {/* Left car */}
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Box sx={{ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={getCarImage(primary)}
                    alt={primary?.ModelName}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </Box>
                <Typography variant="subtitle1" fontWeight="bold">{primary?.BrandName} {primary?.ModelName}</Typography>
                {primary?.VariantName && (
                  <Chip label={primary.VariantName} size="small" sx={{ fontSize: '10px', mt: 0.5 }} />
                )}
                <Typography variant="body2" color="text.secondary">{formatPrice(primary?.Price || 0)}</Typography>
              </Box>

              {/* VS */}
              <Box sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: mode === 'dark' ? 'grey.700' : 'grey.200',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                VS
              </Box>

              {/* Right car */}
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Box sx={{ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={getCarImage(s)}
                    alt={s?.ModelName}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </Box>
                <Typography variant="subtitle1" fontWeight="bold">{s?.BrandName} {s?.ModelName}</Typography>
                {s?.VariantName && (
                  <Chip label={s.VariantName} size="small" sx={{ fontSize: '10px', mt: 0.5 }} />
                )}
                <Typography variant="body2" color="text.secondary">{formatPrice(s?.Price || 0)}</Typography>
              </Box>
            </Box>

            <Button
              fullWidth
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={async () => {
                try {
                  setLoading(true);
                  setError(null);
                  const leftId = getCarId(primary) || primary?.ModelID || primary?.id;
                  const rightId = getCarId(s) || s?.ModelID || s?.id;
                  const [left, right] = await Promise.all([
                    fetchCarDetailsById(leftId),
                    fetchCarDetailsById(rightId),
                  ]);
                  const normalizedLeft = normalizeCar(left);
                  const normalizedRight = normalizeCar(right);
                  setComparisonData({
                    car1: normalizedLeft,
                    car2: normalizedRight,
                    displayCar1: primary, // original object for image/details
                    displayCar2: s,
                  } as PairComparisonResponse & { displayCar1: any; displayCar2: any });
                  setForceFullScreen(true); // Force full screen when a pair comparison is loaded
                  setIsViewingPairComparison(true); // Set to true when viewing a pair comparison
                } catch (e: any) {
                  setError(e?.message || 'Failed to fetch car details');
                } finally {
                  setLoading(false);
                }
              }}
            >
              {getDisplayName(primary)} vs {getDisplayName(s)}
            </Button>
          </Card>
        ))}
        {/* Add-car placeholder card */}
        <Card
          key="add-car-card"
          sx={{ border: '1px solid', borderColor: 'divider', p: 2 }}
          variant="outlined"
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* Left car (primary) */}
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Box sx={{ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={getCarImage(primary)}
                  alt={primary?.ModelName}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </Box>
              <Typography variant="subtitle1" fontWeight="bold">{primary?.BrandName} {primary?.ModelName}</Typography>
              {primary?.VariantName && (
                <Chip label={primary.VariantName} size="small" sx={{ fontSize: '10px', mt: 0.5 }} />
              )}
              <Typography variant="body2" color="text.secondary">{formatPrice(primary?.Price || 0)}</Typography>
            </Box>

            {/* VS */}
            <Box sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: mode === 'dark' ? 'grey.700' : 'grey.200',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              VS
            </Box>

            {/* Right placeholder to add a car OR selectors */}
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              {selectedRightCar ? (
                <>
                  <Box sx={{ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <img
                      src={getCarImage(selectedRightCar)}
                      alt={selectedRightCar?.ModelName}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                    <IconButton
                      size="small"
                      sx={{ position: 'absolute', top: 0, right: 0, background: 'white', zIndex: 1 }}
                      onClick={() => {
                        setSelectedRightCar(null);
                        setSelectedBrand(null);
                        setSelectedModel(null);
                        setSelectedVariant(null);
                        setModelOptions([]);
                        setVariantOptions([]);
                      }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography variant="subtitle1" fontWeight="bold">{selectedRightCar?.BrandName} {selectedRightCar?.ModelName}</Typography>
                  {selectedRightCar?.VariantName && (
                    <Chip label={selectedRightCar.VariantName} size="small" sx={{ fontSize: '10px', mt: 0.5 }} />
                  )}
                  <Typography variant="body2" color="text.secondary">{formatPrice(selectedRightCar?.Price || 0)}</Typography>

                  {/* Moved button content from here */}
                </>
              ) : !isAddingRightCar ? (
                <>
                  <Box sx={{ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box
                      onClick={async () => {
                        setIsAddingRightCar(true);
                        if (brandOptions.length === 0) {
                          setLoadingAdd(true);
                          try {
                            const resp = await axiosInstance1.get('/api/cargpt/brands/');
                            const brands = Array.isArray(resp?.data) ? resp.data : (resp ?? []);
                            setBrandOptions(brands);
                          } catch (e) {
                            setBrandOptions([]);
                          } finally {
                            setLoadingAdd(false);
                          }
                        }
                      }}
                      sx={{
                        width: 110,
                        height: 110,
                        borderRadius: '50%',
                        border: '2px dashed',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'text.disabled',
                        cursor: 'pointer',
                      }}
                    >
                      <AddIcon fontSize="large" />
                    </Box>
                  </Box>
                  <Typography variant="subtitle1" color="text.secondary">Add Car</Typography>
                  {/* Moved button content from here */}
                </>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    width: '100%',
                    alignItems: 'stretch', // ensures children stretch
                  }}
                >
                  <Autocomplete
                    options={brandOptions}
                    getOptionLabel={(option) => option?.BrandName || ''}
                    value={selectedBrand}
                    onChange={async (event, newValue) => {
                      setSelectedBrand(newValue);
                      setSelectedModel(null);
                      setSelectedVariant(null);
                      setModelOptions([]);
                      setVariantOptions([]);
                      if (newValue?.BrandID) {
                        setLoadingAdd(true);
                        try {
                          const data = await axiosInstance1.post('/api/cargpt/models/', { brand_id: newValue.BrandID });
                          const models = Array.isArray((data as any)?.models) ? (data as any).models : (Array.isArray(data) ? data : []);
                          setModelOptions(models);
                        } catch (e) {
                          setModelOptions([]);
                        } finally {
                          setLoadingAdd(false);
                        }
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Brand"
                        variant="outlined"
                        size="small"
                        fullWidth
                      />
                    )}
                    loading={loadingAdd}
                    loadingText="Loading brands..."
                    sx={{ '& .MuiAutocomplete-inputRoot': { pr: '0 !important' } }} // Ensure full width, no extra padding
                  />
                  <Autocomplete
                    options={modelOptions}
                    getOptionLabel={(option) => option?.ModelName || ''}
                    value={selectedModel}
                    onChange={async (event, newValue) => {
                      setSelectedModel(newValue);
                      setSelectedVariant(null);
                      setVariantOptions([]);
                      if (newValue?.ModelID && selectedBrand?.BrandID) {
                        setLoadingAdd(true);
                        try {
                          const resp = await axiosInstance1.post(
                            '/api/cargpt/fetch-variants/',
                            { BrandID: selectedBrand.BrandID, ModelID: newValue.ModelID }
                          );
                          const variants = Array.isArray((resp as any)?.data) ? (resp as any).data : (Array.isArray(resp) ? resp : []);
                          setVariantOptions(variants);
                        } catch (e) {
                          setVariantOptions([]);
                        } finally {
                          setLoadingAdd(false);
                        }
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Model"
                        variant="outlined"
                        size="small"
                        fullWidth
                      />
                    )}
                    loading={loadingAdd}
                    loadingText="Loading models..."
                    sx={{ '& .MuiAutocomplete-inputRoot': { pr: '0 !important' } }} // Ensure full width, no extra padding
                  />
                  <Autocomplete
                    options={variantOptions}
                    getOptionLabel={(option) => option?.VariantName || ''}
                    value={selectedVariant}
                    onChange={async (event, newValue) => {
                      setSelectedVariant(newValue);
                      if (newValue?.VariantID || newValue?.CarID) {
                        setLoadingAdd(true);
                        try {
                          // Use the new helper function to get consistent car IDs
                          const primaryId = getCarId(primaryCar) || primaryCar?.id;
                          const newCarId = getCarId(newValue) || newValue?.id;
                          const payload = { car_ids: [primaryId, newCarId].filter(Boolean) };
                          const resp: any = await axiosInstance1.post('/api/cargpt/compare/', payload);
                          const arr = Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp) ? resp : []);
                          let right: any = null;
                          if (Array.isArray(arr) && arr.length > 0) {
                            right = arr.find((c: any) => getCarId(c) !== primaryId) || arr[0];
                          } else if (resp?.car1 || resp?.car2) {
                            right = (resp.car1 && (getCarId(resp.car1) !== primaryId)) ? resp.car1 : resp.car2;
                          }
                          setSelectedRightCar(right || newValue);
                          setIsAddingRightCar(false);
                        } catch (e) {
                          setSelectedRightCar(null);
                        } finally {
                          setLoadingAdd(false);
                        }
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Variant"
                        variant="outlined"
                        size="small"
                        fullWidth
                      />
                    )}
                    loading={loadingAdd}
                    loadingText="Loading variants..."
                    sx={{ '& .MuiAutocomplete-inputRoot': { pr: '0 !important' } }} // Ensure full width, no extra padding
                  />
                </Box>
              )}
            </Box>
          </Box>
          {selectedRightCar && (
            <Button
              fullWidth
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={async () => {
                try {
                  setLoading(true);
                  setError(null);
                  const leftId = getCarId(primary) || primary?.ModelID || primary?.id;
                  const rightId = getCarId(selectedRightCar) || selectedRightCar?.ModelID || selectedRightCar?.id;
                  const [left, right] = await Promise.all([
                    fetchCarDetailsById(leftId),
                    fetchCarDetailsById(rightId),
                  ]);
                  const normalizedLeft = normalizeCar(left);
                  const normalizedRight = normalizeCar(right);
                  setComparisonData({
                    car1: normalizedLeft,
                    car2: normalizedRight,
                    displayCar1: primary,
                    displayCar2: selectedRightCar,
                  } as PairComparisonResponse & { displayCar1: any; displayCar2: any });
                  setForceFullScreen(true);
                  setIsViewingPairComparison(true);
                } catch (e: any) {
                  setError(e?.message || 'Failed to fetch car details');
                } finally {
                  setLoading(false);
                }
              }}
            >
              {getDisplayName(primary)} vs {getDisplayName(selectedRightCar)}
            </Button>
          )}

          {!selectedRightCar && !isAddingRightCar && selectedBrand && selectedModel && selectedVariant && variantOptions.length > 0 && (
            <Button
              fullWidth
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={async () => {
                setIsAddingRightCar(true);
                if (brandOptions.length === 0) {
                  setLoadingAdd(true);
                  try {
                    const resp = await axiosInstance1.get('/api/cargpt/brands/');
                    const brands = Array.isArray(resp?.data) ? resp.data : (resp ?? []);
                    setBrandOptions(brands);
                  } catch (e) {
                    setBrandOptions([]);
                  } finally {
                    setLoadingAdd(false);
                  }
                }
              }}
            >
              Add Car
            </Button>
          )}
        </Card>
      </Box>
    );
  };

const FEATURES_TO_COMPARE = {
  BasicDetails: [
    'BrandName',
    'ModelName',
    'VariantName',
    'Price',
  ],
  Engine: [
    'GearBox',
    'SportsModeDrive',
    'Transmission',
    'EngineCapacity',
    'EngineConf',
    'GearConf',
    'DriveType',
    'MaxPowerBhp',
    'MaxPowerRpm',
    'MaxTorqueBhp',
    'MaxTorqueRpm',
    'Cylinder',
    'Valves',
    'FuelTank',
  ],
  Interior: [
    'Doors',
    'PowerSteering',
    'AC',
    'AutomaticClimateControl',
    'RemoteTrunkOpener',
    'AccessoryPowerOutlet',
    'KeyRemote',
    'LeatherSeats',
    'DualToneDashboard',
  ],
  DRIVERDISPLAY: [
    'DigitalTachometer',
    'ElectronicMultiTripmeter',
    'DigitalClock',
    'DigitalOdometer',
    'DigitalFuelGuage',
    'DistanceToEmpty',
    'FuelComsumptionAverage',
    'LastFilledAverage',
    'EngineMalfunctionLight',
    'MobileReminder',
    'ParkingReminder',
  ],
  AutomationsID: [
    'CruiseControl',
    'CruiseControlSpeeding',
    'AutomaticHeadlamps',
    'RainSensingWiperFront',
    'RainSensingWiperRear',
    'RainMotionSensor',
    'AutoPilot',
    'AutoEngineOff',
  ],
  PARKINGSUPPORT: [
    'ParkingSensorsFront',
    'ParkingSensorsRear',
    'ParkingCamera',
    'FollowMeHeadLights',
    'Camera360',
    // 'CarImages',
  ],
  EXTERIOR: [
    'AdjustableHeadlights',
    'FogLightsFront',
    'FogLightsRear',
    'PowerAdjustableViewMirror',
    'ElectricFoldingViewMirror',
    'RearWindowWiper',
    'RearWindowDefogger',
    'WheelCovers',
    'PowerAntenna',
    'RearSpoiler',
    'SunRoof',
    'MoonRoof',
    'RearMirrorTurnIndicators',
    'CorneringFoglamps',
    'RoofRail',
    'LEDDRLs',
    'LEDHeadlights',
    'LEDTaillights',
    'DualToneRoof',
    'LuggageHookNet',
  ],
  Luxury: [
    'PowerWindowsFront',
    'PowerWindowsRear',
    'AdjustableSteering',
    'HeightAdjustableDriverSeat',
    'ElectricAdjustableSeat',
    'VentilatedSeats',
    'VanityMirrorNightMode',
    'CosmeticMirror',
    'CosmeticMirrorIllumination',
    'RearReadingLamp',
    'RearSeatHeadrest',
    'AdjustableHeadrestFrontRow',
    'AdjustableHeadrestAllRow',
    'CigaratteLighter',
    'AutoFuelLidOpener',
    'RearSeatCentreArmRest',
    'CupHoldersFront',
    'CupHoldersRear',
    'RearACVents',
    'SeatLumbar',
    'FoldableRearSeat',
    'SmartEntrySystem',
    'KeyLessEntry',
    'ButtonStart',
    'ButtonParkingBreak',
    'GloveBoxCooling',
    'SteeringWheelGearshiftPaddles',
    'USBChargerFront',
    'USBChargerRear',
    'CentralConsoleArmrest',
    'CentralConsoleStorage',
    'RearCurtain',
    'AmbientLED',
    'AmbientLEDShades',
    'Heating',
    'MultiFunctionSteering',
    'LeatherSteeringWheel',
  ],
  Safety: [
    'AntiLockBrakingSystem',
    'BrakeAssist',
    'CentralLocking',
    'PowerDoorLocks',
    'ChildSafetyLocks',
    'AntiTheftAlarm',
    'DriverAirbag',
    'PassengerAirbag',
    'SideAirbagFront',
    'AirbagCount',
    'RearSeatBelts',
    'SeatBeltWarning',
    'DoorAjarWarning',
    'TractionControl',
    'TyrePressureMonitor',
    'HeadLightReminder',
    'LowFuelWarning',
    'EngineImmobilizer',
    'CrashSensor',
    'EngineCheckWarning',
    'EBD',
    'ElectronicStabilityControl',
    'SpeedSensingAutoDoorLock',
    'ISOFIXChildSeatMounts',
    'HillAssist',
    'GlobalNCAPSafetyRating',
    'GlobalNCAPChildSafetyRating',
    'GPSCarTracker',
    'Indicator360View',
    'OverSpeedIndicator',
    'InsideKeySensor',
  ],
  ENTERTAINMENTANDCONNECT: [
    'AudioSystem',
    'RadioFM',
    'RadioAM',
    'InfotainmentLEDScreen',
    'InfotainmentScreenTouch',
    'SpeakersFront',
    'SpeakersRear',
    'WirelessPhoneCharging',
    'Bluetooth',
    'TouchScreen',
    'TouchScreenSize',
    'Connectivity',
    'AndroidAuto',
    'AppleCarPlay',
    'Speakers',
    'Woofers',
    'AuxIn',
    'NavigationSystem',
  ],
};

const CATEGORY_ICONS: { [key: string]: React.ElementType } = {
  BasicDetails: InfoIcon,
  Engine: EngineIcon,
  Interior: InteriorIcon,
  DRIVERDISPLAY: DriverDisplayIcon,
  AutomationsID: AutomationIcon,
  PARKINGSUPPORT: ParkingSupportIcon,
  EXTERIOR: ExteriorIcon,
  Luxury: LuxuryIcon,
  Safety: SafetyIcon,
  ENTERTAINMENTANDCONNECT: EntertainmentIcon,
};

interface FeatureComparisonTableProps {
  car1: any;
  car2: any;
  mode: 'light' | 'dark';
  theme: any;
  onRequestAddThirdCar?: () => void;
}

// Helper to robustly get all car images from any possible field
const getAllCarImages = (car: any) => {
  if (Array.isArray(car?.CarImageDetails) && car.CarImageDetails.length > 0) return car.CarImageDetails;
  if (Array.isArray(car?.images) && car.images.length > 0) return car.images;
  if (Array.isArray(car?.data?.CarImageDetails) && car.data.CarImageDetails.length > 0) return car.data.CarImageDetails;
  if (Array.isArray(car?.data?.images) && car.data.images.length > 0) return car.data.images;
  if (Array.isArray(car?.Car?.CarImageDetails) && car.Car.CarImageDetails.length > 0) return car.Car.CarImageDetails;
  if (Array.isArray(car?.Car?.images) && car.Car.images.length > 0) return car.Car.images;
  return [];
};

const FeatureComparisonTable: React.FC<FeatureComparisonTableProps> = ({ car1, car2, mode, theme, onRequestAddThirdCar }) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  // Make car1Images and car2Images available throughout the component
  const car1Images = getAllCarImages(car1);
  const car2Images = getAllCarImages(car2);

  // Car Images Section logic as a variable
  let carImagesSection = null;
  const maxImages = 5;
  if (car1Images.length > 0 || car2Images.length > 0) {
    carImagesSection = (
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2, mb: 1, borderBottom: '1px solid', borderColor: 'divider', pb: 0.5 }}>
          Car Images
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            alignItems: 'center',
            py: 1,
            borderBottom: '1px dotted',
            borderColor: 'divider',
            '&:last-child': { borderBottom: 'none' },
          }}
        >
          {[...Array(maxImages)].map((_, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {/* Car 1 image */}
              <Box sx={{ width: 150, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', borderRadius: 2 }}>
                {car1Images[idx] ? (
                  <img
                    src={car1Images[idx]?.CarImageURL || '/assets/card-img.png'}
                    alt={`Car 1 Image ${idx + 1}`}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <Typography color="text.secondary">-</Typography>
                )}
              </Box>
              {/* VS */}
              <Box sx={{ width: 40, textAlign: 'center', fontWeight: 'bold', fontSize: 20, color: 'text.secondary' }}>VS</Box>
              {/* Car 2 image */}
              <Box sx={{ width: 150, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', borderRadius: 2 }}>
                {car2Images[idx] ? (
                  <img
                    src={car2Images[idx]?.CarImageURL || '/assets/card-img.png'}
                    alt={`Car 2 Image ${idx + 1}`}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <Typography color="text.secondary">-</Typography>
                )}
              </Box>
              {/* Car 3 image if present */}
              {(car1 as any)?.__car3 && (
                <>
                  {/* VS */}
                  <Box sx={{ width: 40, textAlign: 'center', fontWeight: 'bold', fontSize: 20, color: 'text.secondary' }}>VS</Box>
                  {/* Car 3 image */}
                  <Box sx={{ width: 150, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', borderRadius: 2 }}>
                    {(() => {
                      const thirdCarImages = getAllCarImages((car1 as any).__car3);
                      return thirdCarImages[idx] ? (
                        <img
                          src={thirdCarImages[idx]?.CarImageURL || '/assets/card-img.png'}
                          alt={`Car 3 Image ${idx + 1}`}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <Typography color="text.secondary">-</Typography>
                      );
                    })()}
                  </Box>
                </>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  const getFeatureValue = (car: any, category: string, feature: string) => {
    // For BasicDetails, check directly on the car object first, or common nested paths
    if (category === 'BasicDetails') {
      let value: any;
      if (feature === 'Price') {
        value = car?.Price || car?.data?.Price || car?.Car?.Price;
        return formatPrice(value || 0);
      }
      value = car?.[feature] || car?.data?.[feature] || car?.Car?.[feature];
      if (value !== null && value !== undefined && value !== '') {
        return String(value);
      }
      return <ClearIcon fontSize="small" color="error" />;
    }

    if (feature === 'CarImages') {
      const images = car?.CarImageDetails || car?.images || car?.data?.CarImageDetails || car?.data?.images;
      if (!images || images.length === 0) return <ClearIcon fontSize="small" color="error" />;
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
          {images.map((img: any, idx: number) => (
            <img
              key={idx}
              src={img?.CarImageURL || '/assets/card-img.png'}
              alt={`Car Image ${idx + 1}`}
              style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }}
            />
          ))}
        </Box>
      );
    }
    
    // For other features, first check under the category, then directly on the car object, then common nested paths
    const value = car?.[category]?.[feature] || car?.[feature] || car?.data?.[feature] || car?.Car?.[feature];
    
    if (typeof value === 'boolean' || (typeof value === 'number' && (value === 0 || value === 1))) {
      return value ? <CheckIcon fontSize="small" color="success" /> : <ClearIcon fontSize="small" color="error" />;
    }
    if (value === null || value === undefined || value === '') {
      return <ClearIcon fontSize="small" color="error" />;
    }
    return String(value);
  };

  return (
    <Box sx={{ mt: 3, p: 2, backgroundColor: mode === 'dark' ? 'grey.800' : '#ffffff', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom fontWeight="bold" sx={{mb:2}}>
        Detailed Feature Comparison
      </Typography>

      {Object.entries(FEATURES_TO_COMPARE).map(([category, features]) => {
        const IconComponent = CATEGORY_ICONS[category] || InfoIcon; // Default to InfoIcon
        const isExpanded = expandedCategories[category];
        const displayedFeatures = isExpanded ? features : features.slice(0, 4);

        return (
        <Box key={category} sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2, mb: 1, borderBottom: '1px solid', borderColor: 'divider', pb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconComponent fontSize="small" />
            {category.replace(/([A-Z])/g, ' $1').trim()}
          </Typography>
            {displayedFeatures.map((feature) => {
            const car1Value = getFeatureValue(car1, category, feature);
            const car2Value = getFeatureValue(car2, category, feature);
            const isDifferent = car1Value !== car2Value;

            return (
              <Box
                key={feature}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  py: 1,
                  borderBottom: '1px dotted',
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                <Typography variant="body2" sx={{ flex: 1, fontWeight: 'bold' }}>
                  {feature.replace(/([A-Z])/g, ' $1').trim()}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    flex: 1,
                    textAlign: 'center',
                    color: isDifferent ? (mode === 'dark' ? theme.palette.info.light : theme.palette.info.dark) : 'text.primary',
                  }}
                >
                  {car1Value}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    flex: 1,
                    textAlign: 'center',
                    color: isDifferent ? (mode === 'dark' ? theme.palette.info.light : theme.palette.info.dark) : 'text.primary',
                  }}
                >
                  {car2Value}
                </Typography>
                {(car1 as any)?.__car3 && (
                  <Typography
                    variant="body2"
                    sx={{ flex: 1, textAlign: 'center', color: 'text.primary' }}
                  >
                    {getFeatureValue((car1 as any).__car3, category, feature)}
                  </Typography>
                )}
              </Box>
            );
          })}
            {features.length > 4 && (
              <Button
                // fullWidth
                variant="outlined"
                sx={{ mt: 2, width: 'fit-content' }} // Added width: 'fit-content'
                onClick={() =>
                  setExpandedCategories((prev) => ({
                    ...prev,
                    [category]: !prev[category],
                  }))
                }
                startIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              >
                {isExpanded ? 'View Less' : 'View More'}
              </Button>
            )}
        </Box>
        );
      })}

      {/* Render Car Images Section here */}
      {carImagesSection}
    </Box>
  );
};

// Pair details card for pair comparison view
const PairDetailsCard = ({ car1, car2, displayCar1, displayCar2, mode, theme, onRequestAddThirdCar }: { car1: any; car2: any; displayCar1?: any; displayCar2?: any; mode: string; theme: any; onRequestAddThirdCar?: () => void }) => {
  // Use displayCar1/displayCar2 for image/details if present, else fallback to car1/car2
  const left = displayCar1 || car1;
  const right = displayCar2 || car2;
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  // Helper to highlight differences
  const highlightIfDifferent = (val1: any, val2: any, children: React.ReactNode) => {
    const isDifferent = val1 !== val2;
    return (
      <span style={{
        color: isDifferent ? (mode === 'dark' ? theme.palette.info.light : theme.palette.info.dark) : undefined,
        fontWeight: isDifferent ? 'bold' : undefined,
      }}>
        {children}
      </span>
    );
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 6, mb: 3, mt: 2 }}>
      {/* Add third car column (first) */}
      {!isSmall && onRequestAddThirdCar && (
        <Box sx={{ width: 260, textAlign: 'center' }}>
          <Box
            onClick={onRequestAddThirdCar}
            sx={{
              width: isSmall ? 72 : 110,
              height: isSmall ? 72 : 110,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              border: '2px dashed',
              borderColor: 'divider',
              background: '#fafafa',
              color: 'text.disabled',
              cursor: 'pointer',
            }}
          >
            <AddIcon sx={{ fontSize: isSmall ? 24 : 36 }} />
          </Box>
        </Box>
      )}

      {/* VS between Add Car and Car 1 */}
      {!isSmall && onRequestAddThirdCar && (
        <Box sx={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          backgroundColor: mode === 'dark' ? 'grey.700' : 'grey.200',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          mt: 6,
        }}>
          VS
        </Box>
      )}

      {/* Car 1 column */}
      <Box sx={{ width: 260, textAlign: 'center' }}>
        <Box sx={{ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
          <img src={getCarImage(left)} alt={left?.ModelName} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        </Box>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1 }}>
          {highlightIfDifferent(left?.BrandName, right?.BrandName, left?.BrandName)} {highlightIfDifferent(left?.ModelName, right?.ModelName, left?.ModelName)}
        </Typography>
        {left?.VariantName && <Chip label={left.VariantName} size="small" sx={{ fontSize: '10px', mt: 0.5 }} />}
        <Typography variant="body2" color="text.secondary">{highlightIfDifferent(left?.Price, right?.Price, `₹${formatInternational(left?.Price || 0)}`)}</Typography>
      </Box>

      {/* VS between Car 1 and Car 2 */}
      <Box onClick={isSmall ? onRequestAddThirdCar : undefined} sx={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        backgroundColor: mode === 'dark' ? 'grey.700' : 'grey.200',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        mt: 6,
        cursor: isSmall && onRequestAddThirdCar ? 'pointer' : 'default',
        border: isSmall && onRequestAddThirdCar ? '2px dashed' : undefined,
        borderColor: isSmall && onRequestAddThirdCar ? 'divider' : undefined,
      }}>{isSmall ? <AddIcon sx={{ fontSize: 18 }} /> : 'VS'}</Box>

      {/* Car 2 column */}
      <Box sx={{ width: 260, textAlign: 'center' }}>
        <Box sx={{ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
          <img src={getCarImage(right)} alt={right?.ModelName} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        </Box>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1 }}>
          {highlightIfDifferent(right?.BrandName, left?.BrandName, right?.BrandName)} {highlightIfDifferent(right?.ModelName, left?.ModelName, right?.ModelName)}
        </Typography>
        {right?.VariantName && <Chip label={right.VariantName} size="small" sx={{ fontSize: '10px', mt: 0.5 }} />}
        <Typography variant="body2" color="text.secondary">{highlightIfDifferent(right?.Price, left?.Price, `₹${formatInternational(right?.Price || 0)}`)}</Typography>
      </Box>

      {/* VS between Car 2 and Car 3 */}
      {(((car1 as any).__displayCar3) || (car1 as any).__car3) && (
        <Box sx={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          backgroundColor: mode === 'dark' ? 'grey.700' : 'grey.200',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          mt: 6,
        }}>
          VS
        </Box>
      )}

      {/* Car 3 column if present */}
      {(((car1 as any).__displayCar3) || (car1 as any).__car3) && (
        <Box sx={{ width: 260, textAlign: 'center' }}>
          {(() => {
            const thirdCar = ((car1 as any).__displayCar3) || (car1 as any).__car3;
            const thirdCarImage = getCarImage(thirdCar);
            
            // Debug: Log third car data including price
            console.log('Third car in PairDetailsCard:', {
              thirdCar,
              imageUrl: thirdCarImage,
              brand: getCarBrand(thirdCar),
              model: getCarModel(thirdCar),
              variant: getCarVariant(thirdCar),
              price: getCarPrice(thirdCar),
              brandFields: {
                BrandName: thirdCar?.BrandName,
                Brand: thirdCar?.Brand,
                'data.BrandName': thirdCar?.data?.BrandName,
                'data.Brand': thirdCar?.data?.Brand,
                'Car.BrandName': thirdCar?.Car?.BrandName,
                'Car.Brand': thirdCar?.Car?.Brand
              },
              modelFields: {
                ModelName: thirdCar?.ModelName,
                Model: thirdCar?.Model,
                'data.ModelName': thirdCar?.data?.ModelName,
                'data.Model': thirdCar?.data?.Model,
                'Car.ModelName': thirdCar?.Car?.ModelName,
                'Car.Model': thirdCar?.Car?.Model
              },
              variantFields: {
                VariantName: thirdCar?.VariantName,
                Variant: thirdCar?.Variant,
                'data.VariantName': thirdCar?.data?.VariantName,
                'data.Variant': thirdCar?.data?.Variant,
                'Car.VariantName': thirdCar?.Car?.VariantName,
                'Car.Variant': thirdCar?.Car?.Variant
              },
              priceFields: {
                Price: thirdCar?.Price,
                'data.Price': thirdCar?.data?.Price,
                'Car.Price': thirdCar?.Car?.Price,
                'data.car.Price': thirdCar?.data?.car?.Price,
                'car.Price': thirdCar?.car?.Price
              },
              imageFields: {
                CarImageDetails: thirdCar?.CarImageDetails,
                images: thirdCar?.images,
                CarImageURL: thirdCar?.CarImageURL,
                ImageURL: thirdCar?.ImageURL
              }
            });
            
            return (
              <>
                <Box sx={{ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
                  <img src={thirdCarImage} alt={thirdCar?.ModelName} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </Box>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1 }}>
                  {getCarBrand(thirdCar)} {getCarModel(thirdCar)}
                </Typography>
                {getCarVariant(thirdCar) && <Chip label={getCarVariant(thirdCar)} size="small" sx={{ fontSize: '10px', mt: 0.5 }} />}
                <Typography variant="body2" color="text.secondary">₹{formatInternational(getCarPrice(thirdCar))}</Typography>
              </>
            );
          })()}
        </Box>
      )}

    </Box>
  );
};

  return (
    <Dialog
      open={open}
      onClose={() => {
        setForceFullScreen(false); // Reset when closing
        
        // Reset all third car selection fields when main dialog is closed
        setThirdSelectedBrand(null);
        setThirdSelectedModel(null);
        setThirdSelectedVariant(null);
        setThirdBrandOptions([]);
        setThirdModelOptions([]);
        setThirdVariantOptions([]);
        setAddThirdOpen(false);
        
        onClose();
      }}
      fullScreen={isMobile || forceFullScreen}
      maxWidth={isMobile ? undefined : 'md'}
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: mode === 'dark' ? theme.palette.background.paper : '#ffffff',
          ...(isMobile && {
            m: 0,
            width: '100%',
            height: '100dvh',
            maxWidth: '100%',
            maxHeight: '100dvh',
            overflowX: 'hidden',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 0,
          }),
        },
      }}
    >

      <DialogContent sx={{ p: 0 }}>
        {/* Blue theme navbar */}
        <Box sx={{ position: 'sticky', top: 0, zIndex: 2, mb: 2 }}>
          <AppBar position="static" color="primary" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
            <Toolbar sx={{ minHeight: { xs: 64, sm: 72 } }}>
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => {
                  if (isViewingPairComparison) {
                    setForceFullScreen(false); // Reset when navigating back to suggested list
                    fetchComparisonData(); // Re-fetch suggested comparisons
                    setIsViewingPairComparison(false);
                    
                    // Reset all third car selection fields when going back to suggested list
                    setThirdSelectedBrand(null);
                    setThirdSelectedModel(null);
                    setThirdSelectedVariant(null);
                    setThirdBrandOptions([]);
                    setThirdModelOptions([]);
                    setThirdVariantOptions([]);
                    setAddThirdOpen(false);
                  } else {
                    onClose(); // Close dialog if on suggested list
                  }
                }}
                aria-label="back"
                size="small"
                sx={{ mr: 1 }}
              >
                <KeyboardBackspaceSharp />
              </IconButton>
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1 }}>
                  Compare Cars
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Comparing {carName} with similar cars
                </Typography>
              </Box>
            </Toolbar>
          </AppBar>
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (comparisonData as SuggestedComparisonResponse)?.comparisons?.length ? (
          renderSuggestedList(primaryCar, (comparisonData as SuggestedComparisonResponse).comparisons || [])
        ) : (comparisonData as PairComparisonResponse)?.car1 && (comparisonData as PairComparisonResponse)?.car2 ? (
          <Box>
            <PairDetailsCard
              car1={(comparisonData as PairComparisonResponse).car1}
              car2={(comparisonData as PairComparisonResponse).car2}
              displayCar1={(comparisonData as any).displayCar1}
              displayCar2={(comparisonData as any).displayCar2}
              mode={mode}
              theme={theme}
              onRequestAddThirdCar={openAddThird}
            />
            <FeatureComparisonTable
              car1={(comparisonData as PairComparisonResponse).car1}
              car2={(comparisonData as PairComparisonResponse).car2}
              mode={mode}
              theme={theme}
              onRequestAddThirdCar={openAddThird}
            />
          </Box>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <Typography color="text.secondary">No comparison data available</Typography>
          </Box>
        )}
      </DialogContent>
      {/* Remove DialogActions and close button entirely */}
      {/* Small dialog to add third car for comparison */}
      <Dialog open={addThirdOpen} onClose={() => {
        setAddThirdOpen(false);
        // Reset all third car selection fields when dialog is closed
        setThirdSelectedBrand(null);
        setThirdSelectedModel(null);
        setThirdSelectedVariant(null);
        setThirdBrandOptions([]);
        setThirdModelOptions([]);
        setThirdVariantOptions([]);
      }} maxWidth="sm" fullWidth>
        <DialogTitle>Select car to compare</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Autocomplete
              options={thirdBrandOptions}
              getOptionLabel={(o) => o?.BrandName || ''}
              value={thirdSelectedBrand}
              onChange={async (_e, newValue) => {
                setThirdSelectedBrand(newValue);
                setThirdSelectedModel(null);
                setThirdSelectedVariant(null);
                setThirdModelOptions([]);
                setThirdVariantOptions([]);
                if (newValue?.BrandID) {
                  setThirdLoading(true);
                  try {
                    const data = await axiosInstance1.post('/api/cargpt/models/', { brand_id: newValue.BrandID });
                    const models = Array.isArray((data as any)?.models) ? (data as any).models : (Array.isArray(data) ? data : []);
                    setThirdModelOptions(models);
                  } catch (_e) {
                    setThirdModelOptions([]);
                  } finally {
                    setThirdLoading(false);
                  }
                }
              }}
              renderInput={(params) => <TextField {...params} label="Brand" size="small" />}
              loading={thirdLoading}
            />
            <Autocomplete
              options={thirdModelOptions}
              getOptionLabel={(o) => o?.ModelName || ''}
              value={thirdSelectedModel}
              onChange={async (_e, newValue) => {
                setThirdSelectedModel(newValue);
                setThirdSelectedVariant(null);
                setThirdVariantOptions([]);
                if (newValue?.ModelID && thirdSelectedBrand?.BrandID) {
                  setThirdLoading(true);
                  try {
                    const resp = await axiosInstance1.post('/api/cargpt/fetch-variants/', { BrandID: thirdSelectedBrand.BrandID, ModelID: newValue.ModelID });
                    const variants = Array.isArray((resp as any)?.data) ? (resp as any).data : (Array.isArray(resp) ? resp : []);
                    setThirdVariantOptions(variants);
                  } catch (_e) {
                    setThirdVariantOptions([]);
                  } finally {
                    setThirdLoading(false);
                  }
                }
              }}
              renderInput={(params) => <TextField {...params} label="Model" size="small" />}
              loading={thirdLoading}
            />
            <Autocomplete
              options={thirdVariantOptions}
              getOptionLabel={(o) => o?.VariantName || ''}
              value={thirdSelectedVariant}
              onChange={(_e, newValue) => setThirdSelectedVariant(newValue)}
              renderInput={(params) => <TextField {...params} label="Variant" size="small" />}
              loading={thirdLoading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAddThirdOpen(false);
            // Reset all third car selection fields when cancelled
            setThirdSelectedBrand(null);
            setThirdSelectedModel(null);
            setThirdSelectedVariant(null);
            setThirdBrandOptions([]);
            setThirdModelOptions([]);
            setThirdVariantOptions([]);
          }}>Cancel</Button>
          <Button variant="contained" onClick={confirmThirdSelection} disabled={!thirdSelectedVariant}>Compare</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default CompareCarsDialog;
