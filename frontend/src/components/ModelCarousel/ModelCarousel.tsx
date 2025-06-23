import React from "react";
import Slider, { Settings } from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Card, CardContent, Typography, Box, Stack } from "@mui/material";
import Image from "next/image";
import carimg from "../../../public/assets/card-img.png";
import { useChats } from "@/Context/ChatContext";

type Props = {
 onClick?: () => void;
 selectedItem: any;
}
const ModelCarousel: React.FC<Props> = ({onClick, selectedItem}) => {
  const {cars}=useChats()
  const settings: Settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
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
    <div className="slider-container" style={{ padding: "30px" }}>
      <Slider {...settings}>
        <div>
          <Card>
            <CardContent>
              <Stack display="flex" alignItems="center">
              <Image
                src={carimg}
                alt="card-img"
                height={200}
                width={200}
                style={{ objectFit: "contain" }}
              />
              </Stack>
              <Stack display="flex" flexDirection="row" alignItems="center" gap="15px" justifyContent="space-around">
                <Typography variant="h6" mt={2} fontSize="15px">
                  Maruti Suzuki S-Presso STD
                </Typography>
                  <Typography variant="h6" mt={2} color="text.secondary" fontSize="15px">&#8377; 4.3L</Typography>
              </Stack>
              <div style={{display: "flex", justifyContent:"space-between", alignItems:"center"}}><button onClick={onClick}>I know exactly i want</button> <button>I need advisor support</button></div>
            </CardContent>
          </Card>
        </div>

        {/* Dummy slides */}
        <div>
          <h3>Slide 2</h3>
        </div>
        <div>
          <h3>Slide 3</h3>
        </div>
        <div>
          <h3>Slide 4</h3>
        </div>
        <div>
          <h3>Slide 5</h3>
        </div>
        <div>
          <h3>Slide 6</h3>
        </div>
        <div>
          <h3>Slide 7</h3>
        </div>
      </Slider>
    </div>
  );
};

export default ModelCarousel;
