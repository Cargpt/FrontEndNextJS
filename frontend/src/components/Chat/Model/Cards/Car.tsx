import React, { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ElectricCarIcon from "@mui/icons-material/ElectricCar";
import { useTheme } from "@emotion/react";
import { useMediaQuery } from "@mui/material";
import { useChats } from "@/Context/ChatContext";
import { useCookies } from "react-cookie";
import Slider, { Settings } from "react-slick";
import CarGallery from "@/components/common/Dialogs/CarGallery/CarGallery";
import ScoreDialog from "@/components/common/Dialogs/ScoreDialog/ScoreDialog";
import EMIDialog from "@/components/common/Dialogs/EMIDialog/EMIDialog";
import SentimentDialog from "@/components/common/Dialogs/SentimentDialog/SentimentDialog";
import petrol from "../../../../../public/assets/vector26786425-bw2d.svg";
import tank from "../../../../../public/assets/subtract6425-nvra (1).svg";
import seat from "../../../../../public/assets/babycarseat6425-n4nh.svg";
import trans from "../../../../../public/assets/vector26796425-xttl.svg";
import speed from "../../../../../public/assets/hugeiconinterfacesolidspeedtest6425-amlw.svg";
import Image from "next/image";
import carimg from "../../../../../public/assets/card-img.png";

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
  // const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
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
    slidesToShow: modelCars.length < 3 ? modelCars.length : 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1000,
    dots: false,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: modelCars.length < 3 ? modelCars.length : 3,
          slidesToScroll: 1,
          dots: false,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: modelCars.length < 2 ? modelCars.length : 2,
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

  console.log("carInfo", carInfo);
  return (
    <>
      {modelCars.length > 0 && (
        <Slider {...settings}>
          {modelCars.map((car: any, index: number) => (
            <Card
              sx={{
                maxWidth: 380,
                borderRadius: 4,
                boxShadow: 4,
                position: "relative",
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={car.CarImageDetails?.[0]?.CarImageURL || carimg.src}
                alt="Tesla Model S"
                sx={{
                  cursor: "pointer",
                }}
                onClick={() => openDialog("gallery", car)}
              />
              <Box sx={{ position: "absolute", top: 16, left: 16 }}>
                <Chip
                  label="Electric Sedan"
                  color="primary"
                  icon={<ElectricCarIcon />}
                />
              </Box>
              <Box
                sx={{
                  position: "absolute",
                  top: 170,
                  left: 16,
                  backgroundColor: "white",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" fontWeight="bold" color="primary">
                  ₹{(car.Price / 100000).toFixed(1)}L
                </Typography>
              </Box>

              {/* Content */}
              <CardContent>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {car.VariantName}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {car.ModelName}
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 2,
                    my: 1,
                  }}
                >
                  {[
                    { label: `${car.TransmissionType}`, icon: trans },
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
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{ lineHeight: 1.2, fontWeight: "bold" }}
                      >
                        {item.label}
                      </Typography>
                      <Box display="flex" justifyContent="center" mt={0.5}>
                        <Image
                          src={item.icon}
                          alt={item.label}
                          width={24}
                          height={24}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>

                {/* Actions */}
                <Stack direction="row" spacing={2} mt={2}>
                  <Box flex={1}>
                    <Button variant="outlined" fullWidth>
                      Less Details
                    </Button>
                  </Box>
                  <Box flex={1}>
                    <Button variant="contained" fullWidth>
                      Contact Dealer
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Slider>
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
    </>
  );
};

export default TeslaCard;
