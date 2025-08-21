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

  // Call external API to fetch full car details by id and return parsed JSON
  const fetchCarDetailsById = async (carId: number) => {
    if (!carId) throw new Error('Invalid car id');
    const token =
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzgyMjEzMTA0LCJpYXQiOjE3NTA2NzcxMDQsImp0aSI6IjZjYTA0M2M4YWY4NzQyYjRiMWNkNGM1YzRiZmY0ODQ5IiwidXNlcl9pZCI6NH0.1jDNN4jz5TA4eNvZI1RHDen6uD2e-AznkhyUv_ijlPE';
    const headers = new Headers();
    headers.append('Authorization', token);
    headers.append('Content-Type', 'text/plain');
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
    if (Array.isArray(raw)) return raw[0] ?? null;
    if (raw?.car) return raw.car;
    if (raw?.data?.car) return raw.data.car;
    if (raw?.data && (raw.data.BrandName || raw.data.ModelName || raw.data.VariantName)) return raw.data;
    return raw;
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
      console.error('Compare API failed:', err);
      const apiMessage = err?.response?.data?.error || err?.message;
      setError(apiMessage || 'Failed to fetch comparison data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const renderCarCard = (car: any, title: string) => (
    <Card
      sx={{
        height: '100%',
        backgroundColor: mode === 'dark' ? theme.palette.background.paper : '#ffffff',
        border: '1px solid',
        borderColor: mode === 'dark' ? theme.palette.divider : 'grey.300',
      }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          {title}
        </Typography>

        {(car?.CarImageDetails?.[0]?.CarImageURL || car?.images?.[0]?.CarImageURL) && (
          <Box
            sx={{
              width: '100%',
              height: 120,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <img
              src={car?.CarImageDetails?.[0]?.CarImageURL || car?.images?.[0]?.CarImageURL}
              alt={car?.VariantName || car?.ModelName}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            />
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            {(car?.BrandName || car?.Brand) as any} {car?.ModelName}
          </Typography>
          {car?.VariantName && (
            <Chip label={car?.VariantName} size="small" sx={{ fontSize: '10px' }} />
          )}
        </Box>

        <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
          ₹{formatInternational(car?.Price || 0)}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {car?.FuelType && (
            <Chip label={`${car?.FuelType}`} size="small" sx={{ fontSize: '10px' }} />
          )}
          {(car?.Trans_fullform || car?.Engine?.Transmission) && (
            <Chip
              label={`Transmission: ${car?.Trans_fullform || car?.Engine?.Transmission}`}
              size="small"
              sx={{ fontSize: '10px' }}
            />
          )}
          {car?.Mileage && (
            <Chip label={`${Number(car?.Mileage)} kmpl`} size="small" sx={{ fontSize: '10px' }} />
          )}
          {(car?.Seats || car?.Interior?.Doors) && (
            <Chip
              label={`${car?.Seats ? `${car?.Seats} Seater` : `${car?.Interior?.Doors} Doors`}`}
              size="small"
              sx={{ fontSize: '10px' }}
            />
          )}
          {car?.Engine?.DriveType && (
            <Chip label={`Drive: ${car?.Engine?.DriveType}`} size="small" sx={{ fontSize: '10px' }} />
          )}
          {car?.Safety?.AirbagCount && (
            <Chip label={`${car?.Safety?.AirbagCount} Airbags`} size="small" sx={{ fontSize: '10px' }} />
          )}
        </Box>
      </CardContent>
    </Card>
  );

  // FIXED: TypeScript-safe version for PairComparisonResponse.comparison
  const renderComparisonSummary = () => {
    // Only proceed if comparisonData is a PairComparisonResponse and comparison exists
    const pair =
      comparisonData && 'comparison' in comparisonData
        ? (comparisonData as PairComparisonResponse)
        : null;
    if (!pair?.comparison) return null;
    const comparison = pair.comparison;

    return (
      <Box sx={{ mt: 3, p: 2, backgroundColor: mode === 'dark' ? 'grey.800' : 'grey.100', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Comparison Summary
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Price Difference:
              </Typography>
              <Typography
                variant="body1"
                fontWeight="bold"
                color={comparison.price_difference > 0 ? 'error.main' : 'success.main'}
              >
                ₹{formatInternational(Math.abs(comparison.price_difference))}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Mileage Difference:
              </Typography>
              <Typography
                variant="body1"
                fontWeight="bold"
                color={comparison.mileage_difference > 0 ? 'success.main' : 'error.main'}
              >
                {Math.abs(comparison.mileage_difference)} kmpl
              </Typography>
            </Box>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Fuel Efficiency Winner:
            </Typography>
            <Chip
              label={comparison.fuel_efficiency_winner}
              color="success"
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Value for Money:
            </Typography>
            <Chip
              label={comparison.value_for_money_winner}
              color="primary"
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Overall Winner:
            </Typography>
            <Chip
              label={comparison.overall_winner}
              color="secondary"
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Box>
        </Box>
      </Box>
    );
  };

  const formatPriceRange = (car: any) => {
    const minP = car?.MinPrice || car?.PriceMin || car?.Price || 0;
    const maxP = car?.MaxPrice || car?.PriceMax || car?.Price || 0;
    if (minP && maxP && minP !== maxP) {
      return `₹${formatInternational(minP)} - ${formatInternational(maxP)}`;
    }
    return `₹${formatInternational(minP || maxP || 0)}`;
  };

  const getDisplayName = (car: any) => car?.VariantName || car?.ModelName || 'Car';

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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filtered.map((s, idx) => (
          <Card
            key={idx}
            sx={{ border: '1px solid', borderColor: 'divider' }}
            variant="outlined"
          >
            <Box sx={{ display: 'flex', gap: 2, p: 2, alignItems: 'center' }}>
              {/* Left car */}
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Box sx={{ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={primary?.CarImageDetails?.[0]?.CarImageURL || '/assets/card-img.png'}
                    alt={primary?.ModelName}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </Box>
                <Typography variant="subtitle1" fontWeight="bold">{primary?.BrandName} {primary?.ModelName}</Typography>
                {primary?.VariantName && (
                  <Chip label={primary.VariantName} size="small" sx={{ fontSize: '10px', mt: 0.5 }} />
                )}
                <Typography variant="body2" color="text.secondary">{formatPriceRange(primary)}</Typography>
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
                    src={s?.CarImageDetails?.[0]?.CarImageURL || '/assets/card-img.png'}
                    alt={s?.ModelName}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </Box>
                <Typography variant="subtitle1" fontWeight="bold">{s?.BrandName} {s?.ModelName}</Typography>
                {s?.VariantName && (
                  <Chip label={s.VariantName} size="small" sx={{ fontSize: '10px', mt: 0.5 }} />
                )}
                <Typography variant="body2" color="text.secondary">{formatPriceRange(s)}</Typography>
              </Box>
            </Box>

            <Box sx={{ px: 2, pb: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={async () => {
                  try {
                    setLoading(true);
                    setError(null);
                    const leftId = primary?.CarID || primary?.VariantID || primary?.ModelID || primary?.id;
                    const rightId = s?.CarID || s?.VariantID || s?.ModelID || s?.id;
                    const [left, right] = await Promise.all([
                      fetchCarDetailsById(leftId),
                      fetchCarDetailsById(rightId),
                    ]);
                    setComparisonData({ car1: normalizeCar(left), car2: normalizeCar(right) } as PairComparisonResponse);
                  } catch (e: any) {
                    setError(e?.message || 'Failed to fetch car details');
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                {getDisplayName(primary)} vs {getDisplayName(s)}
              </Button>
            </Box>
          </Card>
        ))}
        {/* Add-car placeholder card */}
        <Card
          key="add-car-card"
          sx={{ border: '1px solid', borderColor: 'divider' }}
          variant="outlined"
        >
          <Box sx={{ display: 'flex', gap: 2, p: 2, alignItems: 'center' }}>
            {/* Left car (primary) */}
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Box sx={{ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={primary?.CarImageDetails?.[0]?.CarImageURL || '/assets/card-img.png'}
                  alt={primary?.ModelName}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </Box>
              <Typography variant="subtitle1" fontWeight="bold">{primary?.BrandName} {primary?.ModelName}</Typography>
              {primary?.VariantName && (
                <Chip label={primary.VariantName} size="small" sx={{ fontSize: '10px', mt: 0.5 }} />
              )}
              <Typography variant="body2" color="text.secondary">{formatPriceRange(primary)}</Typography>
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
                  <Box sx={{ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src={selectedRightCar?.CarImageDetails?.[0]?.CarImageURL || '/assets/card-img.png'}
                      alt={selectedRightCar?.ModelName}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  </Box>
                  <Typography variant="subtitle1" fontWeight="bold">{selectedRightCar?.BrandName} {selectedRightCar?.ModelName}</Typography>
                  {selectedRightCar?.VariantName && (
                    <Chip label={selectedRightCar.VariantName} size="small" sx={{ fontSize: '10px', mt: 0.5 }} />
                  )}
                  <Typography variant="body2" color="text.secondary">{formatPriceRange(selectedRightCar)}</Typography>
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
                </>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Autocomplete
                    size="small"
                    loading={loadingAdd}
                    options={brandOptions}
                    getOptionLabel={(o: any) => o?.BrandName || ''}
                    value={selectedBrand}
                    onChange={async (_e, val) => {
                      setSelectedBrand(val);
                      setSelectedModel(null);
                      setSelectedVariant(null);
                      setVariantOptions([]);
                      setSelectedRightCar(null);
                      if (val?.BrandID) {
                        try {
                          setLoadingAdd(true);
                          const data = await axiosInstance1.post('/api/cargpt/models/', { brand_id: val.BrandID });
                          const models = Array.isArray((data as any)?.models) ? (data as any).models : (Array.isArray(data) ? data : []);
                          setModelOptions(models);
                        } catch (e) {
                          setModelOptions([]);
                        } finally {
                          setLoadingAdd(false);
                        }
                      }
                    }}
                    renderInput={(params) => <TextField {...params} label="Brand" />}
                  />

                  <Autocomplete
                    size="small"
                    options={modelOptions}
                    getOptionLabel={(o: any) => o?.ModelName || ''}
                    value={selectedModel}
                    onChange={async (_e, val) => {
                      setSelectedModel(val);
                      setSelectedVariant(null);
                      setVariantOptions([]);
                      setSelectedRightCar(null);
                      if (val?.ModelID && selectedBrand?.BrandID) {
                        try {
                          setLoadingAdd(true);
                          // Use the new fetch-variants API
                          const resp = await axiosInstance1.post('/api/cargpt/fetch-variants/', {
                            BrandID: selectedBrand.BrandID,
                            ModelID: val.ModelID,
                          });
                          const variants = Array.isArray((resp as any)?.data)
                            ? (resp as any).data
                            : (Array.isArray(resp) ? resp : []);
                          setVariantOptions(variants);
                        } catch (e) {
                          setVariantOptions([]);
                        } finally {
                          setLoadingAdd(false);
                        }
                      }
                    }}
                    disabled={!selectedBrand}
                    renderInput={(params) => <TextField {...params} label="Model" />}
                  />
                  {/* Variant dropdown, shown after variants are loaded */}
                  <Autocomplete
                    size="small"
                    options={variantOptions}
                    getOptionLabel={(o: any) => o?.VariantName || ''}
                    value={selectedVariant}
                    onChange={async (_e, val) => {
                      setSelectedVariant(val);
                      if (val?.VariantID) {
                        try {
                          setLoadingAdd(true);
                          const payload = { variants: [primary?.VariantID, val.VariantID].filter(Boolean) };
                          const data: any = await axiosInstance1.post('/api/cargpt/compare_cars/', payload);
                          if (data && (data.car1 || data.car2)) {
                            const primaryId = primary?.VariantID;
                            const right = data.car1?.VariantID === primaryId ? data.car2 : data.car1;
                            setSelectedRightCar(right || val);
                          } else {
                            setSelectedRightCar(val);
                          }
                          setIsAddingRightCar(false);
                        } catch (e) {
                          setSelectedRightCar(val);
                          setIsAddingRightCar(false);
                        } finally {
                          setLoadingAdd(false);
                        }
                      }
                    }}
                    disabled={variantOptions.length === 0}
                    renderInput={(params) => <TextField {...params} label="Variant" />}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </Card>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
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
              <IconButton edge="start" color="inherit" onClick={onClose} aria-label="back" size="small" sx={{ mr: 1 }}>
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
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <Box sx={{ flex: 1 }}>
                {renderCarCard((comparisonData as PairComparisonResponse).car1, 'Your Car')}
              </Box>
              <Box sx={{ flex: 1 }}>
                {renderCarCard((comparisonData as PairComparisonResponse).car2, 'Comparison Car')}
              </Box>
            </Box>
            {renderComparisonSummary()}
          </Box>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <Typography color="text.secondary">No comparison data available</Typography>
          </Box>
        )}
      </DialogContent>
      {/* Remove DialogActions and close button entirely */}
    </Dialog>
  );
};

export default CompareCarsDialog;
