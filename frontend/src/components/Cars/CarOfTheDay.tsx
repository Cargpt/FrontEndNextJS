'use client';

import React from 'react';
import { Box, Card, CardContent, CardMedia, Typography, Chip, Stack, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';

type Car = {
  name: string;
  price: string;
  fuel: string;
  transmission: string;
  mileage: string;
  image: string;
};

const cars: Car[] = [
  {
    name: 'Hyundai Creta SX (O)',
    price: '₹ 18.2L on-road',
    fuel: 'Petrol',
    transmission: 'Automatic',
    mileage: '17.4 kmpl',
    image: '/assets/card-img.png',
  },
  {
    name: 'Maruti Grand Vitara Alpha',
    price: '₹ 19.1L on-road',
    fuel: 'Hybrid',
    transmission: 'Automatic',
    mileage: '27.0 kmpl',
    image: '/assets/icons/3.png',
  },
  {
    name: 'Tata Nexon Fearless+',
    price: '₹ 14.6L on-road',
    fuel: 'Petrol',
    transmission: 'DCT',
    mileage: '17.0 kmpl',
    image: '/assets/icons/8.png',
  },
  {
    name: 'Kia Seltos HTX+',
    price: '₹ 18.8L on-road',
    fuel: 'Diesel',
    transmission: 'Automatic',
    mileage: '19.1 kmpl',
    image: '/assets/icons/6.png',
  },
];

function pickCarOfTheDay(): Car {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const index = seed % cars.length;
  return cars[index];
}

export default function CarOfTheDay() {
  const theme = useTheme();
  const router = useRouter();
  const car = pickCarOfTheDay();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 3 }, mt: 3 }}>
      <Card
        elevation={isDark ? 6 : 2}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          overflow: 'hidden',
          background: isDark ? theme.palette.background.paper : '#ffffff',
          borderRadius: 2,
        }}
      >
        <CardMedia
          component="img"
          image={car.image}
          alt={car.name}
          sx={{
            width: { xs: '100%', sm: 420 },
            height: { xs: 200, sm: 260 },
            objectFit: 'cover',
          }}
        />
        <CardContent sx={{ flex: 1, p: { xs: 2.5, sm: 3 } }}>
          <Typography variant="overline" sx={{ color: theme.palette.text.secondary }}>
            Car of the Day
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color: theme.palette.text.primary }}>
            {car.name}
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 0.5, color: theme.palette.primary.main, fontWeight: 600 }}>
            {car.price}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
            <Chip label={`Fuel: ${car.fuel}`} size="small" />
            <Chip label={`Transmission: ${car.transmission}`} size="small" />
            <Chip label={`Mileage: ${car.mileage}`} size="small" />
          </Stack>

          <Typography variant="body2" sx={{ mt: 1.5, color: theme.palette.text.secondary }}>
            Handpicked daily based on popularity, value, and user interest. Explore specs, compare with rivals,
            and book a test drive instantly.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2 }}>
            <Button variant="contained" onClick={() => router.push('/home')}>
              View Details
            </Button>
            <Button variant="outlined" onClick={() => router.push('/booked-test-drive')}>
              Book Test Drive
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}


