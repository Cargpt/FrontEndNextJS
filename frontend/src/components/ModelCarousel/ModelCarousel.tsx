import React from "react";
import Slider, { Settings } from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Card, CardContent, Typography, Box, Stack, Button } from "@mui/material";
import Image from "next/image";
import carimg from "../../../public/assets/card-img.png";
import { useChats } from "@/Context/ChatContext";

type Props = {
 onClick?: () => void;
 selectedItem: any;
 handleNeedAdviceSupport: () => void;
}

const ModelCarousel: React.FC<Props> = ({onClick, selectedItem, handleNeedAdviceSupport}) => {
  const {cars}=useChats()
  const modelKey = Object.keys(cars[0])[0]; // e.g., "Hyundai_Creta"
const modelCars = cars[0][modelKey]; // array of 9 car objects
  const settings: Settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    initialSlide: 0,
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


  console.log("cars", cars)
  return (
    <div className="slider-container" style={{ padding: "30px", width: "100%" }}>
      <Slider {...settings}>
  {modelCars.map((car: any) => (
    <div key={car.CarID} style={{ padding: "0 8px", boxSizing: "border-box" }}>
      <Box width="100%">
        <Card>
          <CardContent>
            <Stack display="flex" alignItems="center">
              <Image
                src={car.ImageUrl || carimg}
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
                ₹ {car.Price} L
              </Typography>
            </Stack>

          <div style={{display: "flex", justifyContent:"space-between", alignItems:"center"}}>
            <Button variant="contained" onClick={onClick}>I know exactly i want</Button>
           <Button variant="contained" onClick={handleNeedAdviceSupport}>I need advisor support</Button>
           </div>
          </CardContent>
        </Card>
      </Box>
    </div>
  ))}
</Slider>

    </div>
  );
};

export default ModelCarousel;