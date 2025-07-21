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
import { useTheme } from "@emotion/react";
import { useChats } from "@/Context/ChatContext";
import { useCookies } from "react-cookie";
import Slider, { Settings } from "react-slick";
import CarGallery from "@/components/common/Dialogs/CarGallery/CarGallery";
import ScoreDialog from "@/components/common/Dialogs/ScoreDialog/ScoreDialog";
import EMIDialog from "@/components/common/Dialogs/EMIDialog/EMIDialog";
import SentimentDialog from "@/components/common/Dialogs/SentimentDialog/SentimentDialog";
import tank from "../../../../../public/assets/icons/petrol-tank.png";
import seat from "../../../../../public/assets/icons/car-seat.jpg";
import trans from "../../../../../public/assets/icons/automation.png";
import speed from "../../../../../public/assets/icons/mileage.png";
import Image from "next/image";
import carimg from "../../../../../public/assets/card-img.png";
import { Avatar, IconButton } from "@mui/material";
import CollectionsIcon from '@mui/icons-material/Collections';

type Props = {
  onClick?: () => void;
  selectedItem: any;
  handleNeedAdviceSupport: () => void;
};

interface typeProps {
  open: boolean;
  type: "score" | "emi" | "sentiment" | "gallery" | null;
}

const TeslaCard: React.FC<Props> = ({
  onClick,
  selectedItem,
  handleNeedAdviceSupport,
}) => {
  const rawValues = Object.values(selectedItem);
  const modelCars: any[] = Array.isArray(rawValues[0]) ? rawValues[0] : [];
  const theme = useTheme();
  const [carInfo, setCarInfo] = useState<any>(null);
  const [dialog, setDialog] = useState<typeProps>({ open: false, type: null });
  const { messages, setMessages } = useChats();
  const [cookies] = useCookies(["selectedOption"]);

  const userMessage: Message = {
    id: String(Date.now() + 1),
    message: cookies.selectedOption,
    render: "text",
    sender: "user",
  };

  const openDialog = (
    type: "score" | "emi" | "sentiment" | "gallery" | null,
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
          slidesToShow:modelCars.length > 1 ? 2 : 1,
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
    setMessages((prev) => [...prev, userMessage]);
  };

  console.log("carInfo", modelCars);
  return (
    <>
      {modelCars.length > 0 && (
        <Slider {...settings}>
          {modelCars.map((car: any, index: number) => (
            <Card
              sx={{
                maxWidth: 380,
                borderRadius: 2,
                boxShadow: 1,
                position: "relative",
                display: "flex",
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={car.CarImageDetails?.[0]?.CarImageURL || carimg.src}
                alt="Car card"
                sx={{
                  cursor: "pointer",
                
                }}
                onClick={() => openDialog("gallery", car)}
              />


              {/* Gallery Icon */}
              <Box
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1,
                }}
              >
                <IconButton
                  color="primary"
                  onClick={() => openDialog("gallery", car)}
                  
                  sx={{ backgroundColor: "#ffffff", borderRadius: "50%"}}
                  
                >
                  <CollectionsIcon />
                </IconButton>
              </Box>
              <Box sx={{ position: "absolute", top: 16, left: 16 }} >
 <Chip
                  label={`${car.ModelName} - ${car.BodyName ?? ""}`}
                  color="primary"
                


              sx={{ backgroundColor: "#f5f5f5", color: "black", paddingX:"5px" }}
                  icon={
                    <Avatar
                      src={car.logo}
                      alt={car.BrandName}
                      sx={{ width: 20, height: 20 }}
                    />
                  }

                />
              </Box>
              <Box
                sx={{
                  position: "absolute",
                  top: 170,
                  left: 16,
                  backgroundColor: "white",
                  py: 0.5,
                  borderRadius: 2,
                }}
              >
                <Typography fontWeight="bold" color="primary" fontSize={18} px={2}  sx={{
                  backgroundColor: "#f5f5f5",
                  borderRadius:"5px"
                }}>
                  ₹{(car.Price / 100000).toFixed(1)}L
                </Typography>
              </Box>

              {/* Content */}
              <CardContent>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  gutterBottom
                  sx={{ mb: 0, fontSize: "15px" }}
                >
                  {car.VariantName}
                </Typography>
                <Typography
                  color="text.secondary"
                  gutterBottom
                  sx={{ fontSize: 12 }}
                >
                  {car.BrandName}
                </Typography>
                {/* Static color palette */}
                <Box sx={{ display: "flex", gap: 1, mt: 1, mb: 1 }}>
                  {car?.Colors?.map((color:VariantColor, idx:number) => (
                    <Box
                      key={idx}
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        backgroundColor: color.ColorHex,
                        border: "1px solid #ccc",
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 2,
                    my: 1,
                  }}
                >
                  {[
                    { label: `${car.FuelType}`, icon: tank },
                    { label: `${car.Trans_fullform}`, icon: trans },
                    { label: ` ${car.Seats} Seater`, icon: seat },
                    { label: ` ${car.Mileage} kmpl`, icon: speed },
                  ].map((item) => (
                    <Box
                      key={item.label}
                      sx={{
                        width: {
                          xs: "100%",
                        },
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        backgroundColor: "grey.100",
                        border: "1px solid",
                        borderColor: "grey.300",
                        textAlign: "center",
                      }}
                    >
                      <Box display="flex" justifyContent="center" mt={0.5}>
                        <Image
                          src={item.icon}
                          alt={item.label}
                          width={24}
                          height={24}
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{ lineHeight: 1.2, fontWeight: "bold" }}
                      >
                        {item.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Stack
                  direction="row"
                  gap="5px"
                  justifyContent="center"
                  flexWrap="wrap"
                  mb={1}
                  sx={{ mt: { xs: 2 } }}
                >
                  {[
                    { label: "AI Car Advisor Score:", type: "score" },
                    { label: "EMI", type: "emi" },
                    { label: "User Sentiments:", type: "sentiment" },
                  ].map(({ label, type }, index) => (
                    <Button
                      key={type}
                      variant="contained"
                      size="small"
                      sx={{
                        textTransform: "capitalize",
                        fontSize: "12px",
                        minWidth: { xs: "100%", md: modelCars.length < 2 && index===2 ? "68%" : "10%", },
                      }}
                      onClick={() => openDialog(type as any, car)}
                    >
                      <span>
                        {label} {index === 0 && car?.AIScore}{" "}
                        {index === 2 && car?.AISummary}{" "}
                      </span>
                    </Button>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Slider>
      )}

      <Stack
        direction="row"
        gap={2}
        mt={3}
        flexWrap="wrap"
        justifyContent={{ xs: "center", sm: "flex-start" }}
      >
        <Button
          variant="outlined"
          onClick={onClick}
          sx={{ textTransform: "capitalize", fontSize: 13 }}
        >
          I know exactly I want
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
    </>
  );
};

export default TeslaCard;
