import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Avatar,
  Rating,
  Paper,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
// import { Grid } from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  DirectionsCar as CarIcon,
  Settings as EngineIcon,
  EventSeat as InteriorIcon,
  Dashboard as DashboardIcon,
  SmartToy as AutomationIcon,
  LocalParking as ParkingIcon,
  CarRepair as ExteriorIcon,
  Diamond as LuxuryIcon,
  HealthAndSafety as SafetyIcon,
  Speaker as EntertainmentIcon,
  Info as InfoIcon,
  Star as StarIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useColorMode } from '@/Context/ColorModeContext';

interface CarDetailsProps {
  carData: {
    CarID: number;
    Brand: string;
    ModelId: number;
    ModelName: string;
    ModelYear: string;
    Mileage: string;
    EmissionNormCompliance: string;
    Price: number;
    VariantID: number;
    VariantName: string;
    Engine: any;
    Interior: any;
    DRIVERDISPLAY: any;
    AutomationsID: any;
    PARKINGSUPPORT: any;
    EXTERIOR: any;
    Luxury: any;
    Safety: any;
    ENTERTAINMENTANDCONNECT: any;
    AI_REVIEW: any;
    total_engin_rating: number;
    engin_rating: number;
    images: Array<{
      CarImageURL: string;
      color: string | null;
      Description: string | null;
    }>;
  };
}

const CarDetails: React.FC<CarDetailsProps> = ({ carData }) => {
  const { mode } = useColorMode();
  const [expandedSection, setExpandedSection] = useState<string | false>('basic');

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSection(isExpanded ? panel : false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const renderFeatureList = (features: any, category: string) => {
    const featureEntries = Object.entries(features);
    const availableFeatures = featureEntries.filter(([_, value]) => value === 1 || value === true);
    const unavailableFeatures = featureEntries.filter(([_, value]) => value === 0 || value === false);

    // Special handling for safety ratings, entertainment specs, and interior specs
    const specialSpecs = [];
    if (category === 'safety') {
      if (carData.Safety.GlobalNCAPSafetyRating > 0) {
        specialSpecs.push(
          <Chip
            key="GlobalNCAPSafety"
            icon={<CheckIcon sx={{ fontSize: 16 }} />}
            label={`Global NCAP Safety: ${carData.Safety.GlobalNCAPSafetyRating}/5`}
            color="success"
            size="small"
            variant="outlined"
          />
        );
      }
      if (carData.Safety.GlobalNCAPChildSafetyRating > 0) {
        specialSpecs.push(
          <Chip
            key="ChildSafetyRating"
            icon={<CheckIcon sx={{ fontSize: 16 }} />}
            label={`Child Safety Rating: ${carData.Safety.GlobalNCAPChildSafetyRating}/5`}
            color="success"
            size="small"
            variant="outlined"
          />
        );
      }
      if (carData.Safety.AirbagCount > 0) {
        specialSpecs.push(
          <Chip
            key="AirbagCount"
            icon={<CheckIcon sx={{ fontSize: 16 }} />}
            label={`Airbag Count: ${carData.Safety.AirbagCount}`}
            color="success"
            size="small"
            variant="outlined"
          />
        );
      }
    } else if (category === 'entertainment') {
      if (carData.ENTERTAINMENTANDCONNECT.Speakers) {
        specialSpecs.push(
          <Chip
            key="Speakers"
            icon={<CheckIcon sx={{ fontSize: 16 }} />}
            label={`Speakers: ${carData.ENTERTAINMENTANDCONNECT.Speakers}`}
            color="success"
            size="small"
            variant="outlined"
          />
        );
      }
      if (carData.ENTERTAINMENTANDCONNECT.TouchScreenSize) {
        specialSpecs.push(
          <Chip
            key="TouchScreenSize"
            icon={<CheckIcon sx={{ fontSize: 16 }} />}
            label={`Touch Screen Size: ${carData.ENTERTAINMENTANDCONNECT.TouchScreenSize}"`}
            color="success"
            size="small"
            variant="outlined"
          />
        );
      }
      if (carData.ENTERTAINMENTANDCONNECT.Woofers !== undefined) {
        specialSpecs.push(
          <Chip
            key="Woofers"
            icon={<CheckIcon sx={{ fontSize: 16 }} />}
            label={`Woofers: ${carData.ENTERTAINMENTANDCONNECT.Woofers || 'None'}`}
            color="success"
            size="small"
            variant="outlined"
          />
        );
      }
    } else if (category === 'interior') {
      if (carData.Interior.Doors) {
        specialSpecs.push(
          <Chip
            key="Doors"
            icon={<CheckIcon sx={{ fontSize: 16 }} />}
            label={`Doors: ${carData.Interior.Doors}`}
            color="success"
            size="small"
            variant="outlined"
          />
        );
      }
    }

    return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          Available Features ({availableFeatures.length + specialSpecs.length})
        </Typography>
        <Box 
          display="flex" 
          flexWrap="wrap" 
          gap={1} 
          sx={{ 
            mb: 2,
            '& .MuiChip-root': {
              minWidth: '80px',
              maxWidth: '150px',
              height: '32px',
              fontSize: '0.75rem',
              '& .MuiChip-label': {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '120px',
              }
            }
          }}
        >
          {availableFeatures.map(([feature, _]) => (
            <Chip
              key={feature}
              icon={<CheckIcon sx={{ fontSize: 16 }} />}
              label={feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              color="success"
              size="small"
              variant="outlined"
            />
          ))}
          {specialSpecs}
        </Box>
        
        {unavailableFeatures.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
              Not Available ({unavailableFeatures.length})
            </Typography>
            <Box 
              display="flex" 
              flexWrap="wrap" 
              gap={1}
              sx={{ 
                '& .MuiChip-root': {
                  minWidth: '80px',
                  maxWidth: '150px',
                  height: '32px',
                  fontSize: '0.75rem',
                  '& .MuiChip-label': {
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '120px',
                  }
                }
              }}
            >
              {unavailableFeatures.map(([feature, _]) => (
                <Chip
                  key={feature}
                  icon={<CancelIcon sx={{ fontSize: 16 }} />}
                  label={feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  color="default"
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </>
        )}
      </Box>
    );
  };

  const sectionIcons: { [key: string]: React.ElementType } = {
    basic: InfoIcon,
    engine: EngineIcon,
    interior: InteriorIcon,
    display: DashboardIcon,
    automation: AutomationIcon,
    parking: ParkingIcon,
    exterior: ExteriorIcon,
    luxury: LuxuryIcon,
    safety: SafetyIcon,
    entertainment: EntertainmentIcon,
    review: StarIcon,
  };

  const sections = [
    {
      id: 'basic',
      title: 'Basic Details',
      icon: InfoIcon,
      content: (
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
          <Box flex={1}>
            <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom color="primary">
                Car Information
              </Typography>
              <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Brand:</Typography>
                  <Typography variant="body2" fontWeight="bold">{carData.Brand}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Model:</Typography>
                  <Typography variant="body2" fontWeight="bold">{carData.ModelName}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Variant:</Typography>
                  <Typography variant="body2" fontWeight="bold">{carData.VariantName}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Year:</Typography>
                  <Typography variant="body2" fontWeight="bold">{carData.ModelYear}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Mileage:</Typography>
                  <Typography variant="body2" fontWeight="bold">{carData.Mileage} kmpl</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Emission Norm:</Typography>
                  <Typography variant="body2" fontWeight="bold">BS{carData.EmissionNormCompliance}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>
          <Box flex={1}>
            <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom color="primary">
                Pricing & Ratings
              </Typography>
              <Stack spacing={2}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {formatPrice(carData.Price)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Ex-Showroom Price</Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Engine Rating
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Rating value={carData.engin_rating / 20} precision={0.1} readOnly size="small" />
                    <Typography variant="body2" fontWeight="bold">
                      {carData.engin_rating}/100
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    AiCarAdvisor Score
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Rating value={carData.total_engin_rating / 20} precision={0.1} readOnly size="small" />
                    <Typography variant="body2" fontWeight="bold">
                      {carData.total_engin_rating}/100
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Paper>
          </Box>
        </Box>
      ),
    },
    {
      id: 'engine',
      title: 'Engine & Performance',
      icon: EngineIcon,
      content: (
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
          <Box flex={1}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Engine Specifications
              </Typography>
              <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Transmission:</Typography>
                  <Typography variant="body2" fontWeight="bold">{carData.Engine.Transmission}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Engine Capacity:</Typography>
                  <Typography variant="body2" fontWeight="bold">{carData.Engine.EngineCapacity}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Max Power:</Typography>
                  <Typography variant="body2" fontWeight="bold">{carData.Engine.MaxPowerBhp} bhp @ {carData.Engine.MaxPowerRpm} rpm</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Max Torque:</Typography>
                  <Typography variant="body2" fontWeight="bold">{carData.Engine.MaxTorqueBhp} Nm @ {carData.Engine.MaxTorqueRpm} rpm</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Cylinders:</Typography>
                  <Typography variant="body2" fontWeight="bold">{carData.Engine.Cylinder}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Valves:</Typography>
                  <Typography variant="body2" fontWeight="bold">{carData.Engine.Valves}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Fuel Tank:</Typography>
                  <Typography variant="body2" fontWeight="bold">{carData.Engine.FuelTank} L</Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>
          <Box flex={1}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Drive & Performance
              </Typography>
              <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Drive Type:</Typography>
                  <Typography variant="body2" fontWeight="bold">{carData.Engine.DriveType}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Gear Box:</Typography>
                  <Typography variant="body2" fontWeight="bold">{carData.Engine.GearBox} Speed</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Engine Config:</Typography>
                  <Typography variant="body2" fontWeight="bold">{carData.Engine.EngineConf}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Gear Config:</Typography>
                  <Typography variant="body2" fontWeight="bold">{carData.Engine.GearConf}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Sports Mode:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {carData.Engine.SportsModeDrive ? 'Available' : 'Not Available'}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>
        </Box>
      ),
    },
    {
      id: 'parking',
      title: 'Parking Support',
      icon: ParkingIcon,
      content: renderFeatureList(carData.PARKINGSUPPORT, 'parking'),
    },
    {
      id: 'safety',
      title: 'Safety Features',
      icon: SafetyIcon,
      content: (
        <Box>
          {renderFeatureList(carData.Safety, 'safety')}
        </Box>
      ),
    },
    {
      id: 'interior',
      title: 'Interior Features',
      icon: InteriorIcon,
      content: renderFeatureList(carData.Interior, 'interior'),
    },
    {
      id: 'automation',
      title: 'Automation Features',
      icon: AutomationIcon,
      content: renderFeatureList(carData.AutomationsID, 'automation'),
    },
    {
      id: 'entertainment',
      title: 'Entertainment & Connectivity',
      icon: EntertainmentIcon,
      content: renderFeatureList(carData.ENTERTAINMENTANDCONNECT, 'entertainment'),
    },
    {
      id: 'display',
      title: 'Driver Display',
      icon: DashboardIcon,
      content: renderFeatureList(carData.DRIVERDISPLAY, 'display'),
    },
    {
      id: 'exterior',
      title: 'Exterior Features',
      icon: ExteriorIcon,
      content: renderFeatureList(carData.EXTERIOR, 'exterior'),
    },
    {
      id: 'luxury',
      title: 'Luxury Features',
      icon: LuxuryIcon,
      content: renderFeatureList(carData.Luxury, 'luxury'),
    },
    {
      id: 'review',
      title: 'AI Review & Analysis',
      icon: StarIcon,
      content: (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom color="primary">
            AI-Powered Review Summary
          </Typography>
          
          {/* Sentiment Display */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Sentiment
            </Typography>
            <Chip 
              label="Generally Positive" 
              color="success" 
              variant="outlined"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
          
                     {/* Complete Review Summary */}
           <Box
             sx={{
               backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
               borderRadius: 2,
               p: 3,
               border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
             }}
           >
             <div 
               style={{ 
                 lineHeight: 1.6,
                 fontSize: '14px',
                 color: mode === 'dark' ? '#e0e0e0' : '#333'
               }}
               dangerouslySetInnerHTML={{ 
                 __html: carData.AI_REVIEW.ReviewSummary
                   .replace(/\n\n/g, '<br/><br/>')
                   .replace(/\n/g, '<br/>')
                   .replace(/\*\s*/g, '• ')
               }} 
             />
           </Box>
        </Paper>
      ),
    },
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      {/* Header Section */}
      <Card elevation={3} sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent sx={{ color: 'white' }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 60, height: 60 }}>
              <CarIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {carData.Brand} {carData.ModelName}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {carData.VariantName} ({carData.ModelYear})
              </Typography>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" gap={4} flexWrap="wrap">
            <Box textAlign="center">
              <Typography variant="h5" fontWeight="bold">
                {formatPrice(carData.Price)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Ex-Showroom Price
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight="bold">
                {carData.Mileage} kmpl
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Mileage
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight="bold">
                {carData.total_engin_rating}/100
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                AiCarAdvisor Score
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Car Images */}
      {carData.images && carData.images.length > 0 && (
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Car Images
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={2}>
              {carData.images.map((image, index) => (
                <Box key={index} sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <Box
                    component="img"
                    src={image.CarImageURL}
                    alt={`${carData.ModelName} - Image ${index + 1}`}
                    sx={{
                      width: '100%',
                      height: 200,
                      objectFit: 'cover',
                      borderRadius: 2,
                      border: `2px solid ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    }}
                  />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Detailed Sections */}
      {sections.map((section) => (
        <Accordion
          key={section.id}
          expanded={expandedSection === section.id}
          onChange={handleAccordionChange(section.id)}
          elevation={2}
          sx={{ mb: 1 }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              '&:hover': {
                backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
              },
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <section.icon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                {section.title}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 3 }}>
            {section.content}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default CarDetails;
