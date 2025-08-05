  // Function to handle favorite click and send VariantID
 
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import React, { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ElectricCarIcon from "@mui/icons-material/ElectricCar";

import { useChats } from "@/Context/ChatContext"; // This brings in the Message type from ChatContext
import { useCookies } from "react-cookie";
import Slider, { Settings } from "react-slick";
import CarGallery from "@/components/common/Dialogs/CarGallery/CarGallery";
import ScoreDialog from "@/components/common/Dialogs/ScoreDialog/ScoreDialog";
import EMIDialog from "@/components/common/Dialogs/EMIDialog/EMIDialog";
import SentimentDialog from "@/components/common/Dialogs/SentimentDialog/SentimentDialog";
// Ensure the casing here matches the actual filename on disk (e.g., BookTestDrive.tsx)
import BookTestDrive from "@/components/common/Dialogs/TestDrivemodel/Booktestdrive"; // Corrected import path for casing
import Image from "next/image";
import { Avatar, IconButton, useTheme } from "@mui/material";
import CollectionsIcon from '@mui/icons-material/Collections';
import LoginDialog from '@/components/common/Dialogs/LoginDialog';
import { useLoginDialog } from '@/Context/LoginDialogContextType';
import { axiosInstance1 } from '@/utils/axiosInstance';
import { useSnackbar } from '@/Context/SnackbarContext';
import { formatInternational } from '@/utils/services';
import { Sign } from 'crypto';
import SignupDialog from '@/components/Auth/SignupDialog';
import { useColorMode } from '@/Context/ColorModeContext';

type Props = {
  onClick?: () => void;
  selectedItem: any; // Consider making this more specific if possible
  handleNeedAdviceSupport: () => void;
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


const TeslaCard: React.FC<Props> = ({
  onClick,
  selectedItem,
  handleNeedAdviceSupport,
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

const showSignUP = () => {

  setshowSignUpState(true);
  hide();
}

const hideSignUP = () => {
  setshowSignUpState(false);
}
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

  const settings: Settings = {
  
    infinite: false,
    speed: 500,
    slidesToShow: modelCars.length > 1 ? 2 : 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    dots: false,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: false,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 0,
          dots: false,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: false,
        },
      },
    ],
  };

  const backTOIntial = () => {
    // Ensure that userMessage's 'sender' type is compatible with ChatContext's Message interface
    // The previous fix for Message interface should resolve this.
    setMessages((prev) => [...prev, userMessage]);
  };

  
  console.log("cars", cars);
const {mode}=useColorMode()
  return (
    <>
      {modelCars.length > 0 && (
        <Slider {...settings}>
          {modelCars.map((car: any, index: number) => ( // Consider more specific type for 'car'
            (<Card
              key={index}
              sx={{
                
                borderRadius: 2,
                position: "relative",
                display: "flex",
                
              }}
            >
              <CardMedia
                component="img"
                height="150"
                width="150"
                

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
                  label={`${car.ModelName} ${car.BodyName ? `-${car.BodyName}`: ""}`}
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
                  top: 110,
                  left: 16,
                  backgroundColor: "white",
                  py: 0.5,
                  borderRadius: 2,
                }}
              >
                <Typography fontWeight="bold"
                 color="primary"
                  fontSize={18} px={2}  sx={{
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
                  sx={{ mb: 0, fontSize: "15px", display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}
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
                        <Image
                          src={item.icon}
                          alt={item.label}
                          width={20} // Reduced icon size
                          height={20}
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{ lineHeight: 1.2, fontWeight: "bold", fontSize: "12px" }} // Reduced font size
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

              </CardContent>
            </Card>)
          ))}
        </Slider>
      )}
      <Stack
        direction="row"
        gap={2}
        mt={1}
        flexWrap="nowrap"
        justifyContent="center"
        sx={{pb:2}}
      >
        <Button
          variant="outlined"
          onClick={onClick}
          sx={{ textTransform: "capitalize", fontSize: 13  }}
        >
          I know exactly what I want
        </Button>
        <Button
          variant="outlined"
          onClick={handleNeedAdviceSupport}
          sx={{ textTransform: "capitalize", fontSize: 13 }}
        >
          I need advisor support
        </Button>

        {cookies.selectedOption == "I want to do more research on cars" && (
          <Button
            variant="outlined"
            onClick={backTOIntial}
            sx={{ textTransform: "capitalize", fontSize: 13 }}
          >
            Back to car research
          </Button>
        )}
      </Stack>
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