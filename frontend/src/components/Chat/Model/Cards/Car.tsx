  // Function to handle favorite click and send VariantID
 
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ElectricCarIcon from "@mui/icons-material/ElectricCar";
import { Stack, Chip, Menu, MenuItem } from "@mui/material";
import FaceIcon from '@mui/icons-material/Face';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

import { useChats } from "@/Context/ChatContext"; // This brings in the Message type from ChatContext
import { useCookies } from "react-cookie";
import Slider, { Settings } from "react-slick";
import CarGallery from "@/components/common/Dialogs/CarGallery/CarGallery";
import ScoreDialog from "@/components/common/Dialogs/ScoreDialog/ScoreDialog";
import EMIDialog from "@/components/common/Dialogs/EMIDialog/EMIDialog";
import SentimentDialog from "@/components/common/Dialogs/SentimentDialog/SentimentDialog";
// Ensure the casing here matches the actual filename on disk (e.g., BookTestDrive.tsx)
import BookTestDrive from "@/components/common/Dialogs/TestDrivemodel/Booktestdrive"; // Corrected import path for casing
import { Avatar, IconButton, useTheme } from "@mui/material";
import CollectionsIcon from '@mui/icons-material/Collections';
import LoginDialog from '@/components/common/Dialogs/LoginDialog';
import { useLoginDialog } from '@/Context/LoginDialogContextType';
import { axiosInstance1 } from '@/utils/axiosInstance';
import { useSnackbar } from '@/Context/SnackbarContext';
import { formatInternational, generateCarChatMessage } from '@/utils/services';
import { Sign } from 'crypto';
import SignupDialog from '@/components/Auth/SignupDialog';
import { useColorMode } from '@/Context/ColorModeContext';
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import CircularProgress from '@mui/material/CircularProgress';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

type Props = {
  onClick?: () => void;
  selectedItem: any; // Consider making this more specific if possible
  handleNeedAdviceSupport: () => void;
  variant?: 'default' | 'compact';
};

interface typeProps {
  open: boolean;
  type: string | null;
}

// REMOVE or comment out this local Message interface definition.
// The Message interface should be imported from ChatContext to ensure consistency.
/*
interface Message {
  id: string;
  message: string;
  render: string; // This was 'string', causing the conflict
  sender: "user" | "bot";
}
*/

interface VariantColor {
  ColorHex: string;
  // Add other properties of VariantColor if they exist
}

// Define a more specific interface for carDetails passed to BookTestDrive
// This should match the CarDetailsForBooking interface in BookTestDrive.tsx
interface CarDetailsForBooking {
  BrandID: number;
  ModelID: number;
  VariantID: number;
  BrandName: string;
  ModelName: string;
  VariantName?: string; // Optional as per BookTestDrive's interface
}

// Add new prop for triggering overall recommendations
interface CarCardProps extends Props {
  onTriggerOverallRecommendations?: () => Promise<void | boolean>;
}

const TeslaCard: React.FC<CarCardProps> = ({
  onClick,
  selectedItem,
  handleNeedAdviceSupport,
  variant = 'default',
  onTriggerOverallRecommendations, // Destructure new prop
}) => {
  const rawValues = Object.values(selectedItem);

    const { open, hide, show } = useLoginDialog();

  const modelCars: any[] = Array.isArray(rawValues[0]) ? rawValues[0] : [];
 
   const theme=useTheme()
  const [carInfo, setCarInfo] = useState<any>(null);
  const [dialog, setDialog] = useState<typeProps>({ open: false, type: null });
  // Heart (favorite) state for each car card


  const  favouteStates = modelCars.reduce((acc, car, index) => {
    acc[index] = car?.is_bookmarked; // Initialize all as not favorite
    return acc;
  }, {});
  const [favoriteStates, setFavoriteStates] = useState<{ [key: number]: boolean }>(favouteStates);
  // Import Message from ChatContext if it's exported there, or ensure its definition matches.
  // Assuming useChats is defined like: export const useChats = () => { ... return { messages, setMessages }; };
  // And Message interface is also exported from ChatContext.
  const { messages, setMessages, cars, setCars } = useChats(); 
  const [cookies] = useCookies(["selectedOption", "user"]);

  // State for the Book Test Drive dialog
  const [testDriveModalOpen, setTestDriveModalOpen] = useState(false);
  // Use the specific interface for selectedCarForTestDrive
  const [selectedCarForTestDrive, setSelectedCarForTestDrive] = useState<CarDetailsForBooking | null>(null);
const {showSnackbar}=useSnackbar()

const [showSignUpState, setshowSignUpState] = useState<boolean>(false);
const [loadingRecommendations, setLoadingRecommendations] = useState<boolean>(false);
const [loadingOverallRecommendations, setLoadingOverallRecommendations] = useState<boolean>(false); // New state

const showSignUP = () => {

  setshowSignUpState(true);
  hide();
}
const [chipsDisabled, setChipsDisabled] = useState(false);

const hideSignUP = () => {
  setshowSignUpState(false);
}
// Sorting menu (funnel icon) state
const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
const [currentSort, setCurrentSort] = useState<string>('none');
const handleSelectSort = (value: 'none' | 'price' | 'mileage') => {
  setCurrentSort(value);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('car-sort', { detail: value }));
  }
  setAnchorEl(null);
};
   const handleFavoriteClick = async(variant:any, variantId: number, index:number) => {
    // Example: send to API or log
    // You can replace this with an API call or any other logic

    if(!cookies.user){
      show();


       // Indicate failure to set favorite
    }else{

      const paload ={
      variant_id: variantId,
      

    }
    try {
      const response = await axiosInstance1.post('/api/cargpt/bookmark/toggle/', paload);

      setFavoriteStates((prev) => ({ ...prev, [index]: !prev[index] }));

      setCars((prevCars) => {
        return prevCars.map((carGroup) => {
          const newCarGroup = { ...carGroup };
          for (const modelName in newCarGroup) {
            if (Array.isArray(newCarGroup[modelName])) {
              newCarGroup[modelName] = newCarGroup[modelName].map((v: any) =>
                v.VariantID === variantId ? { ...v, is_bookmarked: !favoriteStates[index] } : v
              );
            }
          }
          return newCarGroup;
        });
      });

      let msg = "Car added to your bookmarks"
      if(!favoriteStates[index]===false){
        msg = "Car removed from your bookmarks"

      }
      showSnackbar(msg, {
        vertical: 'top',
        horizontal: 'center',
        autoHideDuration: 7000,
        color: 'success',
      })
      


      return true; // Indicate success
      
    } catch (error:any) {
      console.error(error)
      let err= "Variant is discountinued"
      if(error?.status===500){
        err="Something went wrong! please try again after sometimes."

      }
      showSnackbar(err)
      return false;
      
    }

    }

    
  };

  const handleRecommendByPrice = async (price: number, modelId: number, modelName: string) => {
    setLoadingRecommendations(true);
    try {
      const payload = {
        price: price,
        model_id: modelId,
      };
      const response = await axiosInstance1.post('/api/cargpt/recommend-by-price/', payload);

      if (response?.data && response.data.length > 0) {
        const recommendedCars = response.data;
        const count = recommendedCars.length;
        const carPlural = count === 1 ? "car" : "cars";

        const userMessage: Message = {
          id: String(Date.now()),
          message: `Show recommendations for ${modelName} at price ${formatInternational(price)}`, // User-friendly message
          render: "text",
          sender: "user",
        };

        const botMessage: Message = {
          id: String(Date.now() + 1),
          message: { [`${modelName}_Recommendations`]: recommendedCars }, // Group by model name
          render: "carOptions", // Use 'carOptions' to display in carousel
          sender: "bot",
        };

        setMessages((prev) => [...prev, userMessage, botMessage]);
        showSnackbar(`Found ${count} recommended ${carPlural} for ${modelName}.`, {
          vertical: 'top',
          horizontal: 'center',
          autoHideDuration: 7000,
          color: 'success',
        });
      } else {
        showSnackbar("No recommendations found for this car.", {
          horizontal: "center",
          vertical: "bottom",
        });
      }
    } catch (error: any) {
      console.error("Error fetching recommendations:", error);
      let errorMessage = "Failed to fetch recommendations. Please try again later.";
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


  const userMessage = { // No need to explicitly type userMessage here if ChatContext's Message is used
    id: String(Date.now() + 1),
    message: cookies.selectedOption,
    render: "text" as const, // Cast to 'text' literal type to match ChatContext's union type
    sender: "user" as const, // Cast to 'user' literal type to match ChatContext's union type
  };

  const openDialog = (
    type: string,
    data: any // Consider making this more specific if possible
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

  const handleOpenTestDriveModal = (car: CarDetailsForBooking) => { // Type 'car' here

    if(!cookies.user){
      show()
      return false;

    }
    setSelectedCarForTestDrive(car);
    setTestDriveModalOpen(true);
  };

  const handleCloseTestDriveModal = () => {
    setTestDriveModalOpen(false);
    setSelectedCarForTestDrive(null);
  };


// Custom Next Arrow Component (supports outside offset)
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

// Custom Prev Arrow Component (supports outside offset)
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


  const isCompact = variant === 'compact';
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
    nextArrow: <CustomNextArrow outside={variant === 'compact'} />,
    prevArrow: <CustomPrevArrow outside={variant === 'compact'} />,

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
      // other breakpoints
    ],
  };
  const backTOIntial = () => {
    // The previous fix for Message interface should resolve this.
    setMessages((prev) => [...prev, userMessage]);
  };

  
  console.log("cars", cars);
const {mode}=useColorMode()

 
const message= selectedItem ? generateCarChatMessage(selectedItem || {}, modelCars.length) :""
console.log(typeof message)
  return (
    <>
                     {selectedItem && (
        <Box sx={{ px: 2, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Typography sx={{ fontWeight: "bold" }}>{message}</Typography>
          {modelCars.length > 1 && (
            <Box>
              <IconButton
                size="small"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                aria-label="Filter"
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 0.5 }}
              >
                <img src="/assets/funnel.svg" alt="Filter" width={18} height={18} style={{ filter: mode === "dark" ? "invert(100%)" : "none" }} />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem selected={currentSort === 'none'} onClick={() => handleSelectSort('none')}>Default</MenuItem>
                <MenuItem selected={currentSort === 'price'} onClick={() => handleSelectSort('price')}>Price</MenuItem>
                <MenuItem selected={currentSort === 'mileage'} onClick={() => handleSelectSort('mileage')}>Mileage</MenuItem>
              </Menu>
            </Box>
          )}
        </Box>
      )}

      {modelCars.length > 0 && (
        <Box sx={{ width: { xs:"100%" , md: modelCars.length < 2? "50%":'100%'}}}
        >
          <Slider {...settings}>

          {modelCars.map((car: any, index: number) => (
            (<Card
              key={index}
              sx={{
                borderRadius: isCompact ? 1 : 2,
                position: "relative",
                display: "flex",
                width: '100%',
                backgroundColor: mode === 'dark' ? theme.palette.background.paper : '#ffffff',
                border: isCompact ? '1px solid transparent' : undefined,
                transition: isCompact ? 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease' : undefined,
                cursor: isCompact ? 'pointer' : 'default',
                '&:hover': isCompact ? {
                  transform: 'translateY(-2px)',
                  boxShadow: mode === 'dark'
                    ? '0 6px 18px rgba(0,0,0,0.6)'
                    : '0 6px 18px rgba(0,0,0,0.12)',
                  // borderColor: mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.light,
                } : undefined,
              }}
              variant="outlined"
            >
              <CardMedia
                component="img"
                height={isCompact ? "130" : "150"}
                width="100%"
                

                image={car.CarImageDetails?.[0]?.CarImageURL || '/assets/card-img.png'}
                alt="Car card"
                sx={{
                  cursor: 'pointer',
                  pointerEvents: `${!car.CarImageDetails?.[0]?.CarImageURL && "none"}`,
                
                }}
                onClick={() => openDialog("gallery", car)}
              />
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
                  sx={{ backgroundColor: "#ffffff", borderRadius: "50%"}}
                >
                  <CollectionsIcon />
                </IconButton>
              </Box>
               <Box sx={{ position: "absolute", top: 3, left: 8 }} >
                <Chip
                  label={`${car.ModelName} ${car.BodyName ? `- ${car.BodyName}`: ""}`}
                  color="primary"
                  sx={{ backgroundColor:  "#f5f5f5", color: "black", paddingX:"2px", fontSize:"10px", paddingY:'1px' }}
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
                <Typography fontWeight="bold"
                 color="primary"
                  fontSize={isCompact ? 16 : 18} px={2}  sx={{
                  backgroundColor: mode==="dark"?  theme.palette.background.paper : "#f5f5f5",
                  borderRadius:"5px"
                }}>
                  ₹{formatInternational(car.Price )}
                </Typography>
              </Box>
              {/* Content */}
              <CardContent style={{"paddingBottom":"15px", "paddingTop":"2px"}}>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  gutterBottom
                  sx={{ mb: 0, fontSize: isCompact ? "14px" : "15px", display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}
                >
                  {car.VariantName}
                  <IconButton
                    size="small"
                    sx={{ ml: 1, p: 0.5 }}
                    onClick={() => {

                      
                       handleFavoriteClick(car, car.VariantID, index);
                     
                    }}
                  >
                    {favoriteStates[index] ? (
                      <FavoriteIcon sx={{ color: "#e53935", fontSize: 18 }} />
                    ) : (
                      <FavoriteBorderIcon sx={{ color: "#e53935", fontSize: 18 }} />
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
                <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                  {car?.Colors?.map((color:VariantColor, idx:number) => {
                    return (
                      <Box
                        key={idx}
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          border: "1px solid #ccc",
                          cursor: "pointer",
                          background: color.ColorHex.includes(',')
                            ? `linear-gradient(to right, ${color.ColorHex.split(',')[0]} 50%, ${color.ColorHex.split(',')[1]} 50%)`
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
                    { label: `${car.FuelType}`, icon: "/assets/icons/petrol-tank.png" },
                    { label: `${car.Trans_fullform}`, icon: '/assets/icons/automation.png' },
                    { label: ` ${car.Seats} Seater`, icon: "/assets/icons/car-seat.jpg" },
                    { label: ` ${car.Mileage} kmpl`, icon: "/assets/icons/mileage.png" },
                  ].map((item) => (
                    <Box
                      key={item.label}
                      sx={{
                        width: "100%", // Takes up 100% of its grid space
                        px: 1, // Reduced horizontal padding
                        py: 0.75, // Reduced vertical padding
                        borderRadius: 1, // Slightly smaller border radius
                        backgroundColor: mode==="dark"  ? theme.palette.background.paper: "grey.100",
                        border: "1px solid",
                        borderColor:  mode==="dark"  ? theme.palette.background.paper: "grey.300",
                        textAlign: "center",
                        margin: "auto", // Center the items within their grid space
                      }}
                    >
                      <Box display="flex" justifyContent="center" mt={0.5}>
                        <img loading='lazy'
                          src={item.icon}
                          alt={item.label}
                          width={20} // Reduced icon size
                          height={20}
                          style={{ filter: mode === "dark" ? "invert(100%)" : "none" }}
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{ lineHeight: 1.2, fontWeight: "bold", fontSize: isCompact ? "11px" : "12px" }} // Reduced font size
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
  {/* AI Car Advisor Score Button */}
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
  >
    AI Car Advisor Score: {car?.AIScore || "--"}
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
    >
      Book Test Drive
    </Button>
  </Stack>
</Box>

  {/* New Recommend Button */}
  

              </CardContent>
            </Card>)
          ))}
          </Slider>
        </Box>

      )}
      {!isCompact && (
      <Stack
  direction="row"
  gap={1.5}
  mt={1}
  flexWrap="wrap"  // ✅ allow wrapping
  justifyContent={{ xs: "center", sm: "flex-start" }}  // center on mobile, start on larger
  sx={{
    pb: 2,
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
    disabled={chipsDisabled}
    sx={{
      fontSize: 13,
      textTransform: "capitalize",
      borderWidth: 1,
      flex: { xs: '1 1 calc(50% - 12px)', sm: '0 auto' }, // 2 chips per row on mobile
      maxWidth: { xs: 'calc(50% - 12px)', sm: 'none' },
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
    disabled={chipsDisabled}
    sx={{
      fontSize: 13,
      textTransform: "capitalize",
      borderWidth: 1,
      flex: { xs: '1 1 calc(50% - 12px)', sm: '0 auto' }, // 2 chips per row on mobile
      maxWidth: { xs: 'calc(50% - 12px)', sm: 'none' },
    }}
  />

  {cookies.selectedOption === "I want to do more research on cars" && (
    <Chip
      label="Back to car research"
      variant="outlined"
      size="small"
      icon={<DirectionsCarIcon />}
      onClick={backTOIntial}
      sx={{
        fontSize: 13,
        textTransform: "capitalize",
        color: "black",
        borderColor: "black",
        borderWidth: 1,
        borderStyle: "solid",
        "& .MuiChip-icon": { color: "black" },
        flex: { xs: '1 1 calc(50% - 12px)', sm: '0 auto' }, // 2 chips per row on mobile
        maxWidth: { xs: 'calc(50% - 12px)', sm: 'none' },
      }}
    />
  )}

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
      {selectedCarForTestDrive &&  cookies.user &&(
        <BookTestDrive
          open={testDriveModalOpen}
          onClose={handleCloseTestDriveModal}
          carDetails={selectedCarForTestDrive}
        />
      )}
      <LoginDialog open={open} onClose={hide} showSignUp={showSignUP} />
      <SignupDialog open={showSignUpState} onClose={hideSignUP} onSuccess={()=>{}}/>
    </>
  );
};

export default TeslaCard;