"use client"
import React, { useEffect, useState } from 'react';
import { Box, Card, CardMedia, CardContent, Typography, Stack, AppBar, Toolbar, IconButton } from '@mui/material';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import KeyboardBackspaceSharpIcon from '@mui/icons-material/KeyboardBackspaceSharp';
import { useRouter } from 'next/navigation';
import { useChats } from '@/Context/ChatContext';
import { useCookies } from 'react-cookie';
import { axiosInstance1 } from '@/utils/axiosInstance';
import { formatInternational } from '@/utils/services';
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



const Variants: React.FC<Props> = () => {

      const [cars, setCars] = useState<any[]>([]);
      const router = useRouter();
      const [cookies, setCookie, removeCookie]=useCookies(["selectedOption", "user"])



  const onBack = () => router.back();
  const {handleBookmark}=useChats()


  const onclick = (car: any) => {
    //   removeCookie("selectedOption", { path: "/" });
    handleBookmark(car);
       router.push('/home'); // Navigate to car details page
  };


  const fetchBookmarks = async () => {
    const response = await axiosInstance1.get('/api/cargpt/bookmark/detailed/');
     // Adjust the API endpoint as needed
     setCars(response); // Fallback to dummy data if API fails
  }

  useEffect(() => {
    if(cookies.user) {
      fetchBookmarks();
    }
  }, [cookies.user]);


  console.log("Fetched Bookmarks:", cars);

  
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
          {cars?.map((car) => (
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
                onClick={() => {onclick(car)}} // Handle bookmark click
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
                  width="160"

                  image={car?.CarImageDetails?.[0]?.CarImageURL || '/assets/card-img.png' }
                  alt={car.name}
                  sx={{
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    objectFit: "cover",
                  }}
                />
                <CardContent>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography variant="h6" fontWeight="bold">{car?.BrandName} {car?.ModelName}</Typography>
                    <BookmarkBorderIcon sx={{ color: "#1976d2" }} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>
                    {car?.VariantName}
                  </Typography>
                  <Typography variant="body2" color="primary" fontWeight="bold">
                     ₹{formatInternational(car.Price)}
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