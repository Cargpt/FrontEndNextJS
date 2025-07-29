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
import CloseIcon from '@mui/icons-material/Close';

type Car = {
  id: number;
  image: string;
  name: string;
  variant: string;
  price: string;
};

type Props = {
  bookmarks?: Car[];
};



const Variants: React.FC<Props> = () => {

      const [bookmarks, setBookmarks] = useState<any[]>([]);
      const router = useRouter();
      const [cookies, setCookie, removeCookie]=useCookies(["selectedOption", "user"])



  const onBack = () => router.back();
  const {handleBookmark, setCars, cars}=useChats()

const onclick = async (car: Car) => {
  await handleBookmark(car);
  router.push('/home');
};


  const fetchBookmarks = async () => {
    const response = await axiosInstance1.get('/api/cargpt/bookmark/detailed/');
     // Adjust the API endpoint as needed
     setBookmarks(response); // Fallback to dummy data if API fails
  }

  useEffect(() => {
    if(cookies.user) {
      fetchBookmarks();
    }
  }, [cookies.user]);


const handleRemove = async (car: any) => {
  try {
    const payload = {
     "variant_id": car?.VariantID
}
    await axiosInstance1.post(`/api/cargpt/bookmark/toggle/`, payload); // Adjust endpoint
    setBookmarks((prev) => prev.filter((bookmark) => bookmark.VariantID !== car?.VariantID));

    const update =updateBookmarkByVariantID(cars, car?.VariantID, false);
      setCars((prev) => [
        ...prev,
        { [`${car?.BrandName}_${car?.ModelName}`]: update }, // Update the specific car's variants
      ])
    
  } catch (error) {
    console.error("Failed to remove bookmark:", error);
  }
};

function updateBookmarkByVariantID(data:any, variantId:number, newState:boolean) {
  for (const modelGroup of data) {
    for (const modelName in modelGroup) {
      const variants = modelGroup[modelName];
      for (const variant of variants) {
        if (variant.VariantID === variantId) {
          variant.is_bookmarked = newState;
          return variant; // Return updated variant
        }
      }
    }
  }
  return null; // VariantID not found
}

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
         {bookmarks?.map((car) => (
            <Box
              key={car.id}
              sx={{
                flex: {
                  xs: "1 1 48%",
                  sm: "1 1 48%",
                  md: "1 1 48%",
                  lg: "1 1 31%",
                },
                maxWidth: 380,
                minWidth: 200,
                boxSizing: "border-box",
                cursor: "pointer",
              }}
              onClick={() => onclick(car)}
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
                {/* Remove (Cross) Button */}
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents card click
                    handleRemove(car);
                  }}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    zIndex: 1,
                    bgcolor: "rgba(255,255,255,0.7)",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,1)",
                    },
                  }}
                  aria-label="remove bookmark"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>

                <CardMedia
                  component="img"
                  height="160"
                  image={car?.CarImageDetails?.[0]?.CarImageURL || '/assets/card-img.png'}
                  alt={car.name}
                  sx={{
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    objectFit: "cover",
                  }}
                />
                <CardContent>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography variant="h6" fontWeight="bold">
                      {car?.BrandName} {car?.ModelName}
                    </Typography>
                
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