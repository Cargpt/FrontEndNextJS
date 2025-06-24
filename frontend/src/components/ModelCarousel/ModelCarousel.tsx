import React from "react";
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
} from "@mui/material";
import Image from "next/image";
import carimg from "../../../public/assets/card-img.png";
import { useChats } from "@/Context/ChatContext";
import EMIDialog from "../common/Dialogs/EMIDialog/EMIDialog";
import SentimentDialog from "../common/Dialogs/SentimentDialog/SentimentDialog";
import ScoreDialog from "../common/Dialogs/ScoreDialog/ScoreDialog";

type Props = {
  onClick?: () => void;
  selectedItem: any;
  handleNeedAdviceSupport: () => void;
};

const ModelCarousel: React.FC<Props> = ({
  onClick,
  selectedItem,
  handleNeedAdviceSupport,
}) => {
  const { cars } = useChats();
  const modelKey = Object.keys(cars[0])[0];
  const modelCars = cars[0][modelKey];
  const [dialog, setDialog] = React.useState<{
    open: boolean;
    type: "score" | "emi" | "sentiment" | null;
  }>({
    open: false,
    type: null,
  });
  const settings: Settings = {
    // dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    initialSlide: 0,
    autoplay: true,
    autoplaySpeed: 1000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
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

  console.log("cars", cars);
  return (
    <>
      <div
        className="slider-container"
        style={{ padding: "30px", width: "100%", background: "#eeeeef" }}
      >
        <Slider {...settings}>
          {modelCars.map((car: any) => (
            <div
              key={car.CarID}
              style={{ padding: "0 8px", boxSizing: "border-box" }}
            >
              <Box width="100%">
                <Card
                  style={{
                    border: "none",
                    borderBottom: "none",
                    boxShadow: "none",
                  }}
                >
                  <CardContent>
                    <Stack display="flex" alignItems="center" gap="10px">
                      <Image
                        // src={car.ImageUrl || carimg}
                        src={car.CarImageDetails?.[0]?.CarImageURL || carimg}
                        alt="car-img"
                        height={200}
                        width={200}
                        style={{ objectFit: "contain" }}
                      />
                    </Stack>

                    <Stack
                      display="flex"
                      flexDirection="row"
                      alignItems="center"
                      gap="15px"
                      justifyContent="space-around"
                    >
                      <Typography variant="h6" mt={2} fontSize="15px">
                        {car.BrandName} {car.ModelName}
                      </Typography>
                      <Typography
                        variant="h6"
                        mt={2}
                        color="text.secondary"
                        fontSize="15px"
                      >
                        ₹ {(car.Price / 100000).toFixed(1)} L
                      </Typography>
                    </Stack>
                    <div
                      style={{
                        display: "flex",
                        gap: "20px",
                        alignItems: "center",
                        flexWrap: "wrap",
                        justifyContent: "center",
                      }}
                    >
                      <Button
                        variant="contained"
                        style={{
                          textTransform: "capitalize",
                          fontSize: "10px",
                          padding: "6px",
                        }}
                        onClick={() => setDialog({ open: true, type: "score" })}
                      >
                        AI Car Advisor Score:
                      </Button>
                      <Button
                        variant="contained"
                        style={{
                          textTransform: "capitalize",
                          fontSize: "10px",
                        }}
                        onClick={() => setDialog({ open: true, type: "emi" })}
                      >
                        EMI
                      </Button>
                      <Button
                        variant="contained"
                        style={{
                          textTransform: "capitalize",
                          fontSize: "10px",
                        }}
                        onClick={() =>
                          setDialog({ open: true, type: "sentiment" })
                        }
                      >
                        User Sentiments:
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Box>
            </div>
          ))}
        </Slider>
        <div
          style={{
            display: "flex",
            gap: "20px",
            alignItems: "center",
          }}
        >
          <Button
            variant="contained"
            onClick={onClick}
            style={{
              textTransform: "capitalize",
              fontSize: "13px",
            }}
          >
            I know exactly i want
          </Button>
          <Button
            variant="contained"
            onClick={handleNeedAdviceSupport}
            style={{
              textTransform: "capitalize",
              fontSize: "13px",
            }}
          >
            I need advisor support
          </Button>
        </div>
      </div>
      {dialog.type === "score" && (
        <ScoreDialog
          open={dialog.open}
          onClose={() => setDialog({ open: false, type: null })}
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
        />
      )}
    </>
  );
};

export default ModelCarousel;
