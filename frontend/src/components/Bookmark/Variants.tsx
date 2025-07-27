"use client"
import React from 'react';
import { Box, Card, CardMedia, CardContent, Typography, Stack, AppBar, Toolbar, IconButton } from '@mui/material';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import KeyboardBackspaceSharpIcon from '@mui/icons-material/KeyboardBackspaceSharp';
import carimg from "../../../public/assets/card-img.png";
import { useRouter } from 'next/navigation';
import dummyData from "../../utils/dummy/Data.json"; // Assuming you have a dummy data file for cars
import { useChats } from '@/Context/ChatContext';
import { useCookies } from 'react-cookie';
type Car = {
  id: number;
  image: string;
  name: string;
  variant: string;
  price: string;
};

type Props = {
  cars?: Car[];
};

const dummyCars: Car[] = [
  {
    id: 1,
    image: carimg.src,
    name: "Tesla Model S",
    variant: "Long Range",
    price: "₹80L"
  },
  {
    id: 2,
    image: carimg.src,
    name: "Tata Nexon EV",
    variant: "XZ+",
    price: "₹15L"
  },
  {
    id: 3,
    image: carimg.src,
    name: "Hyundai Kona",
    variant: "Premium",
    price: "₹23L"
  },
  {
    id: 4,
    image: carimg.src,
    name: "MG ZS EV",
    variant: "Excite",
    price: "₹22L"
  },
  {
    id: 5,
    image: carimg.src,
    name: "Mahindra XUV400",
    variant: "EL Pro",
    price: "₹19L"
  }
];

const Variants: React.FC<Props> = ({ cars = dummyCars}) => {
      const router = useRouter();
      const [cookies, setCookie, removeCookie]=useCookies(["selectedOption"])
  const onBack = () => router.back();
  const {handleBookmark}=useChats()


  const onclick = (car: any) => {
    //   removeCookie("selectedOption", { path: "/" });
    handleBookmark(car);
       router.push('/home'); // Navigate to car details page
  };
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fb" }}>
      {/* Sticky Navbar */}
     <AppBar position="fixed" elevation={0} sx={{ bgcolor: "#1976d2" }}>
  <Toolbar>
    <IconButton edge="start" color="inherit" onClick={onBack} aria-label="back">
      <KeyboardBackspaceSharpIcon />
    </IconButton>
    <Typography variant="h6" fontWeight="bold" sx={{ ml: 2 }}>
      Bookmarks
    </Typography>
  </Toolbar>
</AppBar>
<Box sx={{ pt: 8, py: 4, px: { xs: 2, md: 6 } }}>
  {/* ...rest of your content... */}
</Box>
      <Box sx={{ py: 4, px: { xs: 2, md: 6 } }}>
        <Stack direction="row" alignItems="center" gap={1} mb={4}>
          <BookmarkBorderIcon sx={{ color: "#1976d2", fontSize: 32 }} />
          <Typography variant="h5" fontWeight="bold" color="primary">
            Bookmarked Cars
          </Typography>
        </Stack>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            justifyContent: { xs: "center", md: "flex-start" },
          }}
        >
          {cars.map((car) => (
            <Box
              key={car.id}
              sx={{
                flex: {
                  xs: "1 1 48%",    // 2 cards per row on xs
                  sm: "1 1 48%",    // 2 cards per row on sm/md
                  md: "1 1 48%",
                  lg: "1 1 31%",    // 3 cards per row on lg+
                },
                maxWidth: 380,
                minWidth: 200,
                boxSizing: "border-box",
              }}
                onClick={() => {onclick(dummyData)}} // Handle bookmark click
            >
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 4px 16px rgba(25, 118, 210, 0.08)",
                  position: "relative",
                  transition: "box-shadow 0.2s",
                  "&:hover": {
                    boxShadow: "0 8px 24px rgba(25, 118, 210, 0.18)",
                  },
                  bgcolor: "#fff",
                }}
              >
                <CardMedia
                  component="img"
                  height="160"
                  image={car.image}
                  alt={car.name}
                  sx={{
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    objectFit: "cover",
                  }}
                />
                <CardContent>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography variant="h6" fontWeight="bold">{car.name}</Typography>
                    <BookmarkBorderIcon sx={{ color: "#1976d2" }} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>
                    {car.variant}
                  </Typography>
                  <Typography variant="body2" color="primary" fontWeight="bold">
                    {car.price}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Variants;