"use client";

import { useBotType } from "@/Context/BotTypeContext";
import { v4 as uuidv4 } from "uuid"; // Import uuid for unique ID generation

import {
  Box,
  Typography,
  Avatar,
  Stack,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useCookies } from "react-cookie";
import { axiosInstance } from "@/utils/axiosInstance";
import { useChats } from "@/Context/ChatContext";
import { useColorMode } from "@/Context/ColorModeContext";
import {
  ChatBubble,
  ChatBubbleOutline,
  FilterAltOutlined,
  FilterCenterFocusOutlined,
  Lightbulb,
  LightbulbOutline,
  SearchOffOutlined,
  StarOutline,
} from "@mui/icons-material";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
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
  const { handleBookmark, bookmark } = useChats();
  const { mode, toggleColorMode } = useColorMode();
  const theme = useTheme();

  const handleOptionClick = (type: string) => {
    setCookie("selectedOption", type, { path: "/" });
    if (bookmark) {
      handleBookmark(null);
    }
    router.push("/home");
  };

  const options = [
    {
      label: "I know exactly what I want",
      icon: <LightbulbOutline />,
      type: "want",
    },
    {
      label: "I need advisor support",
      icon: <SupportAgentOutlinedIcon />,
      type: "support",
    },
    {
      label: "I want to do more research on cars",
      icon: <SearchOutlinedIcon />,
      type: "search",
    },
    {
      label: "Advanced filters for car search",
      icon: <FilterAltOutlined />,
      type: "filter",
    },
    {
      label: "Ask AI",
      icon: <AutoAwesomeOutlinedIcon />,
      type: "ai",
    },
  ];
  const [cookies, setCookie] = useCookies(["selectedOption", "token"]);

  const handleGuestLogin = async () => {
    const uniqueUserId = uuidv4();

    const payload = {
      userId: uniqueUserId, // Include unique user ID
    };

    const response = await axiosInstance.post(
      `/api/cargpt/createUser/`,
      payload,
      {}
    );

    if (response.token) {
      // localStorage.setItem("auth_token", response.token);

      setCookie("token", response.token, { path: "/", maxAge: 365 * 60 * 60 }); // Store the token
      // localStorage.setItem("auth_token", response.token);
    } else {
    }
  };

  useEffect(() => {
    if (!cookies.token) handleGuestLogin();
  }, []);

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
          alignItems: "center", // Center align items horizontally
        }}
      >
        {/* Title Row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <img
            src="/assets/lisa.svg"
            width={36}
            height={36}
            alt="Advisor Icon"
            style={{ verticalAlign: "middle" }}
          />
          <Typography
            variant="h6"
            sx={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#1876d2",
              marginLeft: 1, // = 8px
              lineHeight: 1,
            }}
          >
            Your Car Advisor
          </Typography>
        </Box>

        {/* Subtext */}
        <Typography
          sx={{
            color: "#797979",
            fontSize: "14px",
            fontWeight: 400,
            mt: 1,
          }}
        >
          Excited you're here! Let's find your perfect car.
        </Typography>
      </Box>

      {/* Car Search Options */}
      <Stack spacing={2} sx={{ maxWidth: 400, mx: "auto" }}>
        {options.map((option, index) => (
          <ListItemButton
            key={index}
            onClick={() => handleOptionClick(option.label)}
            sx={{
              background:
                mode === "dark"
                  ? "linear-gradient(rgba(255, 255, 255, 0.092), rgba(255, 255, 255, 0.092))"
                  : "#d3e3ff",
              borderRadius: "25px",
            }}
          >
            <ListItemIcon
              sx={{ minWidth: 32, mr: "2px" }} // 👈 Reduce horizontal space here (default is 56)
            >
              {option.icon}
            </ListItemIcon>
            <ListItemText primary={option.label} />
          </ListItemButton>
        ))}
      </Stack>
    </Box>
  );
};

export default AdvisorIntro;
