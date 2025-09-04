// Function to handle favorite click and send VariantID

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ElectricCarIcon from "@mui/icons-material/ElectricCar";
import { Stack, Chip, Menu, MenuItem } from "@mui/material";
import FaceIcon from "@mui/icons-material/Face";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";

import { useChats } from "@/Context/ChatContext";
import { useCookies } from "react-cookie";
import Slider, { Settings } from "react-slick";
import CarGallery from "@/components/common/Dialogs/CarGallery/CarGallery";
import ScoreDialog from "@/components/common/Dialogs/ScoreDialog/ScoreDialog";
import EMIDialog from "@/components/common/Dialogs/EMIDialog/EMIDialog";
import SentimentDialog from "@/components/common/Dialogs/SentimentDialog/SentimentDialog";
import BookTestDrive from "@/components/common/Dialogs/TestDrivemodel/Booktestdrive"; 
import { Avatar, IconButton, useTheme } from "@mui/material";
import BrandName from "@/components/common/BrandName";
import CollectionsIcon from "@mui/icons-material/Collections";
import LoginDialog from "@/components/common/Dialogs/LoginDialog";
import { useLoginDialog } from "@/Context/LoginDialogContextType";
import { axiosInstance1 } from "@/utils/axiosInstance";
import { useSnackbar } from "@/Context/SnackbarContext";
import { formatInternational, generateCarChatMessage } from "@/utils/services";
import { Sign } from "crypto";
import SignupDialog from "@/components/Auth/SignupDialog";
import { useColorMode } from "@/Context/ColorModeContext";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import CircularProgress from "@mui/material/CircularProgress";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import { LightbulbOutline, PictureAsPdf } from "@mui/icons-material";
import CompareCarsDialog from "./CompareCarsDialog";
import CompareVsSelector from "./CompareVsSelector";
import MobileNumberDialog from "@/components/Auth/MobileNumberDialog";
import ShareButtons from "@/components/common/ShareButtons";
import CarPDF from "./CarPDF";
import { downloadPDF, generateCarPDFFilename } from "@/utils/pdfUtils";

type Props = {
  onClick?: () => void;
  selectedItem: any; 
  handleNeedAdviceSupport: () => void;
  variant?: "default" | "compact";
};

interface typeProps {
  open: boolean;
  type: string | null;
}

interface VariantColor {
  ColorHex: string;
}
interface CarDetailsForBooking {
  BrandID: number;
  ModelID: number;
  VariantID: number;
  BrandName: string;
  ModelName: string;
  VariantName?: string;
}
interface CarCardProps extends Props {
  onTriggerOverallRecommendations?: () => Promise<void | boolean>;
}

const TeslaCard: React.FC<CarCardProps> = ({
  onClick,
  selectedItem,
  handleNeedAdviceSupport,
  variant = "default",
  onTriggerOverallRecommendations,
}) => {


  const rawValues = Object.values(selectedItem);

  const { open, hide, show } = useLoginDialog();

  const modelCars: any[] = selectedItem.comparedCars
  ? selectedItem.comparedCars
  : (Array.isArray(rawValues[0]) ? rawValues[0] : []);

  const theme = useTheme();
  const [carInfo, setCarInfo] = useState<any>(null);
  const [dialog, setDialog] = useState<typeProps>({ open: false, type: null });
  const [imageBase64Map, setImageBase64Map] = useState<{ [key: string]: string }>({});
  const [imagesLoading, setImagesLoading] = useState(false);

  const favouteStates = modelCars.reduce((acc, car, index) => {
    acc[index] = car?.is_bookmarked;
    return acc;
  }, {});

  // Function to pre-fetch all car images and convert to base64
  const preFetchCarImages = async (cars: any[]) => {
    setImagesLoading(true);
    const imageMap: { [key: string]: string } = {};
    
    try {
      for (const car of cars) {
        if (car?.CarImageDetails && Array.isArray(car.CarImageDetails)) {
          for (const imageDetail of car.CarImageDetails) {
            if (imageDetail.CarImageURL && !imageMap[imageDetail.CarImageURL]) {
              try {
                console.log('Fetching image:', imageDetail.CarImageURL);
                
                // Method 1: Try fetch with proper headers (like CardMedia uses)
                const response = await fetch(imageDetail.CarImageURL, {
                  method: 'GET',
                  headers: {
                    'Accept': 'image/*',
                    'Referer': window.location.origin,
                    'User-Agent': navigator.userAgent,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                  },
                  mode: 'cors',
                  credentials: 'omit'
                });
                
                if (response.ok) {
                  const blob = await response.blob();
                  const base64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                  });
                  
                  imageMap[imageDetail.CarImageURL] = base64;
                  console.log('Successfully converted image to base64 via fetch:', imageDetail.CarImageURL);
                } else {
                  console.warn('Fetch failed, trying img element approach...');
                  throw new Error('Fetch failed');
                }
              } catch (error) {
                console.log('Fetch approach failed, trying img element method:', imageDetail.CarImageURL);
                
                // Method 2: Use img element approach (like CardMedia does)
                try {
                  const base64 = await new Promise<string>((resolve, reject) => {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    
                    img.onload = () => {
                      try {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.naturalWidth;
                        canvas.height = img.naturalHeight;
                        
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                          ctx.drawImage(img, 0, 0);
                          const dataURL = canvas.toDataURL('image/jpeg', 0.8);
                          resolve(dataURL);
                        } else {
                          reject(new Error('Could not get canvas context'));
                        }
                      } catch (canvasError) {
                        reject(canvasError);
                      }
                    };
                    
                    img.onerror = () => {
                      reject(new Error('Image failed to load'));
                    };
                    
                    // Set timeout to prevent hanging
                    setTimeout(() => reject(new Error('Image load timeout')), 10000);
                    
                    img.src = imageDetail.CarImageURL;
                  });
                  
                  imageMap[imageDetail.CarImageURL] = base64;
                  console.log('Successfully converted image to base64 via img element:', imageDetail.CarImageURL);
                  
                } catch (imgError) {
                  console.error('Img element approach also failed:', imgError);
                  
                  // Method 3: Final fallback - try no-cors
                  try {
                    console.log('Trying no-cors fallback for:', imageDetail.CarImageURL);
                    const noCorsResponse = await fetch(imageDetail.CarImageURL, {
                      method: 'GET',
                      mode: 'no-cors',
                      credentials: 'omit'
                    });
                    
                    if (noCorsResponse.type === 'opaque') {
                      console.log('No-cors fallback successful (opaque response)');
                      imageMap[imageDetail.CarImageURL] = 'no-cors-fallback';
                    }
                  } catch (noCorsError) {
                    console.error('All methods failed for image:', imageDetail.CarImageURL);
                  }
                }
              }
            }
          }
        }
      }
      
      setImageBase64Map(imageMap);
      console.log('Image pre-fetching completed. Total images:', Object.keys(imageMap).length);
    } catch (error) {
      console.error('Error in image pre-fetching:', error);
    } finally {
      setImagesLoading(false);
    }
  };
  const [favoriteStates, setFavoriteStates] = useState<{
    [key: number]: boolean;
  }>(favouteStates);
  const { messages, setMessages, cars, setCars } = useChats();
  const [cookies, setCookie] = useCookies(["selectedOption", "user", "token"]);
  const [testDriveModalOpen, setTestDriveModalOpen] = useState(false);
  const [selectedCarForTestDrive, setSelectedCarForTestDrive] =
    useState<CarDetailsForBooking | null>(null);
  const { showSnackbar } = useSnackbar();
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleMobileSuccess = (resp: any) => {
    if (resp?.mobileNumber) {
        setCookie("user", { ...cookies.user, mobile_no: resp.mobileNumber }, {
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
        });
    }
    setShowMobileDialog(false);
    if (selectedCarForTestDrive) {
        setTestDriveModalOpen(true);
    }
  };

  const [showSignUpState, setshowSignUpState] = useState<boolean>(false);
  const [loadingRecommendations, setLoadingRecommendations] =
    useState<boolean>(false);
  const [loadingOverallRecommendations, setLoadingOverallRecommendations] =
    useState<boolean>(false); 
 
  const [moreRecDisabled, setMoreRecDisabled] = useState<boolean>(false);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [selectedCarForCompare, setSelectedCarForCompare] = useState<any>(null);
  const [showCompareInline, setShowCompareInline] = useState(false);
  const [allButtonsDisabled, setAllButtonsDisabled] = useState(false);

  const [showMobileDialog, setShowMobileDialog] = useState(false);
  const [mobileDialogUserData, setMobileDialogUserData] = useState<any>(null);

  const showSignUP = () => {
    setshowSignUpState(true);
    hide();
  };
  const [chipsDisabled, setChipsDisabled] = useState(false);
  const [compareChipDisabled, setCompareChipDisabled] = useState(false);

  // Pre-fetch images when component mounts or when modelCars changes
  useEffect(() => {
    if (selectedItem && modelCars.length > 0) {
      console.log('Triggering image pre-fetch for', modelCars.length, 'cars');
      preFetchCarImages(modelCars);
    }
  }, [selectedItem, modelCars]);

  const hideSignUP = () => {
    setshowSignUpState(false);
  };
 
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentSort, setCurrentSort] = useState<string>("none");
  const handleSelectSort = (value: "none" | "price" | "mileage") => {
    setCurrentSort(value);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("car-sort", { detail: value }));
    }
    setAnchorEl(null);
  };
  const handleFavoriteClick = async (
    variant: any,
    variantId: number,
    index: number
  ) => {
    if (!cookies.user) {
      show();

    } else {
      const paload = {
        variant_id: variantId,
      };
      try {
        const response = await axiosInstance1.post(
          "/api/cargpt/bookmark/toggle/",
          paload
        );

        setFavoriteStates((prev) => ({ ...prev, [index]: !prev[index] }));

        setCars((prevCars) => {
          return prevCars.map((carGroup) => {
            const newCarGroup = { ...carGroup };
            for (const modelName in newCarGroup) {
              if (Array.isArray(newCarGroup[modelName])) {
                newCarGroup[modelName] = newCarGroup[modelName].map((v: any) =>
                  v.VariantID === variantId
                    ? { ...v, is_bookmarked: !favoriteStates[index] }
                    : v
                );
              }
            }
            return newCarGroup;
          });
        });

        let msg = "Car added to your bookmarks";
        if (!favoriteStates[index] === false) {
          msg = "Car removed from your bookmarks";
        }
        showSnackbar(msg, {
          vertical: "top",
          horizontal: "center",
          autoHideDuration: 7000,
          color: "success",
        });

        return true; 
      } catch (error: any) {
        console.error(error);
        let err = "Variant is discountinued";
        if (error?.status === 500) {
          err = "Something went wrong! please try again after sometimes.";
        }
        showSnackbar(err);
        return false;
      }
    }
  };

  const handleRecommendByPrice = async (
    price: number,
    modelId: number,
    modelName: string
  ) => {
    setLoadingRecommendations(true);
    try {
      const payload = {
        price: price,
        model_id: modelId,
      };
      const response = await axiosInstance1.post(
        "/api/cargpt/recommend-by-price/",
        payload
      );

      if (response?.data && response.data.length > 0) {
        const recommendedCars = response.data;
        const count = recommendedCars.length;
        const carPlural = count === 1 ? "car" : "cars";

        const userMessage: Message = {
          id: String(Date.now()),
          message: `Show recommendations for ${modelName} at price ${formatInternational(
            price
          )}`, 
          render: "text",
          sender: "user",
        };

        const botMessage: Message = {
          id: String(Date.now() + 1),
          message: { [`${modelName}_Recommendations`]: recommendedCars },
          render: "carOptions", 
          sender: "bot",
        };

        setMessages((prev) => [...prev, userMessage, botMessage]);
        showSnackbar(
          `Found ${count} recommended ${carPlural} for ${modelName}.`,
          {
            vertical: "top",
            horizontal: "center",
            autoHideDuration: 7000,
            color: "success",
          }
        );
      } else {
        showSnackbar("No recommendations found for this car.", {
          horizontal: "center",
          vertical: "bottom",
        });
      }
    } catch (error: any) {
      console.error("Error fetching recommendations:", error);
      let errorMessage =
        "Failed to fetch recommendations. Please try again later.";
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      showSnackbar(errorMessage, {
        horizontal: "center",
        vertical: "bottom",
      });
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const userMessage = {
    id: String(Date.now() + 1),
    message: cookies.selectedOption,
    render: "text" as const, 
    sender: "user" as const,
  };

  const openDialog = (
    type: string,
    data: any 
  ) => {
    setDialog({ open: true, type });
    if (
      type === "score" ||
      type === "sentiment" ||
      type === "gallery" ||
      type === "emi"
    ) {
      setCarInfo(data);
    }
    console.log("data", data);
  };

  const handleOpenTestDriveModal = (car: CarDetailsForBooking) => {
    setSelectedCarForTestDrive(car);

    if (!cookies.user) {
      show();
      return false;
    }
    // Check for missing mobile number before opening booking
    if (cookies.user && !(cookies.user.mobile_no || cookies.user.mobile_no_read)) {
      setMobileDialogUserData({
        email: cookies.user.email,
        first_name: cookies.user.first_name,
        last_name: cookies.user.last_name,
        photo: cookies.user.photo || ""
      });
      setShowMobileDialog(true);
      return false;
    }
    setTestDriveModalOpen(true);
  };

  const handleCloseTestDriveModal = () => {
    setTestDriveModalOpen(false);
    setSelectedCarForTestDrive(null);
  };

  const handleOpenCompareDialog = (car: any) => {
    setSelectedCarForCompare(car);
    setCompareDialogOpen(true);
  };

  const handleCloseCompareDialog = () => {
    setCompareDialogOpen(false);
    setSelectedCarForCompare(null);
  };

  const handleSaveAsPDF = async () => {
    // Get all available car data from the current search
    let allCars: any[] = [];
    let searchTitle = "Car Recommendations";
    
    // Check if we have cars from the current search
    if (selectedItem && modelCars.length > 0) {
      allCars = modelCars;
      
      // Generate a meaningful title from the search
      const keys = Object.keys(selectedItem);
      if (keys.length > 0) {
        const firstKey = keys[0];
        const cars = selectedItem[firstKey];
        if (Array.isArray(cars) && cars.length > 0) {
          const firstCar = cars[0];
          searchTitle = `${firstCar.BrandName} ${firstCar.ModelName} Variants`;
        }
      }
    } else if (cars && Object.keys(cars).length > 0) {
      // Fallback: use all cars from the chat context
      Object.values(cars).forEach((carGroup: any) => {
        if (Array.isArray(carGroup)) {
          allCars = [...allCars, ...carGroup];
        }
      });
      searchTitle = "All Car Recommendations";
    }

    if (allCars.length === 0) {
      showSnackbar("No car data available to generate PDF", {
        vertical: "top",
        horizontal: "center",
        color: "error",
      });
      return;
    }

    setPdfLoading(true);
    try {
      console.log('Starting PDF generation with data:', { 
        selectedItem, 
        modelCars, 
        allCars: allCars.length,
        searchTitle 
      });
      
      const filename = generateCarPDFFilename(selectedItem, allCars);
      const pdfComponent = <CarPDF 
        selectedItem={selectedItem} 
        modelCars={allCars}
        searchTitle={searchTitle}
        imageBase64Map={imageBase64Map}
      />;
      
      await downloadPDF(pdfComponent, filename);
      
      showSnackbar("PDF downloaded successfully!", {
        vertical: "top",
        horizontal: "center",
        color: "success",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      
      // Try to generate a simpler PDF without images as fallback
      try {
        console.log('Attempting fallback PDF generation...');
        const fallbackPdfComponent = <CarPDF 
          selectedItem={selectedItem} 
          modelCars={allCars}
          searchTitle={searchTitle}
          imageBase64Map={imageBase64Map}
        />;
        const filename = generateCarPDFFilename(selectedItem, allCars);
        
        await downloadPDF(fallbackPdfComponent, filename);
        
        showSnackbar("PDF generated successfully (simplified version)!", {
          vertical: "top",
          horizontal: "center",
          color: "success",
        });
      } catch (fallbackError) {
        console.error("Fallback PDF generation also failed:", fallbackError);
        
        let errorMessage = "Failed to generate PDF. Please try again.";
        if (error instanceof Error) {
          if (error.message.includes('Image')) {
            errorMessage = "PDF generation failed due to image loading issues. Please try again later.";
          } else if (error.message.includes('Network')) {
            errorMessage = "Network error while generating PDF. Please check your connection.";
          } else if (error.message.includes('Timeout')) {
            errorMessage = "PDF generation timed out. Please try again.";
          } else {
            errorMessage = `PDF generation failed: ${error.message}`;
          }
        }
        
        showSnackbar(errorMessage, {
          vertical: "top",
          horizontal: "center",
          color: "error",
        });
      }
    } finally {
      setPdfLoading(false);
    }
  };
  const CustomNextArrow = (props: any & { outside?: boolean }) => {
    const { className, onClick, style, outside } = props;
    const { mode } = useColorMode();

    return (
      <ArrowForwardIosIcon
        className={className}
        onClick={onClick}
        sx={{
          ...style,
          color: mode === "dark" ? "#fff" : "#ccc",
          fontSize: 30,
          cursor: "pointer",
          right: outside ? { xs: 10, sm: -8, md: -16 } : 10,
          zIndex: 10,
          "&:hover": {
            color: mode === "dark" ? "#ddd" : "#222",
          },
        }}
      />
    );
  };
  const CustomPrevArrow = (props: any & { outside?: boolean }) => {
    const { className, onClick, style, outside } = props;
    const { mode } = useColorMode();

    return (
      <ArrowBackIosNewIcon
        className={className}
        onClick={onClick}
        sx={{
          ...style,
          color: mode === "dark" ? "#fff" : "#ccc",
          fontSize: 30,
          cursor: "pointer",
          left: outside ? { xs: 10, sm: -8, md: -16 } : 10,
          zIndex: 10,
          "&:hover": {
            color: mode === "dark" ? "#ddd" : "#222",
          },
        }}
      />
    );
  };

  const isCompact = variant === "compact";
  const showTwo = modelCars.length >= 2;
  const settings: Settings = {
    infinite: false,
    speed: 500,
    slidesToShow: showTwo ? 2 : 1,
    slidesToScroll: 1,
    autoplay: isCompact ? false : true,
    autoplaySpeed: 3000,
    dots: false,
    arrows: showTwo,
    nextArrow: <CustomNextArrow outside={variant === "compact"} />,
    prevArrow: <CustomPrevArrow outside={variant === "compact"} />,

    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: false,
          centerMode: false,
          centerPadding: "0px",
        },
      },
    ],
  };
  const backTOIntial = () => {
    setMessages((prev) => [...prev, userMessage]);
  };

  console.log("cars", cars);
  const { mode } = useColorMode();

  const message = selectedItem
    ? generateCarChatMessage(selectedItem || {}, modelCars.length)
    : "";
  console.log(typeof message);
  return (
    <>
      {selectedItem && (
        <Box
          sx={{
            px: 2,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Typography sx={{ fontWeight: "bold" }}>{message}</Typography>
          {modelCars.length > 1 && (
            <Box>
              <IconButton
                size="small"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                aria-label="Filter"
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 0.5,
                }}
              >
                <img
                  src="/assets/funnel.svg"
                  alt="Filter"
                  width={18}
                  height={18}
                  style={{ filter: mode === "dark" ? "invert(100%)" : "none" }}
                />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem
                  selected={currentSort === "none"}
                  onClick={() => handleSelectSort("none")}
                >
                  Default
                </MenuItem>
                <MenuItem
                  selected={currentSort === "price"}
                  onClick={() => handleSelectSort("price")}
                >
                  Price
                </MenuItem>
                <MenuItem
                  selected={currentSort === "mileage"}
                  onClick={() => handleSelectSort("mileage")}
                >
                  Mileage
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Box>
      )}

      {modelCars.length > 0 && (
        <Box
          sx={{
            width: { xs: "100%", md: modelCars.length < 2 ? "50%" : "100%", overflow: "hidden"  },
          }}
        >
          <Slider {...settings}>
            {modelCars.map((car: any, index: number) => (
              <Card
                key={index}
                sx={{
                  borderRadius: isCompact ? 1 : 2,
                  position: "relative",
                  display: "flex",
                  width: "100%",
                  backgroundColor:
                    mode === "dark"
                      ? theme.palette.background.paper
                      : "#ffffff",
                  border: isCompact ? "1px solid transparent" : undefined,
                  transition: isCompact
                    ? "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease"
                    : undefined,
                  cursor: isCompact ? "pointer" : "default",
                  "&:hover": isCompact
                    ? {
                        transform: "translateY(-2px)",
                        boxShadow:
                          mode === "dark"
                            ? "0 6px 18px rgba(0,0,0,0.6)"
                            : "0 6px 18px rgba(0,0,0,0.12)",
                        // borderColor: mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.light,
                      }
                    : undefined,
                }}
                variant="outlined"
              >
                <Box
                  sx={{
                    width: "100%",

                    height: isCompact ? 130 : 170, // or any desired responsive height
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    overflow: "hidden",
                    backgroundColor: "#ffffff", // optional placeholder background
                    borderRadius: 2,
                  }}
                >
                  <CardMedia
                    component="img"
                    image={
                      car.CarImageDetails?.[0]?.CarImageURL ||
                      "/assets/card-img.png"
                    }
                    alt="Car card"
                    sx={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                      cursor: car.CarImageDetails?.[0]?.CarImageURL
                        ? "pointer"
                        : "default",
                      pointerEvents: car.CarImageDetails?.[0]?.CarImageURL
                        ? "auto"
                        : "none",
                    }}
                    onClick={() => openDialog("gallery", car)}
                  />
                </Box>
                {/* Gallery Icon */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 1,
                    right: 8,
                    zIndex: 1,
                  }}
                >
                  <IconButton
                    disabled={!car.CarImageDetails?.[0]?.CarImageURL}
                    color="primary"
                    onClick={() => openDialog("gallery", car)}
                    sx={{ backgroundColor: "#ffffff", borderRadius: "50%" }}
                  >
                    <CollectionsIcon />
                  </IconButton>
                </Box>
                <Box sx={{ position: "absolute", top: 3, left: 8 }}>
                  <Chip
                    label={`${car.ModelName} ${
                      car.BodyName ? `- ${car.BodyName}` : ""
                    }`}
                    color="primary"
                    sx={{
                      backgroundColor: "#f5f5f5",
                      color: "black",
                      paddingX: "2px",
                      fontSize: "10px",
                      paddingY: "1px",
                    }}
                    icon={
                      <Avatar
                        src={car.logo}
                        alt={car.BrandName}
                        sx={{ width: 15, height: 15 }}
                      />
                    }
                  />
                </Box>
                <Box
                  sx={{
                    position: "absolute",
                    top: isCompact ? 88 : 110,
                    left: 16,
                    backgroundColor: "white",
                    py: 0.5,
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    fontWeight="bold"
                    color="primary"
                    fontSize={isCompact ? 16 : 18}
                    px={2}
                    sx={{
                      backgroundColor:
                        mode === "dark"
                          ? theme.palette.background.paper
                          : "#f5f5f5",
                      borderRadius: "5px",
                    }}
                  >
                    ₹{formatInternational(car.Price)}
                  </Typography>
                </Box>
                {/* Content */}
                <CardContent
                  style={{ paddingBottom: "15px", paddingTop: "2px" }}
                >
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    gutterBottom
                    sx={{
                      mb: 0,
                      fontSize: isCompact ? "14px" : "15px",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      justifyContent: "space-between",
                    }}
                  >
                                         <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                       {car.VariantName}
                       <img
                         src="/assets/Compare Syambol.png"
                         alt="Compare"
                         width={20}
                         height={20}
                         style={{ cursor: "pointer" }}
                         onClick={() => handleOpenCompareDialog(car)}
                         onMouseEnter={(e) => {
                           e.currentTarget.style.transform = 'scale(1.1)';
                           e.currentTarget.style.transition = 'transform 0.2s ease';
                         }}
                         onMouseLeave={(e) => {
                           e.currentTarget.style.transform = 'scale(1)';
                         }}
                       />
                     </Box>
                    <IconButton
                      size="small"
                      sx={{ ml: 1, p: 0.5 }}
                      onClick={() => {
                        handleFavoriteClick(car, car.VariantID, index);
                      }}
                      disabled={allButtonsDisabled}
                    >
                      {favoriteStates[index] ? (
                        <FavoriteIcon sx={{ color: "#e53935", fontSize: 18 }} />
                      ) : (
                        <FavoriteBorderIcon
                          sx={{ color: "#e53935", fontSize: 18 }}
                        />
                      )}
                    </IconButton>
                  </Typography>
                  <Typography
                    color="text.secondary"
                    gutterBottom
                    sx={{ fontSize: 12 }}
                  >
                    {car.BrandName}
                  </Typography>
                  {/* Static color palette */}
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      mb: 1,
                      width: "100%",
                      maxWidth: "100%",
                      overflowX: "auto",
                      overflowY: "hidden",
                      whiteSpace: "nowrap",
                      py: 0.5,
                      // Hide scrollbar but keep scrollability
                      scrollbarWidth: "none", // Firefox
                      msOverflowStyle: "none", // IE/Edge
                      "&::-webkit-scrollbar": { display: "none" }, // Chrome/Safari
                    }}
                  >
                    {car?.Colors?.map((color: VariantColor, idx: number) => {
                      return (
                        <Box
                          key={idx}
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            border: "1px solid #ccc",
                            cursor: "pointer",
                            flex: "0 0 auto",
                            background: color.ColorHex.includes(",")
                              ? `linear-gradient(to right, ${
                                  color.ColorHex.split(",")[0]
                                } 50%, ${color.ColorHex.split(",")[1]} 50%)`
                              : color.ColorHex,
                          }}
                        />
                      );
                    })}
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr 1fr" }, // 1 column on small screens, 2 columns on larger screens
                      gap: 1, // Reduced gap between boxes
                      my: 1,
                    }}
                  >
                    {[
                      {
                        label: `${car.FuelType}`,
                        icon: "/assets/icons/petrol-tank.png",
                      },
                      {
                        label: `${car.Trans_fullform}`,
                        icon: "/assets/icons/automation.png",
                      },
                      {
                        label: ` ${car.Seats} Seater`,
                        icon: "/assets/icons/car-seat.jpg",
                      },
                      {
                        label: ` ${car.Mileage} kmpl`,
                        icon: "/assets/icons/mileage.png",
                      },
                    ].map((item) => (
                      <Box
                        key={item.label}
                        sx={{
                          width: "100%", // Takes up 100% of its grid space
                          px: 1, // Reduced horizontal padding
                          py: 0.75, // Reduced vertical padding
                          borderRadius: 1, // Slightly smaller border radius
                          backgroundColor:
                            mode === "dark"
                              ? theme.palette.background.paper
                              : "grey.100",
                          border: "1px solid",
                          borderColor:
                            mode === "dark"
                              ? theme.palette.background.paper
                              : "grey.300",
                          textAlign: "center",
                          margin: "auto", // Center the items within their grid space
                        }}
                      >
                        <Box display="flex" justifyContent="center" mt={0.5}>
                          <img
                            loading="lazy"
                            src={item.icon}
                            alt={item.label}
                            width={20} // Reduced icon size
                            height={20}
                            style={{
                              filter: mode === "dark" ? "invert(100%)" : "none",
                            }}
                          />
                        </Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{
                            lineHeight: 1.2,
                            fontWeight: "bold",
                            fontSize: isCompact ? "11px" : "12px",
                          }} // Reduced font size
                        >
                          {item.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1, // 8px vertical spacing
                      mt: 1,
                      alignItems: "center",
                      width: {
                        xs: "100%",
                        md: "auto",
                      },
                    }}
                  >
                    {/* AiCarAdvisor (TM) Score Button */}
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        textTransform: "none",
                        fontSize: "12px",
                        height: 36, // Reduced height
                        px: 1.5,
                        borderRadius: "6px",
                        whiteSpace: "nowrap",
                        width: "100%",
                      }}
                      onClick={() => openDialog("score", car)}
                      disabled={allButtonsDisabled}
                    >
                            AiCarAdvisor Score:
                      <Box
                        component="span"
                        sx={{ fontWeight: "bold", ml: 0.5 }}
                      >
                        {car?.AIScore || "--"}
                      </Box>
                    </Button>

                    {/* User Sentiments Button */}
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        textTransform: "none",
                        fontSize: "12px",
                        height: 36,
                        px: 1.5,
                        borderRadius: "6px",
                        whiteSpace: "nowrap",
                        width: "100%",
                      }}
                      onClick={() => openDialog("sentiment", car)}
                      disabled={allButtonsDisabled}
                    >
                      User Sentiments: {car?.AISummary || "--"}
                    </Button>

                    {/* EMI and Book Test Drive Buttons in a row */}
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        width: "100%",
                        justifyContent: "center",
                      }}
                    >
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          textTransform: "none",
                          fontSize: "12px",
                          height: 36,
                          flex: 1,
                          px: 1.5,
                          borderRadius: "6px",
                        }}
                        onClick={() => openDialog("emi", car)}
                        disabled={allButtonsDisabled}
                      >
                        EMI
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          textTransform: "none",
                          fontSize: "12px",
                          height: 36,
                          flex: 1,
                          px: 1.5,
                          borderRadius: "6px",
                        }}
                        onClick={() => handleOpenTestDriveModal(car)}
                        disabled={allButtonsDisabled}
                      >
                        Book Test Drive
                      </Button>
                    </Stack>
                  </Box>

                  {/* New Recommend Button */}
                </CardContent>
              </Card>
            ))}
          </Slider>
        </Box>
      )}
      {!isCompact && (
        <Stack
          direction="row"
          gap={1.5}
          mt={1}
          flexWrap="wrap" // ✅ allow wrapping
          justifyContent={{ xs: "center", sm: "flex-start" }} // center on mobile, start on larger
          alignItems="center"
          sx={{
            pb: "15px",
            rowGap: 1, // optional: vertical gap between rows
          }}
        >
          <Chip
            label="I know exactly what I want"
            variant="filled"
            size="small"
            icon={<FaceIcon />}
            onClick={() => {
              setChipsDisabled(true);
              onClick?.();
            }}
            disabled={allButtonsDisabled || chipsDisabled}
            sx={{
              fontSize: 13,
              textTransform: "capitalize",
              borderWidth: 1,
              flex: { xs: "1 1 calc(50% - 12px)", sm: "0 auto" }, // 2 chips per row on mobile
              maxWidth: { xs: "calc(50% - 12px)", sm: "none" },
            }}
          />

          <Chip
            label="I need advisor support"
            variant="filled"
            size="small"
            color="default"
            icon={<SupportAgentIcon />}
            onClick={() => {
              setChipsDisabled(true);
              handleNeedAdviceSupport();
            }}
            disabled={allButtonsDisabled || chipsDisabled}
            sx={{
              fontSize: 13,
              textTransform: "capitalize",
              borderWidth: 1,
              flex: { xs: "1 1 calc(50% - 12px)", sm: "0 auto" }, // 2 chips per row on mobile
              maxWidth: { xs: "calc(50% - 12px)", sm: "none" },
            }}
          />

          {cookies.selectedOption === "I want to do more research on cars" && (
            <Chip
              label="Back to car research"
              variant="filled"
            size="small"
            color="default"
            disabled={allButtonsDisabled || chipsDisabled}
            
              icon={<DirectionsCarIcon />}
              onClick={backTOIntial}
              sx={{
                fontSize: 13,
                textTransform: "capitalize",
               
                borderWidth: 1,
                borderStyle: "solid",
              
                flex: { xs: "1 1 calc(50% - 12px)", sm: "0 auto" }, // 2 chips per row on mobile
                maxWidth: { xs: "calc(50% - 12px)", sm: "none" },
              }}
            />
          )}


           {onTriggerOverallRecommendations && (
    <Chip
      label={loadingOverallRecommendations ? <CircularProgress size={20} /> : "Get More Recommendations"}
      clickable
              variant="filled"
            size="small"
            color="default"
            
      icon={<LightbulbOutline/>}
      onClick={async () => {
        setLoadingOverallRecommendations(true);
        setMoreRecDisabled(true);
        const carToRecommend = modelCars[0]; // Get the first car object from the array
        try {
          const payload = {
            price: carToRecommend?.Price >= 4000000 ? 10000000 : carToRecommend?.Price  ??  0,
            model_name: carToRecommend?.ModelName || "",
            transmission: carToRecommend?.Trans_fullform === "Automatic"
              ? "AT"
              : carToRecommend?.Trans_fullform === "Manual"
                ? "MT"
                : carToRecommend?.Trans_fullform || "",
            seats: carToRecommend?.Seats || 0,
            body_type: carToRecommend?.BodyName ?? carToRecommend?.BodyType ?? "", 
            fuel: carToRecommend?.FuelType || "",
          };

          const response = await axiosInstance1.post("/api/cargpt/recommend-by-price/", payload);
          const data = response; // axiosInstance1 returns parsed data directly
          const recommendedCars = Array.isArray(data)
            ? data
            : (Array.isArray((data as any)?.recommendations) ? (data as any).recommendations : []);

          if (recommendedCars.length > 0) {
            const count = recommendedCars.length;
            const carPlural = count === 1 ? "car" : "cars";

            const userMessage: Message = {
              id: String(Date.now()),
              message: "See other recommendations",
              render: "text",
              sender: "user",
            };

            const botMessage: Message = {
              id: String(Date.now() + 1),
              message: { [`${carToRecommend?.ModelName}_Recommendations`]: recommendedCars },
              render: "carOptions",
              sender: "bot",
            };

            setMessages((prev) => [...prev, userMessage, botMessage]);
            
          } else {
            showSnackbar("No more recommendations found.", {
              horizontal: "center",
              vertical: "bottom",
            });
          }
        } catch (error: any) {
          console.error("Error fetching overall recommendations:", error);
          showSnackbar(error.message || "Failed to fetch recommendations. Please try again later.", {
            horizontal: "center",
            vertical: "bottom",
          });
          setMoreRecDisabled(false);
        } finally {
          setLoadingOverallRecommendations(false);
        }
      }}
      disabled={allButtonsDisabled || loadingOverallRecommendations || moreRecDisabled || chipsDisabled}
              

      sx={{

        fontSize: 13,
        textTransform: "capitalize",
        borderWidth: 1,
        flex: { xs: '1 1 100%', sm: '0 auto' }, // Full width on mobile to center
        maxWidth: { xs: '100%', sm: 'none' },
      }}
    />
  )}
          {/* Compare Button - same size as Get More Recommendations */}
          <Chip
            label={"Compare"}
            clickable
            variant="filled"
            size="small"
            color="default"
            icon={<img src="/assets/Compare Syambol.png" alt="Compare" width={20} height={20} style={{ marginRight: 4 }} />}
            onClick={async () => {
              setCompareChipDisabled(true);
              setAllButtonsDisabled(true); // Disable all buttons
              const compareIntroMessage = {
                id: String(Date.now()),
                message: "Please select cars to compare.",
                render: "text" as const,
                sender: "user" as const,
              };
              const msgs :Message[]=  [
                ...messages,
                compareIntroMessage,
                {
                  id: String(Date.now() + 1),
                  render: "compareVsSelector" as const,
                  sender: "bot" as const,
                  message: ""
                }
              ]
              setMessages(msgs);
            }}
            disabled={allButtonsDisabled || compareChipDisabled}
            sx={{
              fontSize: 13,
              textTransform: "capitalize",
              borderWidth: 1,
              flex: { xs: '0 0 auto', sm: '0 auto' },
              maxWidth: { xs: 'none', sm: 'none' },
            }}
          />

          {/* Save as PDF Button */}
          <Chip
            label={pdfLoading ? "Generating PDF..." : "Save as PDF"}
            clickable
            variant="filled"
            size="small"
            color="default"
            icon={pdfLoading ? <CircularProgress size={16} /> : <PictureAsPdf sx={{ fontSize: 20, mr: 0.5 }} />}
            onClick={handleSaveAsPDF}
            disabled={allButtonsDisabled || pdfLoading}
            sx={{
              fontSize: 13,
              textTransform: "capitalize",
              borderWidth: 1,
              flex: { xs: '0 0 auto', sm: '0 auto' },
              maxWidth: { xs: 'none', sm: 'none' },
            }}
          />
          
          {/* Share Button */}
          <Box sx={{ display: 'flex', alignItems: 'center', flex: { xs: '0 0 auto', sm: '0 auto' } }}>
                      <ShareButtons 
            title={`Check out this ${carInfo?.BrandName || 'car'} ${carInfo?.ModelName || ''} on AiCarAdvisor!`}
            description="AI-powered car comparison and recommendations"
            image="https://uat.aicaradvisor.com/assets/AICarAdvisor.png"
            
        
          />
          </Box>
        </Stack>
      )}
      {dialog.type === "gallery" && (
        <CarGallery
          open={dialog.open}
          onClose={() => setDialog({ open: false, type: null })}
          carId={carInfo?.CarID}
        />
      )}
      {dialog.type === "score" && (
        <ScoreDialog
          open={dialog.open}
          onClose={() => setDialog({ open: false, type: null })}
          carId={carInfo?.CarID}
        />
      )}
      {dialog.type === "emi" && (
        <EMIDialog
          open={dialog.open}
          onClose={() => setDialog({ open: false, type: null })}
          carPrice={carInfo?.Price}
        />
      )}
      {dialog.type === "sentiment" && (
        <SentimentDialog
          open={dialog.open}
          onClose={() => setDialog({ open: false, type: null })}
          carId={carInfo?.CarID}
        />
      )}
      {/* Book Test Drive Modal */}
      {selectedCarForTestDrive && cookies.user && (
        <BookTestDrive
          open={testDriveModalOpen}
          onClose={handleCloseTestDriveModal}
          carDetails={selectedCarForTestDrive}
        />
      )}
      <LoginDialog open={open} onClose={hide} showSignUp={showSignUP} />
      <SignupDialog
        open={showSignUpState}
        onClose={hideSignUP}
        onSuccess={() => {}}
      />
      {showMobileDialog && (
        <MobileNumberDialog
          open={showMobileDialog}
          onClose={() => setShowMobileDialog(false)}
          onSuccess={handleMobileSuccess}
          userData={mobileDialogUserData}
          source="test-drive"
          token={cookies.token}
        />
      )}
      {selectedCarForCompare && (
        <CompareCarsDialog
          open={compareDialogOpen}
          onClose={handleCloseCompareDialog}
          variantId={selectedCarForCompare.VariantID}
          carName={selectedCarForCompare.VariantName}
          primaryCar={selectedCarForCompare}
        />
      )}
      {/* Inline Compare UI */}
    </>
  );
};

export default TeslaCard;