"use client"
import React, { useState, useEffect, useRef } from 'react';
import BrandName from '@/components/common/BrandName';
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
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

import { axiosInstance1 } from '@/utils/axiosInstance';
import { formatInternational } from '@/utils/services';
import { useColorMode } from '@/Context/ColorModeContext';
import { useAndroidBackClose } from '@/hooks/useAndroidBackClose';
import { useSnackbar } from '@/Context/SnackbarContext';
import { useLoginDialog } from '@/Context/LoginDialogContextType';
import ShareButtons from '@/components/common/ShareButtons';
import { Capacitor } from '@capacitor/core';

interface CompareCarsDialogProps {
  open: boolean;
  onClose: () => void;
  variantId: number;
  carName: string;
  primaryCar: any; // full object of the selected car
  // If provided, the dialog should open directly in pair comparison view
  // using these two cars as the initial selection. We will fetch detailed
  // data for each via api/cargpt/car-details/ before rendering the table.
  initialData?: {
    car1: any;
    car2: any;
  } | null;
}

type SuggestedComparisonResponse = {
  mode?: string; // "suggested"
  comparisons?: any[]; // list of suggested cars to compare with primaryCar
};

type PairComparisonResponse = {
  car1: any;
  car2: any;
  additionalCars?: any[]; // Array of additional cars (car3, car4, car5, etc.)
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
  initialData,
}) => {
  const [comparisonData, setComparisonData] = useState<
    SuggestedComparisonResponse | PairComparisonResponse | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const { mode } = useColorMode();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // Keep a consistent column width across mobile header and table values
  const mobileColumnWidth = 110;
  // Keep desktop (>= sm) columns aligned with the car cards width
  const desktopColumnWidth = 200;
  useAndroidBackClose(open && isMobile, onClose);
  const { showSnackbar } = useSnackbar();
  const { show: showLogin } = useLoginDialog();

  // Reusable soft pill Chip styles
  const chipSoft = {
    px: 1.25,
    py: 0.25,
    borderRadius: 9999,
    backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
    border: '1px solid',
    borderColor: 'divider',
    color: 'text.primary',
    height: 'auto',
    display: 'block',
    mx: 'auto',
    width: 'fit-content',
    '& .MuiChip-label': {
      px: 0,
      whiteSpace: 'normal',
      overflow: 'visible',
      lineHeight: 1.2,
    },
  } as const;

  const chipVariantSx = {
    ...chipSoft,
    fontWeight: 600,
  } as const;

  const chipInfoSx = {
    ...chipSoft,
  } as const;

  // Helper to render AI score on two lines
  const renderAIScoreLabel = (score: any) => (
    <span>
      AICarAdvisor Score:
      <br />
      {String(score)}
    </span>
  );

  // Plain text styles for AI score and sentiments (no boxes)
  const textLineSx = {
    display: 'block',
    textAlign: 'center',
    color: 'text.primary',
    fontSize: isMobile ? '10px' : '12px',
    mb: isMobile ? 0.25 : 1,
    mt: isMobile ? 0.5 : 1,
    lineHeight: 1.3,
  } as const;

  // Lightweight token reader to check authentication state
  const getTokenFromCookies = (): string | null => {
    try {
      const name = 'token=';
      const decoded = decodeURIComponent(document.cookie || '');
      const parts = decoded.split(';');
      for (let cookie of parts) {
        cookie = cookie.trim();
        if (cookie.startsWith(name)) return cookie.substring(name.length);
      }
    } catch (_e) {}
    return null;
  };

  const getUserFromCookies = (): string | null => {
    try {
      const name = 'user=';
      const decoded = decodeURIComponent(document.cookie || '');
      const parts = decoded.split(';');
      for (let cookie of parts) {
        cookie = cookie.trim();
        if (cookie.startsWith(name)) return cookie.substring(name.length);
      }
    } catch (_e) {}
    return null;
  };

  // State to force full screen mode
  const [forceFullScreen, setForceFullScreen] = useState(false);
  const [isViewingPairComparison, setIsViewingPairComparison] = useState(false);
  const [bookmarkStates, setBookmarkStates] = useState<Record<number, boolean>>({});

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
    // The API expects car_id parameter, which can be either CarID or VariantID
    const raw = { car_id: carId }
    const resp = await axiosInstance1.post(
      '/api/cargpt/car-details/',
      raw
    );
    try {
      return resp;
    } catch (_e) {
      return [];
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
      AIScore: carData?.AIScore || carData?.data?.AIScore || carData?.Car?.AIScore,
      AISummary: carData?.AISummary || carData?.data?.AISummary || carData?.Car?.AISummary,
      is_bookmarked: carData?.is_bookmarked || carData?.data?.is_bookmarked || carData?.Car?.is_bookmarked || false,
    };
    return normalized;
  };

  useEffect(() => {
    const loadFromInitialPair = async () => {
      try {
        if (!initialData?.car1 || !initialData?.car2) return false;
        setLoading(true);
        setError(null);

        const leftId = getCarId(initialData.car1);
        const rightId = getCarId(initialData.car2);
        if (!leftId || !rightId) return false;

        const [leftDetails, rightDetails] = await Promise.all([
          fetchCarDetailsById(leftId),
          fetchCarDetailsById(rightId),
        ]);

        const normalizedLeft = {
          ...normalizeCar(leftDetails),
          AIScore: initialData.car1?.AIScore ?? leftDetails?.AIScore,
          AISummary: initialData.car1?.AISummary ?? leftDetails?.AISummary,
        };
        const normalizedRight = {
          ...normalizeCar(rightDetails),
          AIScore: initialData.car2?.AIScore ?? rightDetails?.AIScore,
          AISummary: initialData.car2?.AISummary ?? rightDetails?.AISummary,
        };

        setComparisonData({
          car1: normalizedLeft,
          car2: normalizedRight,
          displayCar1: initialData.car1,
          displayCar2: initialData.car2,
          additionalCars: [],
        } as any);

        // Initialize bookmark states
        const newBookmarkStates: Record<number, boolean> = {};
        const leftVarId = getCarId(initialData.car1);
        const rightVarId = getCarId(initialData.car2);
        if (leftVarId) newBookmarkStates[leftVarId] = !!initialData.car1?.is_bookmarked;
        if (rightVarId) newBookmarkStates[rightVarId] = !!initialData.car2?.is_bookmarked;
        setBookmarkStates(newBookmarkStates);

        setForceFullScreen(true);
        setIsViewingPairComparison(true);
        return true;
      } catch (e: any) {
        // fall back to suggested flow
        return false;
      } finally {
        setLoading(false);
      }
    };

    (async () => {
      if (!open) return;
      setSelectedRightCar(null);
      // If initial pair provided, try to load pair view; otherwise default
      const loaded = await loadFromInitialPair();
      if (!loaded && variantId) {
        fetchComparisonData();
      }
    })();
    // eslint-disable-next-line
  }, [open, variantId, initialData]);

  const fetchComparisonData = async () => {
    setLoading(true);
    setError(null);
    setIsViewingPairComparison(false); // Reset to suggested view when fetching initial data

    try {
      // New API contract expects an array of variant IDs under the key `variants`
      const payload = { variants: [variantId] };
      const response: SuggestedComparisonResponse | PairComparisonResponse = await axiosInstance1.post('/api/cargpt/compare_cars/', payload);
      const data = response || {}; // Ensure data is an object, even if API returns null

      if (data && Object.keys(data).length > 0) { // Check if data is not empty
        setComparisonData(data as any);
        const newBookmarkStates: Record<number, boolean> = {};
        // Initialize primary car's bookmark state
        if (primaryCar?.VariantID) {
          newBookmarkStates[primaryCar.VariantID] = primaryCar.is_bookmarked || false;
        }
        // Initialize suggested comparisons' bookmark states
        if (data && typeof data === 'object' && 'comparisons' in data && Array.isArray((data as SuggestedComparisonResponse).comparisons)) {
          const suggestedData = data as SuggestedComparisonResponse;
          const validComparisons: any[] = suggestedData.comparisons || []; // Ensure it's an array
          validComparisons.forEach((car: any) => {
            if (car?.VariantID) {
              newBookmarkStates[car.VariantID] = car.is_bookmarked || false;
            }
          });
        } else if (data && typeof data === 'object' && ('car1' in data || 'car2' in data || 'additionalCars' in data)) {
          const pairData = data as PairComparisonResponse;
          if (pairData.car1?.VariantID) {
            newBookmarkStates[pairData.car1.VariantID] = pairData.car1.is_bookmarked || false;
          }
          if (pairData.car2?.VariantID) {
            newBookmarkStates[pairData.car2.VariantID] = pairData.car2.is_bookmarked || false;
          }
          if (pairData.additionalCars) {
            pairData.additionalCars.forEach((item: {car: any}) => {
              if (item.car?.VariantID) {
                newBookmarkStates[item.car.VariantID] = item.car.is_bookmarked || false;
              }
            });
          }
        }
        setBookmarkStates(newBookmarkStates);
      } else {
        setError('No comparison data available');
      }
    } catch (err: any) {
      const apiMessage = err?.response?.data?.error || err?.message || 'Unknown error';
      setError(apiMessage || 'Failed to fetch comparison data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async (carId: number, isBookmarked: boolean) => {
    // Block bookmarking for unauthenticated users and redirect to login/home
    const token = getTokenFromCookies();
    const userCookie = getUserFromCookies();
    if (!token || !userCookie) {
      showSnackbar('Please login to bookmark cars', {
        vertical: 'top',
        horizontal: 'center',
        autoHideDuration: 5000,
        color: 'error',
      });
      try { showLogin(); } catch (_e) {}
      return;
    }
    try {
      const payload = { variant_id: carId };
      await axiosInstance1.post('/api/cargpt/bookmark/toggle/', payload);

      setBookmarkStates(prev => ({ ...prev, [carId]: !isBookmarked }));

      const msg = !isBookmarked ? "Car added to your bookmarks" : "Car removed from your bookmarks";
      showSnackbar(msg, {
        vertical: "top",
        horizontal: "center",
        autoHideDuration: 7000,
        color: "success",
      });
    } catch (error: any) {
      console.error("Failed to toggle bookmark:", error);
      const err = error?.response?.data?.error || "Something went wrong! Please try again later.";
      showSnackbar(err, {
        vertical: "top",
        horizontal: "center",
        autoHideDuration: 7000,
        color: "error",
      });
    }
  };

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
      
      // Debug: Log current comparison data structure
      console.log('Current comparison data before adding car:', comparisonData);
      
      // Get the car IDs for comparison - start with existing cars
      const car1Id = getCarId((comparisonData as any)?.displayCar1) || getCarId((comparisonData as any)?.car1) || getCarId(primaryCar);
      const car2Id = getCarId((comparisonData as any)?.displayCar2) || getCarId((comparisonData as any)?.car2);
      
      // Get existing additional cars if any - fix the data structure access
      const existingAdditionalCars = (comparisonData as any)?.additionalCars || [];
      console.log('Existing additional cars:', existingAdditionalCars);
      
      // Extract car IDs from the existing additional cars structure
      const existingCarIds = existingAdditionalCars.map((carObj: any) => {
        // The structure is { car: {...}, displayCar: {...} }
        const carId = getCarId(carObj.car) || carObj.car?.VariantID;
        console.log('Extracting car ID from:', carObj, 'Result:', carId);
        return carId;
      }).filter(Boolean); // Filter out any undefined IDs
      
      // Add the new car ID
      const newCarId = thirdSelectedVariant?.CarID || thirdSelectedVariant?.VariantID;
      
      // Combine all car IDs - include existing additional cars
      const allCarIds = [car1Id, car2Id, ...existingCarIds, newCarId].filter(Boolean);
      
      // Debug: Log the IDs being used for comparison
      console.log('Car IDs for comparison:', {
        car1Id,
        car2Id,
        existingCarIds,
        newCarId,
        allCarIds,
        thirdSelectedVariant: {
          CarID: thirdSelectedVariant?.CarID,
          VariantID: thirdSelectedVariant?.VariantID,
          fullObject: thirdSelectedVariant
        }
      });

      // Call compare API with all car IDs
      const resp: any = await axiosInstance1.post('/api/cargpt/compare/', { 
        car_ids: allCarIds
      });
      
      const cars = Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp) ? resp : []);
      
      // Use the exact cars returned from compare API for display purposes
      const [car1Data, car2Data, ...additionalCarsData] = cars;
      
      // Debug: Log the data structure from compare API
      console.log('Compare API response cars:', {
        car1: car1Data,
        car2: car2Data,
        additionalCars: additionalCarsData,
        totalCars: cars.length
      });
      
      // Fetch detailed car information for each car to get complete feature comparison data
      const detailedCars = await Promise.all(
        cars.map((car: any) => fetchCarDetailsById(car?.CarID || car?.VariantID))
      );
      
      console.log('Detailed car data fetched:', {
        detailedCars,
        count: detailedCars.length
      });
      
      const payload: any = {
        car1: { ...normalizeCar(detailedCars[0]), AIScore: car1Data?.AIScore ?? detailedCars[0]?.AIScore, AISummary: car1Data?.AISummary ?? detailedCars[0]?.AISummary },
        car2: { ...normalizeCar(detailedCars[1]), AIScore: car2Data?.AIScore ?? detailedCars[1]?.AIScore, AISummary: car2Data?.AISSummary ?? detailedCars[1]?.AISSummary },
        displayCar1: car1Data, // Keep original compare API data for display
        displayCar2: car2Data,
        additionalCars: additionalCarsData.map((car: any, index: number) => ({
          car: { ...normalizeCar(detailedCars[index + 2]), AIScore: car?.AIScore ?? detailedCars[index + 2]?.AIScore, AISummary: car?.AISummary ?? detailedCars[index + 2]?.AISummary },
          displayCar: car
        }))
      };
      
      // Debug: Log the normalized additional cars data
      console.log('Normalized additional cars data:', {
        additionalCars: payload.additionalCars,
        count: payload.additionalCars.length
      });
      
      console.log('Final payload to set:', payload);
      
      setComparisonData(payload as PairComparisonResponse & { 
        displayCar1: any; 
        displayCar2: any;
        additionalCars: Array<{car: any, displayCar: any}>;
      });
      setForceFullScreen(true);
      setIsViewingPairComparison(true);
      setAddThirdOpen(false);
      
      // Initialize bookmark states for all cars in the new comparison
      const newBookmarkStates: Record<number, boolean> = {};
      detailedCars.forEach((car: any) => {
        if (car?.VariantID) {
          newBookmarkStates[car.VariantID] = car.is_bookmarked || false;
        }
      });
      setBookmarkStates(newBookmarkStates);
      
      // Reset all third car selection fields after successful comparison
      setThirdSelectedBrand(null);
      setThirdSelectedModel(null);
      setThirdSelectedVariant(null);
      setThirdBrandOptions([]);
      setThirdModelOptions([]);
      setThirdVariantOptions([]);
    } catch (e: any) {
      console.error('Error adding car:', e);
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
                <Box sx={{ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {/* --- PATCH: Uniform image size for mobile --- */}
                  <img
                    src={getCarImage(primary)}
                    alt={primary?.ModelName}
                    style={{ width: isMobile ? '100%' : '100%', height: isMobile ? '100%' : '100%', objectFit: 'contain', maxWidth: '100%', maxHeight: '100%' }}
                  />
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent parent Box onClick
                      handleToggleBookmark(getCarId(primary), bookmarkStates[getCarId(primary)] || false);
                    }}
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 8,
                      zIndex: 1,
                      bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                      '&:hover': {
                        bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)',
                      },
                      borderRadius: '50%',
                      p: isMobile ? 0.25 : 0.5,
                      width: isMobile ? 24 : 32,
                      height: isMobile ? 24 : 32,
                    }}
                    aria-label="toggle bookmark"
                  >
                    {bookmarkStates[getCarId(primary)] ? (
                      <FavoriteIcon sx={{ fontSize: isMobile ? 16 : undefined }} color="error" />
                    ) : (
                      <FavoriteBorderIcon sx={{ fontSize: isMobile ? 16 : undefined, color: mode === 'dark' ? '#000' : undefined }} color="action" />
                    )}
                  </IconButton>
                </Box>
                <Typography variant="subtitle1" fontWeight="bold">{primary?.BrandName} {primary?.ModelName}</Typography>
                {!isMobile && primary?.VariantName && (
                  <Chip label={primary.VariantName} size="small" sx={{ ...chipVariantSx, fontSize: '12px', mt: 0.5 }} />
                )}
                {primary?.AIScore && (
                  <Typography component="div" sx={{ ...textLineSx }}>
                    {renderAIScoreLabel(primary.AIScore)}
                  </Typography>
                )}
                {primary?.AISummary && (
                  <Typography component="div" sx={{ ...textLineSx }}>
                    {`User Sentiments: ${primary.AISummary}`}
                  </Typography>
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
                <Box sx={{ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {/* --- PATCH: Uniform image size for mobile --- */}
                  <img
                    src={getCarImage(s)}
                    alt={s?.ModelName}
                    style={{ width: isMobile ? '100%' : '100%', height: isMobile ? '100%' : '100%', objectFit: 'contain', maxWidth: '100%', maxHeight: '100%' }}
                  />
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent parent Box onClick
                      handleToggleBookmark(getCarId(s), bookmarkStates[getCarId(s)] || false);
                    }}
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 8,
                      zIndex: 1,
                      bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                      '&:hover': {
                        bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)',
                      },
                      borderRadius: '50%',
                      p: isMobile ? 0.25 : 0.5,
                      width: isMobile ? 24 : 32,
                      height: isMobile ? 24 : 32,
                    }}
                    aria-label="toggle bookmark"
                  >
                    {bookmarkStates[getCarId(s)] ? (
                      <FavoriteIcon sx={{ fontSize: isMobile ? 16 : undefined }} color="error" />
                    ) : (
                      <FavoriteBorderIcon sx={{ fontSize: isMobile ? 16 : undefined, color: mode === 'dark' ? '#000' : undefined }} color="action" />
                    )}
                  </IconButton>
                </Box>
                <Typography variant="subtitle1" fontWeight="bold">{s?.BrandName} {s?.ModelName}</Typography>
                {!isMobile && s?.VariantName && (
                  <Chip label={s.VariantName} size="small" sx={{ ...chipVariantSx, fontSize: '12px', mt: 0.5 }} />
                )}
                {s?.AIScore && (
                  <Typography component="div" sx={{ ...textLineSx }}>
                    {renderAIScoreLabel(s.AIScore)}
                  </Typography>
                )}
                {s?.AISummary && (
                  <Typography component="div" sx={{ ...textLineSx }}>
                    {`User Sentiments: ${s.AISummary}`}
                  </Typography>
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
                  const normalizedLeft = { ...normalizeCar(left), AIScore: primary?.AIScore ?? left?.AIScore, AISummary: primary?.AISummary ?? left?.AISummary };
                  const normalizedRight = { ...normalizeCar(right), AIScore: s?.AIScore ?? right?.AIScore, AISummary: s?.AISummary ?? right?.AISummary };
                  setComparisonData({
                    car1: normalizedLeft,
                    car2: normalizedRight,
                    displayCar1: primary, // original object for image/details
                    displayCar2: s,
                  } as PairComparisonResponse & { displayCar1: any; displayCar2: any });
                  setForceFullScreen(true); // Force full screen when a pair comparison is loaded
                  setIsViewingPairComparison(true); // Set to true when viewing a pair comparison
                  // Update bookmark states for the selected pair
                  setBookmarkStates(prev => ({
                    ...prev,
                    [getCarId(primary)]: primary.is_bookmarked || false,
                    [getCarId(s)]: s.is_bookmarked || false,
                  }));
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
              <Box sx={{ height: 110, width:160, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',background:"white"  }}>
                {/* --- PATCH: Uniform image size for mobile --- */}
                <img
                  src={getCarImage(primary)}
                  alt={primary?.ModelName}
                  style={{ width: isMobile ? '100%' : '100%', height: isMobile ? '100%' : '100%', objectFit: 'contain', maxWidth: '100%', maxHeight: '100%' }}
                />
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent parent Box onClick
                    handleToggleBookmark(getCarId(primary), bookmarkStates[getCarId(primary)] || false);
                  }}
                  sx={{
                    position: 'absolute',
                    top: 10,
                    right: 8,
                    zIndex: 1,
                    bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                    '&:hover': {
                      bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)',
                    },
                    borderRadius: '50%',
                    p: isMobile ? 0.25 : 0.5,
                    width: isMobile ? 24 : 32,
                    height: isMobile ? 24 : 32,
                  }}
                  aria-label="toggle bookmark"
                >
                  {bookmarkStates[getCarId(primary)] ? (
                    <FavoriteIcon sx={{ fontSize: isMobile ? 16 : undefined }} color="error" />
                  ) : (
                    <FavoriteBorderIcon sx={{ fontSize: isMobile ? 16 : undefined, color: mode === 'dark' ? '#000' : undefined }} color="action" />
                  )}
                </IconButton>
              </Box>
              <Typography variant="subtitle1" fontWeight="bold">{primary?.BrandName} {primary?.ModelName}</Typography>
              {!isMobile && primary?.VariantName && (
                <Chip label={primary.VariantName} size="small" sx={{ ...chipVariantSx, fontSize: '12px', mt: 0.5 }} />
              )}
              {primary?.AIScore && (
                <Typography component="div" sx={{ ...textLineSx }}>
                  {renderAIScoreLabel(primary.AIScore)}
                </Typography>
              )}
              {primary?.AISummary && (
                <Typography component="div" sx={{ ...textLineSx }}>
                  {`User Sentiments: ${primary.AISummary}`}
                </Typography>
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
                  <Box sx={{ height: 110, width:140, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background:"white" }}>
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
                      <ClearIcon fontSize="small" color={mode === 'dark' ? "error" : 'primary'} />
                    </IconButton>
                  </Box>
                  <Typography variant="subtitle1" fontWeight="bold">{selectedRightCar?.BrandName} {selectedRightCar?.ModelName}</Typography>
                  {!isMobile && selectedRightCar?.VariantName && (
                    <Chip label={selectedRightCar.VariantName} size="small" sx={{ ...chipVariantSx, fontSize: '12px', mt: 0.5 }} />

                  )}
                 {primary?.AIScore && (
                <Typography component="div" sx={{ ...textLineSx }}>
                  {renderAIScoreLabel(primary.AIScore)}
                </Typography>
              )}
              {primary?.AISummary && (
                <Typography component="div" sx={{ ...textLineSx }}>
                  {`User Sentiments: ${primary.AISummary}`}
                </Typography>
              )}
                  
                  <Typography variant="body2" color="text.secondary">{formatPrice(selectedRightCar?.Price || 0)}</Typography>

                  {/* Moved button content from here */}
                </>
              ) : !isAddingRightCar ? (
                <>
                  <Box sx={{ height: 110, display: 'flex', alignItems: 'center', 
                    justifyContent: 'center',
                  }}>
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
                  const normalizedLeft = { ...normalizeCar(left), AIScore: primary?.AIScore ?? left?.AIScore, AISummary: primary?.AISummary ?? left?.AISummary };
                  const normalizedRight = { ...normalizeCar(right), AIScore: selectedRightCar?.AIScore ?? right?.AIScore, AISummary: selectedRightCar?.AISummary ?? right?.AISummary };
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
  additionalCars: Array<{car: any, displayCar: any}>;
  isMobile: boolean;
  // Add a function prop to update the bookmark status
  onToggleBookmark: (carId: number, isBookmarked: boolean) => void;
  bookmarkStates: Record<number, boolean>;
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

const FeatureComparisonTable: React.FC<FeatureComparisonTableProps> = ({ car1, car2, mode, theme, onRequestAddThirdCar, additionalCars, isMobile, onToggleBookmark, bookmarkStates }) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  // Make car1Images and car2Images available throughout the component
  const car1Images = getAllCarImages(car1);
  const car2Images = getAllCarImages(car2);

  // Get additional cars from the props - no need to extract from car1 anymore
  console.log('FeatureComparisonTable - additionalCars from props:', additionalCars);

  // All cars array for easier iteration
  const allCars = [car1, car2, ...additionalCars.map(ac => ac.car)];

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

  // Helper to get car display name
  const getCarDisplayName = (car: any, index: number) => {
    if (index === 0) return 'Car 1';
    if (index === 1) return 'Car 2';
    return `Car ${index + 1}`;
  };

  // Helper to get car brand and model for header
  const getCarHeader = (car: any, index: number) => {
    if (index === 0) {
      const brand = car?.BrandName || car?.Brand || car?.data?.BrandName || car?.data?.Brand || car?.Car?.BrandName || car?.Car?.Brand || '';
      const model = car?.ModelName || car?.Model || car?.data?.ModelName || car?.data?.Model || car?.Car?.ModelName || car?.Car?.Model || '';
      return `${brand} ${model}`.trim();
    }
    if (index === 1) {
      const brand = car?.BrandName || car?.Brand || car?.data?.BrandName || car?.data?.Brand || car?.Car?.BrandName || car?.Car?.Brand || '';
      const model = car?.ModelName || car?.Model || car?.data?.ModelName || car?.data?.Model || car?.Car?.ModelName || car?.Car?.Model || '';
      return `${brand} ${model}`.trim();
    }
    // For additional cars
    const additionalCar = additionalCars[index - 2];
    if (additionalCar) {
      const car = additionalCar.car;
      const brand = car?.BrandName || car?.Brand || car?.data?.BrandName || car?.data?.Brand || car?.Car?.BrandName || car?.Car?.Brand || '';
      const model = car?.ModelName || car?.Model || car?.data?.ModelName || car?.data?.Model || car?.Car?.ModelName || car?.Car?.Model || '';
      return `${brand} ${model}`.trim();
    }
    return `Car ${index + 1}`;
  };

  // Car Images Section logic as a variable
  let carImagesSection = null;
  const maxImages = 5;
  // Car images section intentionally disabled for both mobile and desktop per request.

  return (
    <Box sx={{ 
      mt: 3, 
      p: isMobile ? 1 : 2, 
      backgroundColor: mode === 'dark' ? 'grey.800' : '#ffffff', 
      borderRadius: 2,
      // Mobile: Make the table horizontally scrollable and in one line
      ...(isMobile && {
        width: '100%',
        overflowX: 'auto',
        minWidth: 'max-content',
        scrollbarWidth: 'thin',
        '&::-webkit-scrollbar': {
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: mode === 'dark' ? '#333' : '#f1f1f1',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: mode === 'dark' ? '#666' : '#888',
          borderRadius: '4px',
          '&:hover': {
            background: mode === 'dark' ? '#888' : '#555',
          },
        }
      })
    }}>
      <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom fontWeight="bold" sx={{mb: 2}}>
        Detailed Feature Comparison
      </Typography>

      {/* Header row showing car names (hidden on mobile as per request) */}
      {false && isMobile && (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          py: 1,
          mb: 1.5,
          gap: 1,
          minWidth: 'max-content',
          overflowX: 'auto',
        }}>
          {/* '+' icon at left to add a car */}
          {onRequestAddThirdCar && (
            <Box
              sx={{
                flex: '0 0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                cursor: 'pointer',
                ml: 1,
                mr: 0.5,
                
              }}
              onClick={onRequestAddThirdCar}
              aria-label="add car"
            >
              <AddIcon sx={{ fontSize: 18 }} /> 
              
            </Box>
          )}
          {allCars.map((car: any, carIndex: number) => (
            <Box key={carIndex} sx={{ flex: '0 0 auto', position: 'relative', textAlign: 'center' }}>
              <img
                src={getCarImage(car)}
                alt={getCarHeader(car, carIndex)}
                style={{ maxWidth: '90px', maxHeight: '90px', objectFit: 'contain', margin: 0 }}
              />
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(getCarId(car), bookmarkStates[getCarId(car)] || false);
                }}
                sx={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  zIndex: 1,
                  bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                  '&:hover': {
                    bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)',
                  },
                  borderRadius: '50%',
                  p: 0.25,
                  width: 24,
                  height: 24,
                }}
                aria-label="toggle bookmark"
              >
                {bookmarkStates[getCarId(car)] ? (
                  <FavoriteIcon sx={{ fontSize: 16 }} color="error" />
                ) : (
                  <FavoriteBorderIcon sx={{ fontSize: 16, color: mode === 'dark' ? '#000' : undefined }} color="action" />
                )}
              
              </IconButton>
            </Box>
          ))}
        </Box>
      )}

      {/* Feature rows: first column is feature name, then each car's value in its column */}
      {isMobile && (
        <Box sx={{
          mb: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          pt: 1,
          minWidth: 'max-content',
          overflowX: 'auto',
          px: 1
        }}>
          {[{label: 'Brand', key: 'brand'}, {label: 'AiCarAdvisor Score', key: 'score'}, {label: 'User Sentiments', key: 'sentiments'}].map((row) => (
            <Box key={row.key} sx={{
              display: 'flex',
              alignItems: 'center',
              py: 0.5,
              borderBottom: '1px dotted',
              borderColor: 'divider',
              '&:last-child': { borderBottom: 'none' }
            }}>
              <Typography variant="caption" sx={{
                flex: '0 0 auto',
                fontWeight: 700,
                color: 'text.primary',
                minWidth: 110,
                maxWidth: 110,
                flexShrink: 0,
                pl: 1
              }}>
                {row.label}
              </Typography>
              {allCars.map((car: any, carIndex: number) => (
                <Typography key={carIndex} variant="caption" sx={{
                  flex: '0 0 auto',
                  textAlign: 'center',
                  minWidth: mobileColumnWidth,
                  maxWidth: mobileColumnWidth,
                  flexShrink: 0,
                  px: 0.5,
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere'
                }}>
                  {row.key === 'brand' && (
                    (car?.BrandName || car?.Brand || car?.data?.BrandName || car?.data?.Brand || car?.Car?.BrandName || car?.Car?.Brand || '')
                  )}
                  {row.key === 'score' && (
                    <span style={{ fontWeight: 600 }}>{String(car?.AIScore ?? '-')}</span>
                  )}
                  {row.key === 'sentiments' && (() => {
                    const summary = car?.AISummary || car?.data?.AISummary || car?.Car?.AISummary;
                    return summary ? String(summary) : '-';
                  })()}
                  
                </Typography>
              ))}
            </Box>
          ))}
        </Box>
      )}
      <Box sx={{ ...(isMobile && { overflowX: 'auto', minWidth: 'max-content' }) }}>
        {Object.entries(FEATURES_TO_COMPARE).map(([category, features]) => {
          const IconComponent = CATEGORY_ICONS[category] || InfoIcon;
          const isExpanded = expandedCategories[category];

          // Helper to get raw comparable value (no icons/JSX)
          const getRawValue = (car: any, cat: string, feat: string): any => {
            if (cat === 'BasicDetails') {
              if (feat === 'Price') {
                return car?.Price || car?.data?.Price || car?.Car?.Price || 0;
              }
              const val = car?.[feat] || car?.data?.[feat] || car?.Car?.[feat];
              return val ?? '';
            }
            if (feat === 'CarImages') {
              const imgs = car?.CarImageDetails || car?.images || car?.data?.CarImageDetails || car?.data?.images;
              return Array.isArray(imgs) ? imgs.length : 0;
            }
            const value = car?.[cat]?.[feat] || car?.[feat] || car?.data?.[feat] || car?.Car?.[feat];
            // Normalize booleans/numbers/strings
            if (typeof value === 'boolean') return value ? 1 : 0;
            if (value === null || value === undefined || value === '') return '';
            return String(value);
          };

          // Show first 4 by default; View More expands on both mobile and desktop
          const featuresToRender = isExpanded ? features : features.slice(0, 4);

          if (isMobile && featuresToRender.length === 0) return null;

          return (
            <Box key={category} sx={{ mb: 3 }}>
              <Typography variant={isMobile ? "body2" : "subtitle1"} fontWeight="bold" sx={{ mt: 2, mb: 1, borderBottom: '1px solid', borderColor: 'divider', pb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconComponent fontSize="small" />
                {category.replace(/([A-Z])/g, ' $1').trim()}
              </Typography>
              {featuresToRender.map((feature) => (
                <Box
                  key={feature}
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'nowrap',
                    alignItems: 'center',
                    py: isMobile ? 0.5 : 1,
                    borderBottom: '1px dotted',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' },
                    width: '100%',
                    ...(isMobile && { minWidth: 'max-content', overflowX: 'auto' })
                  }}
                >
                  {/* Feature name column */}
                  <Typography variant={isMobile ? "caption" : "body2"} sx={{
                    flex: isMobile ? '0 0 auto' : 1,
                    fontWeight: 'bold',
                    minWidth: isMobile ? 120 : 150,
                    maxWidth: isMobile ? 120 : 150,
                    flexShrink: 0,
                    fontSize: isMobile ? '11px' : undefined,
                    whiteSpace: 'normal',
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                  }}>
                    {feature.replace(/([A-Z])/g, ' $1').trim()}
                  </Typography>
                  {/* Car value columns */}
                  {allCars.map((car: any, carIndex: number) => (
                    <Typography
                      key={carIndex}
                      variant={isMobile ? "caption" : "body2"}
                      sx={{
                        flex: '0 0 auto',
                        textAlign: 'center',
                        color: 'text.primary',
                        minWidth: isMobile ? mobileColumnWidth : desktopColumnWidth,
                        maxWidth: isMobile ? mobileColumnWidth : desktopColumnWidth,
                        flexShrink: 0,
                        fontSize: isMobile ? '11px' : undefined,
                        px: isMobile ? 0.5 : 1
                      }}
                    >
                      {getFeatureValue(car, category, feature)}
                    </Typography>
                  ))}
                </Box>
              ))}
              {features.length > 4 && (
                <Button
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                  sx={{ mt: 2, width: 'fit-content', fontSize: isMobile ? '11px' : undefined }}
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
      </Box>

      {/* Render Car Images Section here */}
      {/* Car images section removed */}
    </Box>
  );
};

// Pair details card for pair comparison view
const PairDetailsCard = ({ car1, car2, displayCar1, displayCar2, mode, theme, onRequestAddThirdCar, additionalCars, isMobile, onToggleBookmark, bookmarkStates }: { 
  car1: any; 
  car2: any; 
  displayCar1?: any; 
  displayCar2?: any; 
  mode: string; 
  theme: any; 
  onRequestAddThirdCar?: () => void;
  additionalCars: Array<{car: any, displayCar: any}>;
  isMobile: boolean;
  // Add a function prop to update the bookmark status
  onToggleBookmark: (carId: number, isBookmarked: boolean) => void;
  bookmarkStates: Record<number, boolean>;
}) => {
  // Use displayCar1/displayCar2 for image/details if present, else fallback to car1/car2
  const left = displayCar1 || car1;
  const right = displayCar2 || car2;
  
  // Get additional cars from the props - no need to extract from car1 anymore
  console.log('PairDetailsCard - additionalCars from props:', additionalCars);
  
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

  // Helper to get car image consistently
  const getCarImage = (car: any) => {
    const imageUrl = 
      car?.CarImageDetails?.[0]?.CarImageURL ||
      car?.images?.[0]?.CarImageURL ||
      car?.data?.CarImageDetails?.[0]?.CarImageURL ||
      car?.data?.images?.[0]?.CarImageURL ||
      car?.Car?.CarImageDetails?.[0]?.CarImageURL ||
      car?.Car?.images?.[0]?.CarImageURL ||
      car?.CarImageURL ||
      car?.ImageURL ||
      car?.data?.CarImageURL ||
      car?.data?.ImageURL ||
      car?.Car?.CarImageURL ||
      car?.Car?.ImageURL;
    
    return imageUrl || '/assets/card-img.png';
  };

  // Helper to get car price consistently
  const getCarPrice = (car: any) => {
    const price = 
      car?.Price ||
      car?.data?.Price ||
      car?.Car?.Price ||
      car?.data?.car?.Price ||
      car?.car?.Price;
    
    return price || 0;
  };

  // Helper to get car brand name consistently
  const getCarBrand = (car: any) => {
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
    const variant = 
      car?.VariantName ||
      car?.Variant ||
      car?.data?.VariantName ||
      car?.data?.Variant ||
      car?.Car?.VariantName ||
      car?.Car?.Variant;
    
    return variant || '';
  };

  // Helper to format price
  const formatPrice = (price: number) => {
    return `₹${formatInternational(price || 0)}`;
  };

  // Desktop-only: make all image boxes equal in height to the tallest one
  const [imageBoxHeight, setImageBoxHeight] = useState<number>(100);
  const [columnMinHeight, setColumnMinHeight] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (isMobile) return; // only for desktop
    if (typeof window === 'undefined') return;

    const root = containerRef.current;
    if (!root) return;
    const imageNodeList = root.querySelectorAll<HTMLDivElement>('.pc-image-box');
    const nodes = Array.from(imageNodeList);
    if (!nodes || nodes.length === 0) return;
    const columnNodeList = root.querySelectorAll<HTMLDivElement>('.pc-column');
    const colNodes = Array.from(columnNodeList);

    const compute = () => {
      const maxH = nodes.reduce((max, n) => Math.max(max, n.getBoundingClientRect().height), 0);
      if (maxH && Math.abs(maxH - imageBoxHeight) > 1) setImageBoxHeight(maxH);
      const maxColH = colNodes.reduce((max, n) => Math.max(max, n.getBoundingClientRect().height), 0);
      if (maxColH && Math.abs(maxColH - columnMinHeight) > 1) setColumnMinHeight(maxColH);
    };

    compute();

    // Observe changes to keep it dynamic
    const ResizeObs = (window as any).ResizeObserver;
    const ro = ResizeObs ? new ResizeObs(compute) : null;
    nodes.forEach((n) => ro?.observe(n));
    colNodes.forEach((n) => ro?.observe(n));
    window.addEventListener('load', compute);
    window.addEventListener('resize', compute);

    return () => {
      nodes.forEach((n) => ro?.unobserve(n));
      colNodes.forEach((n) => ro?.unobserve(n));
      ro?.disconnect?.();
      window.removeEventListener('load', compute);
      window.removeEventListener('resize', compute);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, additionalCars, displayCar1, displayCar2]);

  return (
    <Box ref={containerRef} sx={{ 
      display: 'flex', 
      alignItems: 'flex-start', 
      justifyContent: 'flex-start', 
      gap: isMobile ? 2 : 2, 
      mb: 3, 
      mt: isMobile ? 4 : 0,
      width: '100%',
      pb: 2,
      // Mobile: Adjust layout for mobile - show images in row without boxes
      ...(isMobile && {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 2,
        pb: 1,
        overflowX: 'auto',
        scrollbarWidth: 'thin',
        '&::-webkit-scrollbar': {
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: mode === 'dark' ? '#333' : '#f1f1f1',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: mode === 'dark' ? '#666' : '#888',
          borderRadius: '4px',
          '&:hover': {
            background: mode === 'dark' ? '#888' : '#555',
          },
        }
      })
    }}>
      {isMobile && (
        <Box sx={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'white',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '10px',
          color: 'text.secondary',
          flexShrink: 0,
          cursor: 'pointer',
          ml: 1
        }}
        onClick={onRequestAddThirdCar}
        >
          <AddIcon sx={{ fontSize: 16, color: '#000' }} />
        </Box>
      )}
      {/* Add third car column (first) - only show on desktop */}
      {!isMobile && onRequestAddThirdCar && (
        <Box sx={{ 
          width: desktopColumnWidth, 
          textAlign: 'center', 
          flexShrink: 0,
          p: 2,
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 2,
          background: mode === 'dark' ? 'transparent' : '#fafafa'
        }}>
          <Box
            onClick={onRequestAddThirdCar}
            sx={{
              width: 80,
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              border: '2px dashed',
              borderColor: 'divider',
              background: mode === 'dark' ? 'transparent' : 'white',
              color: 'text.disabled',
              cursor: 'pointer',
              mx: 'auto',
              mb: 1
            }}
          >
            <AddIcon sx={{ fontSize: 24 }} />
          </Box>
          <Typography variant="body2" color="text.secondary">Add Car</Typography>
        </Box>
      )}

      {/* Car 1 column */}
      <Box className={!isMobile ? 'pc-column' : undefined} sx={{ 
        width: isMobile ? mobileColumnWidth : desktopColumnWidth, 
        textAlign: 'center', 
        flexShrink: 0,
        p: isMobile ? 0 : 2,
        border: isMobile ? 'none' : '1px solid',
        borderColor: 'divider',
        borderRadius: isMobile ? 0 : 2,
        background: isMobile ? 'transparent' : (mode === 'dark' ? 'grey.800' : 'white'),
        ml: 0,
        mt: isMobile ? 1 : 0,
        ...(isMobile ? {} : { minHeight: columnMinHeight })
      }}>
        <Box className={!isMobile ? 'pc-image-box' : undefined} sx={{ 
          height: isMobile ? 120 : imageBoxHeight, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: 'white',
          mb: isMobile ? 0.5 : 2,
          pl: 0,
          position: 'relative'
        }}>
          <img 
            src={getCarImage(left)} 
            alt={getCarModel(left)} 
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
          />
          <IconButton
            onClick={(e) => {
              e.stopPropagation(); // Prevent parent Box onClick
              onToggleBookmark(getCarId(left), bookmarkStates[getCarId(left)] || false);
            }}
            sx={{
              position: 'absolute',
              top: 10,
              right: 8,
              zIndex: 1,
              bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
              '&:hover': {
                bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)',
              },
              borderRadius: '50%',
              p: isMobile ? 0.25 : 0.5,
              width: isMobile ? 24 : 32,
              height: isMobile ? 24 : 32,
            }}
            aria-label="toggle bookmark"
          >
            {bookmarkStates[getCarId(left)] ? (
              <FavoriteIcon sx={{ fontSize: isMobile ? 16 : undefined }} color="error" />
            ) : (
              <FavoriteBorderIcon sx={{ fontSize: isMobile ? 16 : undefined, color: mode === 'dark' ? '#000' : undefined }} color="action" />
            )}
          </IconButton>
        </Box>
        <>
          <Typography variant={isMobile ? "body2" : "subtitle1"} fontWeight="bold" sx={{ mb: isMobile ? 0.25 : 1, fontSize: isMobile ? '12px' : undefined }}>
            {getCarBrand(left)} {getCarModel(left)}
          </Typography>
          {getCarVariant(left) && (
            <Chip 
              label={getCarVariant(left)} 
              size="small" 
              sx={{ ...chipVariantSx, fontSize: isMobile ? '10px' : '12px', mb: isMobile ? 0.5 : 1.5 }} 
            />
          )}
          {!isMobile && left?.AIScore && (
            <Typography component="div" sx={{ ...textLineSx }}>
              {renderAIScoreLabel(left.AIScore)}
            </Typography>
          )}
          {!isMobile && left?.AISummary && (
            <Typography component="div" sx={{ ...textLineSx }}>
              {`User Sentiments: ${left.AISummary}`}
            </Typography>
          )}
          <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary" fontWeight="bold" sx={{ fontSize: isMobile ? '10px' : undefined }}>
            {formatPrice(getCarPrice(left))}
          </Typography>
        </>
      </Box>

      {/* Car 2 column */}
      <Box className={!isMobile ? 'pc-column' : undefined} sx={{ 
        width: isMobile ? mobileColumnWidth : desktopColumnWidth, 
        textAlign: 'center', 
        flexShrink: 0,
        p: isMobile ? 0 : 2,
        border: isMobile ? 'none' : '1px solid',
        borderColor: 'divider',
        borderRadius: isMobile ? 0 : 2,
        background: isMobile ? 'transparent' : (mode === 'dark' ? 'grey.800' : 'white'),
        ml: 0,
        mr: 0,
        mt: isMobile ? 1 : 0,
        ...(isMobile ? {} : { minHeight: columnMinHeight })
      }}>
        <Box className={!isMobile ? 'pc-image-box' : undefined} sx={{ 
          height: isMobile ? 120 : imageBoxHeight, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: 'white',
          mb: isMobile ? 0.5 : 2,
          pl: 0,
          position: 'relative'
        }}>
          <img 
            src={getCarImage(right)} 
            alt={getCarModel(right)} 
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
          />
          <IconButton
            onClick={(e) => {
              e.stopPropagation(); // Prevent parent Box onClick
              onToggleBookmark(getCarId(right), bookmarkStates[getCarId(right)] || false);
            }}
            sx={{
              position: 'absolute',
              top: 10,
              right: 8,
              zIndex: 1,
              bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
              '&:hover': {
                bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)',
              },
              borderRadius: '50%',
              p: isMobile ? 0.25 : 0.5,
              width: isMobile ? 24 : 32,
              height: isMobile ? 24 : 32,
            }}
            aria-label="toggle bookmark"
          >
            {bookmarkStates[getCarId(right)] ? (
              <FavoriteIcon sx={{ fontSize: isMobile ? 16 : undefined }} color="error" />
            ) : (
              <FavoriteBorderIcon sx={{ fontSize: isMobile ? 16 : undefined, color: mode === 'dark' ? '#000' : undefined }} color="action" />
            )}
          </IconButton>
        </Box>
        <>
          <Typography variant={isMobile ? "body2" : "subtitle1"} fontWeight="bold" sx={{ mb: isMobile ? 0.25 : 1, fontSize: isMobile ? '12px' : undefined }}>
            {getCarBrand(right)} {getCarModel(right)}
          </Typography>
          {getCarVariant(right) && (
            <Chip 
              label={getCarVariant(right)} 
              size="small" 
              sx={{ ...chipVariantSx, fontSize: isMobile ? '10px' : '12px', mb: isMobile ? 0.5 : 1.5 }} 
            />
          )}
          {!isMobile && right?.AIScore && (
            <Typography component="div" sx={{ ...textLineSx }}>
              {renderAIScoreLabel(right.AIScore)}
            </Typography>
          )}
          {!isMobile && right?.AISummary && (
            <Typography component="div" sx={{ ...textLineSx }}>
              {`User Sentiments: ${right.AISummary}`}
            </Typography>
          )}
          <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary" fontWeight="bold" sx={{ fontSize: isMobile ? '10px' : undefined }}>
            {formatPrice(getCarPrice(right))}
          </Typography>
        </>
      </Box>

      {/* Additional cars (Car 3, Car 4, Car 5, etc.) */}
      {additionalCars.map((additionalCar: any, carIndex: number) => {
        return (
          <React.Fragment key={carIndex}>
            
            <Box className={!isMobile ? 'pc-column' : undefined} sx={{ 
              width: isMobile ? mobileColumnWidth : desktopColumnWidth, 
              textAlign: 'center', 
              flexShrink: 0,
              p: isMobile ? 0 : 2,
              border: isMobile ? 'none' : '1px solid',
              borderColor: 'divider',
              borderRadius: isMobile ? 0 : 2,
              background: isMobile ? 'transparent' : (mode === 'dark' ? 'grey.800' : 'white'),
              ml: 0,
              mt: isMobile ? 1 : 0,
              ...(isMobile ? {} : { minHeight: columnMinHeight })
            }}>
              {(() => {
                const car = additionalCar.car;
                const displayCar = additionalCar.displayCar;
                const carImage = getCarImage(displayCar || car);
                
                return (
                  <>
                    <Box className={!isMobile ? 'pc-image-box' : undefined} sx={{ 
                      height: isMobile ? 120 : imageBoxHeight, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      background: 'white',
                      mb: isMobile ? 0.5 : 2,
                      pl: 0,
                      position: 'relative'
                    }}>
                      <img 
                        src={carImage} 
                        alt={getCarModel(car)} 
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                      />
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent parent Box onClick
                          onToggleBookmark(getCarId(car), bookmarkStates[getCarId(car)] || false);
                        }}
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 8,
                          zIndex: 1,
                          bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                          '&:hover': {
                            bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)',
                          },
                          borderRadius: '50%',
                          p: isMobile ? 0.25 : 0.5,
                          width: isMobile ? 24 : 32,
                          height: isMobile ? 24 : 32,
                        }}
                        aria-label="toggle bookmark"
                      >
                        {bookmarkStates[getCarId(car)] ? (
                          <FavoriteIcon sx={{ fontSize: isMobile ? 16 : undefined }} color="error" />
                        ) : (
                          <FavoriteBorderIcon sx={{ fontSize: isMobile ? 16 : undefined, color: mode === 'dark' ? '#000' : undefined }} color="action" />
                        )}
                      </IconButton>
                    </Box>
                    <>
                      <Typography variant={isMobile ? "body2" : "subtitle1"} fontWeight="bold" sx={{ mb: isMobile ? 0.25 : 1, fontSize: isMobile ? '12px' : undefined }}>
                        {getCarBrand(car)} {getCarModel(car)}
                      </Typography>
                      {getCarVariant(car) && (
                        <Chip 
                          label={getCarVariant(car)} 
                          size="small" 
                          sx={{ ...chipVariantSx, fontSize: isMobile ? '10px' : '12px', mb: isMobile ? 0.5 : 1.5 }} 
                        />
                      )}
                      {!isMobile && car?.AIScore && (
                        <Typography component="div" sx={{ ...textLineSx }}>
                          {renderAIScoreLabel(car.AIScore)}
                        </Typography>
                      )}
                      {!isMobile && car?.AISummary && (
                        <Typography component="div" sx={{ ...textLineSx }}>
                          {`User Sentiments: ${car.AISummary}`}
                        </Typography>
                      )}
                      <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary" fontWeight="bold" sx={{ fontSize: isMobile ? '10px' : undefined }}>
                        {formatPrice(getCarPrice(car))}
                      </Typography>
                    </>
                  </>
                );
              })()}
            </Box>
          </React.Fragment>
        );
      })}
    </Box>
  );
};
const isNative = Capacitor.isNativePlatform();
const isAndroid = Capacitor.getPlatform() === "android";

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
          <AppBar position="static" color="primary" elevation={0} sx={{ 
            borderBottom: '1px solid', 
            borderColor: 'divider',
          }}>
            <Toolbar sx={{ 
              minHeight: { xs: 64, sm: 72 },
              alignItems: 'center',
              gap: 2
            }}>
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
                sx={{ 
                  mr: 0,
                  p: 1,
                  borderRadius: '50%',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                <KeyboardBackspaceSharp sx={{ fontSize: 20 }} />
              </IconButton>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'flex-start',
                flex: 1
              }}>
                <Typography variant="h6" fontWeight="bold" sx={{ 
                  lineHeight: 1.2,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}>
                  Compare Cars
                </Typography>
                <Typography variant="body2" sx={{ 
                  opacity: 0.9,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  mt: 0.5
                }}>
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
          renderSuggestedList(normalizeCar(primaryCar), ((comparisonData as SuggestedComparisonResponse).comparisons || []).map(normalizeCar))
        ) : (comparisonData as PairComparisonResponse)?.car1 && (comparisonData as PairComparisonResponse)?.car2 ? (
          <Box sx={{ 
            overflowX: 'auto', 
            width: '100%',
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: mode === 'dark' ? '#333' : '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: mode === 'dark' ? '#666' : '#888',
              borderRadius: '4px',
              '&:hover': {
                background: mode === 'dark' ? '#888' : '#555',
              },
            },
            // Mobile: No horizontal scroll for 2 cars, only for 3+ cars
            ...(isMobile && {
              overflowX: ((comparisonData as any)?.additionalCars || []).length === 0 ? 'hidden' : 'auto'
            })
          }}>
            <Box sx={{ 
              minWidth: 'max-content', 
              p: 2,

              // Mobile: Center content when only 2 cars
              ...(isMobile && {
                minWidth: ((comparisonData as any)?.additionalCars || []).length === 0 ? '100%' : 'max-content',
                display: 'flex',
                flexDirection: 'column',
                alignItems: ((comparisonData as any)?.additionalCars || []).length === 0 ? 'center' : 'flex-start'
              }
            ),
            }}>
              <PairDetailsCard
                car1={(comparisonData as PairComparisonResponse).car1}
                car2={(comparisonData as PairComparisonResponse).car2}
                displayCar1={(comparisonData as any).displayCar1}
                displayCar2={(comparisonData as any).displayCar2}
                mode={mode}
                theme={theme}
                onRequestAddThirdCar={openAddThird}
                additionalCars={(comparisonData as any).additionalCars || []}
                isMobile={isMobile}
                onToggleBookmark={handleToggleBookmark}
                bookmarkStates={bookmarkStates}
              />
              {/* --- PATCH START: Merge displayCar images with details for mobile --- */}
              <FeatureComparisonTable
                car1={(() => {
                  if (isMobile && (comparisonData as any).displayCar1) {
                    const merged = { ...(comparisonData as PairComparisonResponse).car1, ...(comparisonData as any).displayCar1 };
                    merged.images = merged.images || merged.data?.images || merged.CarImageDetails || merged.data?.CarImageDetails || [];
                    return normalizeCar(merged);
                  }
                  return (comparisonData as PairComparisonResponse).car1;
                })()}
                car2={(() => {
                  if (isMobile && (comparisonData as any).displayCar2) {
                    const merged = { ...(comparisonData as PairComparisonResponse).car2, ...(comparisonData as any).displayCar2 };
                    merged.images = merged.images || merged.data?.images || merged.CarImageDetails || merged.data?.CarImageDetails || [];
                    return normalizeCar(merged);
                  }
                  return (comparisonData as PairComparisonResponse).car2;
                })()}
                mode={mode}
                theme={theme}
                onRequestAddThirdCar={openAddThird}
                additionalCars={
                  isMobile && (comparisonData as any).additionalCars
                    ? (comparisonData as any).additionalCars.map((ac: any) => {
                        const merged = { ...ac.car, ...(ac.displayCar || {}) };
                        merged.images = merged.images || merged.data?.images || merged.CarImageDetails || merged.data?.CarImageDetails || [];
                        return {
                          car: normalizeCar(merged),
                          displayCar: ac.displayCar,
                        };
                      })
                    : (comparisonData as any).additionalCars || []
                }
                isMobile={isMobile}
                onToggleBookmark={handleToggleBookmark}
                bookmarkStates={bookmarkStates}
              />
              {/* --- PATCH END --- */}
            </Box>
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
