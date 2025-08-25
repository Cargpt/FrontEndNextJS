import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ClearIcon from "@mui/icons-material/Clear";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import { axiosInstance1 } from "@/utils/axiosInstance";
import { useSnackbar } from "@/Context/SnackbarContext";
import CompareCarsDialog from "./CompareCarsDialog";
import { useColorMode } from "@/Context/ColorModeContext";

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
  return imageUrl || "/assets/card-img.png";
};

const SLOT_SIZE = 120; // reduced from 150
const ICON_SIZE = 80; // reduced from 120

const CompareVsSelector: React.FC = () => {
  const { mode } = useColorMode();
  const [open, setOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<"left" | "right" | null>(null);
  const [loading, setLoading] = useState(false);
  const [brandOptions, setBrandOptions] = useState<any[]>([]);
  const [modelOptions, setModelOptions] = useState<any[]>([]);
  const [variantOptions, setVariantOptions] = useState<any[]>([]);

  const [selectedBrand, setSelectedBrand] = useState<any | null>(null);
  const [selectedModel, setSelectedModel] = useState<any | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);

  const [leftCar, setLeftCar] = useState<any | null>(null);
  const [rightCar, setRightCar] = useState<any | null>(null);

  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [initialCompareData, setInitialCompareData] = useState<any | null>(null);

  const { showSnackbar } = useSnackbar();

  const loadBrands = async () => {
    setLoading(true);
    try {
      const resp = await axiosInstance1.get('/api/cargpt/brands/');
      const brands = Array.isArray((resp as any)?.data) ? (resp as any).data : (Array.isArray(resp) ? resp : []);
      setBrandOptions(brands);
    } catch (_e) {
      setBrandOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async (slot: "left" | "right") => {
    setActiveSlot(slot);
    setOpen(true);
    if (brandOptions.length === 0) await loadBrands();
  };

  const resetDialogState = () => {
    setSelectedBrand(null);
    setSelectedModel(null);
    setSelectedVariant(null);
    setModelOptions([]);
    setVariantOptions([]);
  };

  const handleClose = () => {
    setOpen(false);
    setActiveSlot(null);
    resetDialogState();
  };

  const handleBrandChange = async (_e: any, newValue: any) => {
    setSelectedBrand(newValue);
    setSelectedModel(null);
    setSelectedVariant(null);
    setModelOptions([]);
    setVariantOptions([]);
    if (!newValue?.BrandID) return;
    setLoading(true);
    try {
      const data = await axiosInstance1.post('/api/cargpt/models/', { brand_id: newValue.BrandID });
      const models = Array.isArray((data as any)?.models) ? (data as any).models : (Array.isArray(data) ? data : []);
      setModelOptions(models);
    } catch (_e) {
      setModelOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleModelChange = async (_e: any, newValue: any) => {
    setSelectedModel(newValue);
    setSelectedVariant(null);
    setVariantOptions([]);
    if (!newValue?.ModelID || !selectedBrand?.BrandID) return;
    setLoading(true);
    try {
      const resp = await axiosInstance1.post('/api/cargpt/fetch-variants/', { BrandID: selectedBrand.BrandID, ModelID: newValue.ModelID });
      const variants = Array.isArray((resp as any)?.data) ? (resp as any).data : (Array.isArray(resp) ? resp : []);
      setVariantOptions(variants);
    } catch (_e) {
      setVariantOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCarFromCompare = async (id: number) => {
    try {
      const resp: any = await axiosInstance1.post('/api/cargpt/compare/', { car_ids: [id] });
      const cars = Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp) ? resp : []);
      return Array.isArray(cars) && cars.length > 0 ? cars[0] : null;
    } catch (_e) {
      return null;
    }
  };

  const handleConfirm = async () => {
    if (!selectedVariant || !activeSlot) return;
    const id = selectedVariant?.CarID || selectedVariant?.VariantID;
    let enriched = null;
    if (id) {
      setLoading(true);
      enriched = await fetchCarFromCompare(id);
      setLoading(false);
    }
    const picked = enriched || {
      ...selectedVariant,
      BrandName: selectedBrand?.BrandName,
      ModelName: selectedModel?.ModelName,
    };
    if (activeSlot === 'left') setLeftCar(picked);
    if (activeSlot === 'right') setRightCar(picked);

    handleClose();
  };

  const renderSlot = (slot: "left" | "right", car: any | null) => {
    if (car) {
      const img = getCarImage(car);
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ position: 'relative', width: SLOT_SIZE, height: SLOT_SIZE, borderRadius: '50%', overflow: 'hidden', boxShadow: 1, background: '#fff' }}>
            <img
              src={img}
              alt={car?.VariantName || car?.ModelName || 'car'}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
            <IconButton
              size="small"
              onClick={() => {
                if (slot === 'left') setLeftCar(null); else setRightCar(null);
                handleOpen(slot); // immediately allow reselect
              }}
              sx={{
                position: 'absolute',
                top: 20,
                right: 8,
                bgcolor: 'white',
                color: mode === 'dark' ? '#000' : 'text.primary',
                border: '1px solid',
                borderColor: 'divider',
                width: 32,
                height: 32,
                borderRadius: '50%',
                boxShadow: 2,
                zIndex: 2,
              }}
              aria-label="clear selection"
            >
              <ClearIcon sx={{ fontSize: 18, color: mode === 'dark' ? '#000' : undefined }} />
            </IconButton>
          </Box>
          <Typography variant="subtitle2" sx={{ mt: 1, maxWidth: SLOT_SIZE, textAlign: 'center', fontWeight: 600 }}>
            {(car?.BrandName || '') + (car?.ModelName ? ` ${car.ModelName}` : '')}
          </Typography>
          {car?.VariantName && (
            <Chip size="small" label={car.VariantName} sx={{ mt: 0.5, maxWidth: SLOT_SIZE, '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }} />
          )}
        </Box>
      );
    }
    return (
      <IconButton size="large" sx={{ width: SLOT_SIZE, height: SLOT_SIZE }} onClick={() => handleOpen(slot)}>
        <AddCircleOutlineIcon sx={{ fontSize: ICON_SIZE, color: 'primary.main' }} />
      </IconButton>
    );
  };

  const canCompare = Boolean(leftCar && rightCar);

  const openDetailedCompare = async () => {
    if (!canCompare) return;
    try {
      // Use compare API with both car ids to seed dialog (fallback to null)
      const ids = [leftCar?.CarID || leftCar?.VariantID, rightCar?.CarID || rightCar?.VariantID].filter(Boolean);
      let initialData = null;
      if (ids.length === 2) {
        const resp: any = await axiosInstance1.post('/api/cargpt/compare/', { car_ids: ids });
        const cars = Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp) ? resp : []);
        if (Array.isArray(cars) && cars.length >= 2) {
          initialData = { car1: cars[0], car2: cars[1] };
        }
      }
      setInitialCompareData(initialData);
      setCompareDialogOpen(true);
    } catch (_e) {
      setInitialCompareData(null);
      setCompareDialogOpen(true);
    }
  };

  return (
    <>
      <Box sx={{ mt: 3, mb: 1.5, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        {renderSlot('left', leftCar)}
        <Button
          variant="contained"
          color="primary"
          disabled={!canCompare}
          onClick={openDetailedCompare}
          sx={{
            minWidth: 64,
            height: 64,
            borderRadius: '50%',
            fontWeight: 700,
            boxShadow: 2,
          }}
        >
          VS
        </Button>
        {renderSlot('right', rightCar)}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Button variant="contained" disabled={!canCompare} onClick={openDetailedCompare}>
          Compare
        </Button>
      </Box>

      <CompareCarsDialog
        open={compareDialogOpen}
        onClose={() => setCompareDialogOpen(false)}
        variantId={(leftCar?.VariantID ?? leftCar?.CarID) || 0}
        carName={leftCar?.VariantName || leftCar?.ModelName || ''}
        primaryCar={leftCar}
        initialData={initialCompareData}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Select Brand, Model, Variant</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Autocomplete
              options={brandOptions}
              getOptionLabel={(o) => o?.BrandName || ''}
              value={selectedBrand}
              onChange={handleBrandChange}
              renderInput={(params) => (
                <TextField {...params} label="Brand" size="small" />
              )}
              loading={loading}
              loadingText="Loading brands..."
            />
            <Autocomplete
              options={modelOptions}
              getOptionLabel={(o) => o?.ModelName || ''}
              value={selectedModel}
              onChange={handleModelChange}
              renderInput={(params) => (
                <TextField {...params} label="Model" size="small" />
              )}
              loading={loading}
              loadingText="Loading models..."
              disabled={!selectedBrand}
            />
            <Autocomplete
              options={variantOptions}
              getOptionLabel={(o) => o?.VariantName || ''}
              value={selectedVariant}
              onChange={(_e, v) => setSelectedVariant(v)}
              renderInput={(params) => (
                <TextField {...params} label="Variant" size="small" />
              )}
              loading={loading}
              loadingText="Loading variants..."
              disabled={!selectedModel}
            />
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <CircularProgress size={24} />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirm} disabled={!selectedVariant}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CompareVsSelector;
