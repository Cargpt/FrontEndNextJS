'use client'

import { useBotType } from "@/Context/BotTypeContext";
import {
  Box,
  Typography,
  Avatar,
  Stack,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { useCookies } from "react-cookie";

interface AdvisorIntroProps {
  showInitialExample: boolean;
  onBotClick: (type: string) => void;
}

const AdvisorIntro: React.FC<AdvisorIntroProps> = ({
  showInitialExample,
  onBotClick,
}) => {
  const router = useRouter();
  const { setBotType } = useBotType();

  if (!showInitialExample) return null;

  const handleOptionClick = (type: string) => {
    setCookie('selectedOption', type, { path: '/' });
   
    router.push("/home");
  };

  const options = [
    {
      label: "I know exactly what I want",
      icon: "/assets/lightbulb.svg",
      type: "want",
    },
    {
      label: "I need advisor support",
      icon: "/assets/chat-quote.svg",
      type: "support",
    },
    {
      label: "I want to do more research on car",
      icon: "/assets/search.svg",
      type: "search",
    },
    {
      label: "Advanced filter for car search",
      icon: "/assets/funnel.svg",
      type: "filter",
    },
    {
      label: "Ask AI",
      icon: "/assets/stars.svg",
      type: "ai",
    },
  ];
const [cookies, setCookie]=useCookies(['selectedOption'])


  return (
    <Box>
      {/* Profile Section */}
      <Box
        sx={{
          textAlign: "center",
          py: 4,
          display: "flex",
          flexDirection: "column",
          gap: "30px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px",
          }}
        >
          <Avatar
            src="/assets/avator_main2.png"
            alt="Profile Picture"
            sx={{
              width: 40,
              height: 40,
              position: "relative",
              top: "8px",
              left: 20,
            }}
          />
          <Typography
            variant="h5"
            mt={2}
            style={{
              borderRadius: "25px",
              border: "1px solid grey",
              width: "120px",
            }}
          >
            I’m Lisa
          </Typography>
        </Box>
        <div>
          <Typography
            variant="subtitle1"
            style={{ fontSize: "28px", fontWeight: 700, color: "#1876d2" }}
          >
            Your Car Advisor
          </Typography>
          <Typography
            mt={1}
            style={{ color: "#797979", fontSize: "14px", fontWeight: 400 }}
          >
            Excited you're here! Let's find your perfect car.
          </Typography>
        </div>
      </Box>

      {/* Car Search Options */}
      <Stack spacing={2} sx={{ maxWidth: 400, mx: "auto" }}>
        {options.map((option, index) => (
          <ListItemButton
            key={index}
            onClick={() => handleOptionClick(option.label)}
            style={{ backgroundColor: "#d3e3ff", borderRadius: "25px" }}
          >
            <ListItemIcon>
              <Image
                src={option.icon}
                alt={option.label}
                width={24}
                height={24}
              />
            </ListItemIcon>
            <ListItemText primary={option.label} />
          </ListItemButton>
        ))}
      </Stack>
    </Box>
  );
};

export default AdvisorIntro;
