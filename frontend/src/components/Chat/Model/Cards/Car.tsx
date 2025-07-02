import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';


const TeslaCard: React.FC = () => {
  const specs: { label: string; value: string }[] = [
    { label: 'Power', value: '670 hp' },
    { label: '0–60 mph', value: '3.1s 0–60 mph' },
    { label: 'Engine', value: 'Dual Motor AWD' },
    { label: 'Top Speed', value: '200 mph' },
    { label: 'Range', value: '405 miles' },
    { label: 'Fuel Type', value: 'Electric' },
  ];

  const features: string[] = [
    'Autopilot',
    'Premium Interior',
    'Supercharging',
    'Over-the-air Updates',
  ];

  return (
    <Card sx={{ maxWidth: 380, borderRadius: 4, boxShadow: 4, position: 'relative' }}>
      {/* Image */}
      <CardMedia
        component="img"
        height="200"
        image="https://imgd.aeplcdn.com/370x208/n/kqn9cva_1595897.jpg?q=80"
        alt="Tesla Model S"
      />

      {/* Overlay Elements */}
      <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
        <Chip label="Electric Sedan" color="primary" icon={<ElectricCarIcon />} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: 170,
          left: 16,
          backgroundColor: 'white',
          px: 1.5,
          py: 0.5,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" fontWeight="bold" color="primary">
          $89,990
        </Typography>
      </Box>

      {/* Content */}
      <CardContent>
        <Typography variant="h5"  fontWeight="bold" gutterBottom>
          Tesla Model S
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          Tesla
        </Typography>
<Box
  sx={{
    display:"grid",
      gridTemplateColumns:"1fr 1fr",
    gap: 2,
    my: 1,
  }}
>
  {specs.map((item) => (
 <Box
  key={item.label}
  sx={{
    width: {
      xs: '100%',
      
    },
    px: 2,
    py: 1,
    borderRadius: 2,
    backgroundColor: 'grey.100',
    border: '1px solid',
    borderColor: 'grey.300',
    textAlign: 'center',
  }}
>
  <Typography
   variant="caption" // smaller than body2
    color="text.secondary"
    display="block"
    sx={{ lineHeight: 1.2, fontWeight:"bold" }}
  >
    {item.label}
  </Typography>
  <Typography
   variant="caption" // smaller than body2
    color="text.secondary"
    display="block"
    sx={{ lineHeight: 1.2 }}
  >
    {item.value}
  </Typography>
</Box>


  ))}
</Box>



        {/* Features */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Key Features
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
          {features.map((feature) => (
            <Chip key={feature} label={feature} color="info" variant="outlined" />
          ))}
        </Stack>

        {/* Actions */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Button variant="outlined" fullWidth>
              Less Details
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button variant="contained" fullWidth>
              Contact Dealer
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default TeslaCard;
