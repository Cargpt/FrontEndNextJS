import React, { useState } from "react";
import Slider, { Settings } from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import carimg from "../../../public/assets/card-img.png";
import EMIDialog from "../common/Dialogs/EMIDialog/EMIDialog";
import SentimentDialog from "../common/Dialogs/SentimentDialog/SentimentDialog";
import ScoreDialog from "../common/Dialogs/ScoreDialog/ScoreDialog";
import petrol from "../../../public/assets/vector26786425-bw2d.svg";
import price from "../../../public/assets/subtract6425-nvra.svg";
import seat from "../../../public/assets/babycarseat6425-n4nh.svg";
import trans from "../../../public/assets/vector26796425-xttl.svg";
import speed from "../../../public/assets/hugeiconinterfacesolidspeedtest6425-amlw.svg";

type Props = {
  onClick?: () => void;
  selectedItem: any;
  handleNeedAdviceSupport: () => void;
};

interface typeProps {
  open: boolean;
  type: "score" | "emi" | "sentiment" | null;
}

const ModelCarousel: React.FC<Props> = ({
  onClick,
  selectedItem,
  handleNeedAdviceSupport,
}) => {
  const rawValues = Object.values(selectedItem);
  const modelCars: any[] = Array.isArray(rawValues[0]) ? rawValues[0] : [];
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [carInfo, setCarInfo] = useState<any>(null);
  const [dialog, setDialog] = useState<typeProps>({ open: false, type: null });

  const openDialog = (
    type: "score" | "emi" | "sentiment" | null,
    data: any
  ) => {
    setDialog({ open: true, type });
    if (type === "score" || type === "sentiment") {
      setCarInfo(data);
    }
  };

  const settings: Settings = {
    infinite: false,
    speed: 500,
    slidesToShow: modelCars.length < 3 ? modelCars.length : 3,
    slidesToScroll: modelCars.length < 3 ? modelCars.length : 3,
    autoplay: true,
    autoplaySpeed: 1000,
    centerMode: true,
    centerPadding: "0px",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: modelCars.length < 3 ? modelCars.length : 3,
          slidesToScroll: modelCars.length < 3 ? modelCars.length : 3,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: modelCars.length < 2 ? modelCars.length : 2,
          slidesToScroll: modelCars.length < 2 ? modelCars.length : 2,
          initialSlide: 0,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <>
      <Box
        className="slider-container"
        sx={{
          px: isSmallScreen ? 0 : 4,
          py: 3,
          width: "100%",
          background: "#eeeeef",
        }}
      >
        <Slider {...settings}>
          {modelCars.map((car: any) => (
            <Box key={car.CarID} sx={{ px: 1, width: "100%" }}>
              <Card
                sx={{
                  width: "100%",
                  height: "100%",
                  mx: "auto",
                  boxShadow: "0px 3px 6px rgba(0,0,0,0.1)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent
                  sx={{ display: "flex", flexDirection: "column", gap: "13px" }}
                >
                  <Stack alignItems="center" mb={2}>
                    <Image
                      src={car.CarImageDetails?.[0]?.CarImageURL || carimg}
                      alt="car-img"
                      height={200}
                      width={330}
                      style={{ objectFit: "contain", width: "100%" }}
                    />
                  </Stack>

                  <Stack direction="row" justifyContent="space-around" mb={2}>
                    <Typography variant="h6" fontSize={15}>
                      {car.BrandName} {car.ModelName}
                    </Typography>
                    <Typography
                      variant="h6"
                      fontSize={15}
                      color="text.secondary"
                    >
                      ₹ {(car.Price / 100000).toFixed(1)} L
                    </Typography>
                  </Stack>

                  <Stack
                    direction="row"
                    gap="5px"
                    justifyContent="center"
                    flexWrap="wrap"
                    mb={1}
                  >
                    {[
                      { label: "AI Car Advisor Score:", type: "score" },
                      { label: "EMI", type: "emi" },
                      { label: "User Sentiments:", type: "sentiment" },
                    ].map(({ label, type }) => (
                      <Button
                        key={type}
                        variant="contained"
                        size="small"
                        sx={{
                          textTransform: "capitalize",
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "#fff",
                          padding: "5px 5px",
                          borderRadius: "1.1rem 6px",
                          boxShadow: "rgba(0, 0, 0, 0.1) 2px 2px 10px",
                          background:
                            "linear-gradient(150deg, rgb(24, 118, 210), rgb(4, 190, 198))",
                          width: "calc(50% - 5px)",
                        }}
                        onClick={() => openDialog(type as any, car)}
                      >
                        <span>{label}</span>
                      </Button>
                    ))}
                  </Stack>
                  <Stack
                    direction="row"
                    gap="5px"
                    justifyContent="center"
                    flexWrap="wrap"
                  >
                    {[
                      { label: `${car.FuelType}`, icon: petrol },
                      { label: `${car.TransmissionType}`, icon: trans },
                      { label: ` ${car.Seats} Seater`, icon: seat },
                      {
                        label: `₹ ${(car.Price / 100000).toFixed(1)} L`,
                        icon: price,
                      },
                      { label: ` ${car.Mileage} kmpl`, icon: speed },
                    ].map(({ label, icon }) => (
                      <Button
                        variant="outlined"
                        size="small"
                        key={label}
                        sx={{
                          textTransform: "capitalize",
                          color: "grey",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          fontSize: "10px",
                          border: "1px solid grey",
                        }}
                      >
                        <Image
                          src={icon}
                          alt={label}
                          width={14}
                          height={14}
                          style={{ objectFit: "contain" }}
                        />
                        <span>{label}</span>
                      </Button>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Slider>

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
        </Stack>
      </Box>

      {/* Dialogs */}
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

export default ModelCarousel;
