"use client";
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  useTheme,
  useMediaQuery,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  Close as CloseIcon,
} from '@mui/icons-material';
import { Capacitor } from '@capacitor/core';
import BrandName from './BrandName';
import { useColorMode } from '@/Context/ColorModeContext';
import { useBrands } from '@/components/Chat/hooks/useBrands';
import { Avatar } from '@mui/material';

interface GSTAlertPopupProps {
  open: boolean;
  onClose: () => void;
  onDismiss: () => void;
}

interface VehicleData {
  category: string;
  company: string;
  model: string;
  current: string;
  downBy: string;
}

const GSTAlertPopup: React.FC<GSTAlertPopupProps> = ({ open, onClose, onDismiss }) => {
  const theme = useTheme();
  const { mode } = useColorMode();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isNative = Capacitor.isNativePlatform();
  const { brands } = useBrands();

  const vehicleData: VehicleData[] = [
    // Mini Cars
    { category: 'MINI CARS', company: 'Maruti Suzuki', model: 'Alto', current: '4.2L', downBy: '35.7K' },
    { category: 'MINI CARS', company: 'Maruti Suzuki', model: 'Wagon R', current: '5.8L', downBy: '90K' },
    { category: 'MINI CARS', company: 'Maruti Suzuki', model: 'Swift', current: '6.5L', downBy: '1L' },
    { category: 'MINI CARS', company: 'Hyundai', model: 'i10 Nios', current: '6L', downBy: '51K' },
    
    // Sedans
    { category: 'SEDANS', company: 'Maruti Suzuki', model: 'Dzire', current: '6.8L', downBy: '1L' },
    { category: 'SEDANS', company: 'Volkswagen', model: 'Virtus', current: '11.5L', downBy: '1.1L' },
    
    // Entry SUV
    { category: 'ENTRY SUV', company: 'Tata', model: 'Punch', current: '6.2L', downBy: '90K' },
    
    // Premium SUV
    { category: 'PREMIUM SUV', company: 'Maruti Suzuki', model: 'Brezza', current: '8.7L', downBy: '90K' },
    { category: 'PREMIUM SUV', company: 'Hyundai', model: 'Creta', current: '11.1L', downBy: '1.1L' },
    { category: 'PREMIUM SUV', company: 'Mahindra', model: 'XUV700', current: '14.5L', downBy: '1.9L' },
    
    // MPV
    { category: 'MPV', company: 'Maruti Suzuki', model: 'Ertiga', current: '9.1L', downBy: '90K' },
    { category: 'MPV', company: 'Toyota', model: 'Innova', current: '20L', downBy: '2.6L' },
    
    // Luxury Cars
    { category: 'LUXURY CARS', company: 'BMW', model: '5-series', current: '76.5L', downBy: '4L' },
    { category: 'LUXURY CARS', company: 'BMW', model: 'X7', current: '1.4 Cr', downBy: '9L' },
  ];

  // Calculate dynamic message based on actual data
  const calculateDynamicMessage = () => {
    const downByValues = vehicleData.map(vehicle => {
      const value = vehicle.downBy;
      if (value.includes('K')) {
        return parseFloat(value.replace('K', '')) * 1000;
      } else if (value.includes('L')) {
        return parseFloat(value.replace('L', '')) * 100000;
      } else if (value.includes('Cr')) {
        return parseFloat(value.replace('Cr', '')) * 10000000;
      }
      return 0;
    });

    const minReduction = Math.min(...downByValues);
    const maxReduction = Math.max(...downByValues);
    const totalVehicles = vehicleData.length;
    const uniqueBrands = new Set(vehicleData.map(v => v.company)).size;
    const uniqueCategories = new Set(vehicleData.map(v => v.category)).size;

    const formatAmount = (amount: number) => {
      if (amount >= 10000000) {
        return `₹${(amount / 10000000).toFixed(1)}Cr`;
      } else if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(1)}L`;
      } else {
        return `₹${(amount / 1000).toFixed(0)}K`;
      }
    };

    return {
      minReduction: formatAmount(minReduction),
      maxReduction: formatAmount(maxReduction),
      totalVehicles,
      uniqueBrands,
      uniqueCategories
    };
  };

  const dynamicStats = calculateDynamicMessage();

  // Function to get brand logo from API data
  const getBrandLogo = (companyName: string) => {
    const brand = brands.find(b => {
      const brandName = b.BrandName?.toLowerCase() || '';
      const company = companyName.toLowerCase();
      
      // Exact match
      if (brandName === company) return true;
      
      // Handle common variations
      if (company === 'maruti suzuki' && (brandName.includes('maruti') || brandName.includes('suzuki'))) return true;
      if (company === 'volkswagen' && (brandName.includes('volkswagen') || brandName === 'vw')) return true;
      if (company === 'mahindra' && (brandName.includes('mahindra') || brandName === 'm&m')) return true;
      
      // Partial matches
      if (brandName.includes(company) || company.includes(brandName)) return true;
      
      return false;
    });
    return brand?.logo || null;
  };

  const groupedData = vehicleData.reduce((acc, vehicle) => {
    if (!acc[vehicle.category]) {
      acc[vehicle.category] = [];
    }
    acc[vehicle.category].push(vehicle);
    return acc;
  }, {} as Record<string, VehicleData[]>);


  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          maxHeight: isMobile ? '100vh' : '80vh',
          m: isMobile ? 0 : 2,
          maxWidth: isMobile ? '100%' : '600px',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
          bgcolor: theme.palette.primary.main,
          color: 'white',
          position: 'relative',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <BrandName />
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{ 
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }
          }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: isMobile ? 3 : 2 }}>
          {/* Alert Banner */}
          <Alert 
            severity="success" 
            sx={{ 
              mb: isMobile ? 3 : 2, 
              borderRadius: 2,
              p: isMobile ? 2 : 1.5
            }}
          >
            <AlertTitle sx={{ mb: isMobile ? 1 : 0.5 }}>Great News for Car Buyers!</AlertTitle>
            GST cuts will reduce vehicle prices by {dynamicStats.minReduction} to {dynamicStats.maxReduction}.
          </Alert>

          {/* Price Cuts Table */}
          <Typography variant="h6" sx={{ 
            mb: isMobile ? 3 : 2, 
            fontWeight: 'bold', 
            color: 'primary.main',
            fontSize: isMobile ? '1.1rem' : '1.25rem'
          }}>
            LIKELY PRICE CUTS
          </Typography>

          <TableContainer component={Paper} sx={{ 
            mb: isMobile ? 3 : 2, 
            borderRadius: 2,
            maxHeight: isMobile ? '60vh' : 'auto'
          }}>
            <Table size={isMobile ? "medium" : "small"}>
              <TableHead>
                <TableRow sx={{ backgroundColor: mode === 'dark' ? 'grey.800' : 'grey.100' }}>
                  <TableCell sx={{ 
                    fontWeight: 'bold',
                    py: isMobile ? 2 : 1,
                    px: isMobile ? 2 : 1.5
                  }}>Brand</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold',
                    py: isMobile ? 2 : 1,
                    px: isMobile ? 2 : 1.5
                  }}>Model</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold',
                    py: isMobile ? 2 : 1,
                    px: isMobile ? 2 : 1.5
                  }}>Current Price</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold',
                    py: isMobile ? 2 : 1,
                    px: isMobile ? 2 : 1.5
                  }}>Down By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(groupedData).map(([category, vehicles]) => (
                  <React.Fragment key={category}>
                    {vehicles.map((vehicle, index) => (
                      <TableRow 
                        key={`${vehicle.company}-${vehicle.model}`}
                        sx={{ 
                          '&:hover': { backgroundColor: mode === 'dark' ? 'grey.700' : 'grey.50' },
                          '&:last-child td': { borderBottom: index === vehicles.length - 1 ? `1px solid ${theme.palette.divider}` : 'none' }
                        }}
                      >
                        <TableCell sx={{ 
                          py: isMobile ? 1.5 : 0.5,
                          px: isMobile ? 2 : 1.5
                        }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            height: isMobile ? 32 : 24
                          }}>
                            {getBrandLogo(vehicle.company) && (
                              <Avatar
                                src={getBrandLogo(vehicle.company) || undefined}
                                alt={vehicle.company}
                                sx={{ 
                                  width: isMobile ? 24 : 20, 
                                  height: isMobile ? 24 : 20,
                                  flexShrink: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              />
                            )}
                            <Typography variant="body2" sx={{ 
                              fontWeight: 'medium', 
                              color: 'text.primary',
                              fontSize: isMobile ? '0.9rem' : '0.875rem'
                            }}>
                              {vehicle.company}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ 
                          py: isMobile ? 1.5 : 0.5,
                          px: isMobile ? 2 : 1.5,
                          fontSize: isMobile ? '0.9rem' : '0.875rem'
                        }}>{vehicle.model}</TableCell>
                        <TableCell sx={{ 
                          fontWeight: 'bold', 
                          color: 'text.primary', 
                          py: isMobile ? 1.5 : 0.5,
                          px: isMobile ? 2 : 1.5,
                          fontSize: isMobile ? '0.9rem' : '0.875rem'
                        }}>
                          ₹{vehicle.current}
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: 'bold', 
                          color: 'text.primary', 
                          py: isMobile ? 1.5 : 0.5,
                          px: isMobile ? 2 : 1.5,
                          fontSize: isMobile ? '0.9rem' : '0.875rem'
                        }}>
                          -₹{vehicle.downBy}
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

        </Box>
      </DialogContent>

    </Dialog>
  );
};

export default GSTAlertPopup;
