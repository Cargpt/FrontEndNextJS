"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Avatar,
  Paper,
  Button,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Typography,
} from "@mui/material";
import Image from "next/image";
import bot from "../../../public/assets/lisa.svg";
import { useChats } from "@/Context/ChatContext";
import PersonIcon from '@mui/icons-material/Person';

import AdviceSelectionCard from "./Model/AdviceSelectionCard";
import { BUDGET, BudgetToRange, capitalizeFirst } from "@/utils/services";
import CarModel from "./Model/AdviceSelectionCard/CarOptions";
import { axiosInstance1 } from "@/utils/axiosInstance";
import CarRecommendationTable from "./Model/AdviceSelectionCard/Recommondation";
import OptionsCard from "./Model/AdviceSelectionCard/OptionCard";
import { useSnackbar } from "@/Context/SnackbarContext";
import { useCookies } from "react-cookie";
import { KeyboardBackspaceSharp } from "@mui/icons-material";
import { useRouter } from "next/navigation";

import BrandModelSelectCard from "./Model/BrandModelSelectCard";
import CarResearchMenu from "../MoreResearchOnCar/MoreResearchOnCar";
import TeslaCard from "./Model/Cards/Car";

const ChatBox: React.FC = () => {
  const { cars, messages, setMessages, filter } = useChats();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [cookies, setCookie, removeCookie] = useCookies(["selectedOption"]);
  const fetchBrands = async () => {
    try {
      const data = await axiosInstance1.get("/api/cargpt/brands/");
     
      setBrands(data?.data);
    } catch (error) {}
  };
  useEffect(() => {
    fetchBrands();
  }, []);

 useEffect(() => {
  if (messages.length === 0) return;

  const lastMsg = messages[messages.length - 1];
  let botMessage: Message | null = null;

  if (lastMsg.sender === "user" && lastMsg.message === "I know exactly what I want") {
    botMessage = {
      id: String(Date.now()),
      message: { brands },
      render: "brandModelSelect",
      sender: "bot",
    };
  } else if (lastMsg.sender === "user" && lastMsg.message === "I need advisor support") {
    botMessage = {
      id: String(Date.now()),
      message: {},
      render: "selectOption",
      sender: "bot",
    };
  } else if (
    lastMsg.sender === "user" &&
    typeof lastMsg.message === "string" &&
    lastMsg.message.includes("budget set to")
  ) {
    botMessage = {
      id: String(Date.now()),
      message: {},
      render: "flueOption",
      sender: "bot",
    };
  } else if (
    lastMsg.sender === "user" &&
    typeof lastMsg.message === "string" &&
    lastMsg.message.includes("fuel type set to")
  ) {
    botMessage = {
      id: String(Date.now()),
      message: {},
      render: "bodyOption",
      sender: "bot",
    };
  } else if (
    lastMsg.sender === "user" &&
    typeof lastMsg.message === "string" &&
    lastMsg.message.includes("body type set to")
  ) {
    botMessage = {
      id: String(Date.now()),
      message: {},
      render: "transmissionOption",
      sender: "bot",
    };
  } else if (
    lastMsg.sender === "user" &&
    typeof lastMsg.message === "string" &&
    lastMsg.message.includes("transmission type set to")
  ) {
    botMessage = {
      id: String(Date.now()),
      message: {},
      render: "brandOption",
      sender: "bot",
    };
  } else if (lastMsg.sender === "user" && lastMsg.message?.brand_name) {
    botMessage = {
      id: String(Date.now()),
      message: {},
      render: "recommendationOption",
      sender: "bot",
    };
  } else if (
    lastMsg.sender === "user" &&
    typeof lastMsg.message === "string" &&
    (lastMsg.message.includes("I want to do more research on car") ||
      lastMsg.message.includes("Advanced filters for car searc"))
  ) {
    botMessage = {
      id: String(Date.now()),
      message: {},
      render: "researchOncar",
      sender: "bot",
    };
  } else if (lastMsg.sender === "user" && lastMsg.prompt) {
    botMessage = {
      id: String(Date.now()),
      message: lastMsg.message,
      render: "researchOncar",
      sender: "bot",
    };
  } else if (
    lastMsg.sender === "user" &&
    typeof lastMsg.message === "string" &&
    lastMsg.message.includes("Best")
  ) {
    botMessage = {
      id: String(Date.now()),
      message: {},
      render: "BestCarOption",
      sender: "bot",
    };
  }

  if (botMessage && brands.length>0) {
       setMessages((prev) => [...prev, botMessage!]);

    // setLoading(true);

    // const timer = setTimeout(() => {

    //   setLoading(false);
    // }, 1000);

    // return () => clearTimeout(timer);
  }
}, [messages, brands]);


  const handleIknowWhatEaxactlyWhatIWant = () => {
    // const lastItem = messages[messages.length - 1];
    const userMessage: Message = {
      id: String(Date.now()),
      message: "I know exactly what I want",
      render: "text",
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
  };

  const [remondatedCarModels, setRecommondatedCarModels] = useState<
    CarDetails[]
  >([]);

  const handleCarRecommendation = async () => {
    const data = await axiosInstance1.post(
      "/api/cargpt/car-for-para-advisor/",
      {
        ...filter,
      }
    );
    if (data.data.length === 0) return false;
    setRecommondatedCarModels(data.data);
  };

  const { showSnackbar } = useSnackbar();
  const onShowCar = () => {
    if (remondatedCarModels.length === 0) {
      showSnackbar("No car models found for the selected parameters.", {
        horizontal: "center",
        vertical: "bottom",
      });

      return false;
    } else {
      const userMessage: Message = {
        id: String(Date.now()),
        message: { [filter.brand_name]: remondatedCarModels },
        render: "carOptions",
        sender: "bot",
      };
      setMessages((prev) => [...prev, userMessage]);
      setRecommondatedCarModels([]);
      return true;
    }
  };

  const onBack = () => {
    const userMessage: Message = {
      id: String(Date.now()),
      message: "I need advisor support",
      render: "text",
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
  };


const [preferences, setPreferences] = useState<any[]>([]);
  const fetchPreference = async()=>{
    try {
           const data = await axiosInstance1.get('/api/cargpt/preferences/')

      setPreferences(data)
    } catch (error) {
      console.log("error", error)

      
    }
  }

  useEffect(() => {
      if (messages.length === 0) return;

  const lastMsg = messages[messages.length - 1];
if(lastMsg.render==="selectOption") fetchPreference()
   
  }, [messages])
  
  const preferenceList =preferences?.find((preference:any)=>preference?.price_range?.toString()===BudgetToRange[filter.budget])
  const renderMessage = (message: Message, index:number) => {
    switch (message.render) {
      case "brandModelSelect":
        return (
          <BrandModelSelectCard
            handleUserMessage={handleUserMessage}
            brands={message.message?.brands}
          />
        );
      case "carOptions":
        return (
          <TeslaCard
            onClick={handleIknowWhatEaxactlyWhatIWant}
            selectedItem={message.message}
            handleNeedAdviceSupport={handleNeedAdviceSupport}
          />
        );
      case "text":
        return <Typography  id={`user-message-${index}`}>{capitalizeFirst(message.message)}</Typography>; // Default text rendering
      case "selectOption":
        return (
          <AdviceSelectionCard
            options={preferences?.map((preference:any)=>preference?.price_range?.toString())}
            label="budget"
            h1={
              "Hi! :👋 I can help you choose the right car based on your preferences. Let's get started! First, what's your budget range in INR?"
            }
          />
        );
      case "flueOption":
        return (
          <AdviceSelectionCard
            options={preferenceList?.fuel_types?.split(",")}
            label="fuel type"
            h1="⛽: Got it! What’s your preferred fuel type?
"
          />
        );
      case "bodyOption":
        return (
          <AdviceSelectionCard
            options={preferenceList?.body_types?.split(",")?.map((fuel:string) => fuel.trim())}
            label="body type"
            h1="🏎️: Great. What type of car body are you looking for?"
          />
        );
      case "transmissionOption":
        return (
          <AdviceSelectionCard
            options={preferenceList?.transmission_types?.split(",")}
            label="transmission type"
            h1="⚙️ Cool! What kind of transmission do you prefer?
"
          />
        );
      case "brandOption":
        return (
          <CarModel
            options={brands.map((brand) => brand.BrandName)}
            label="brand"
            h1="🚗: Awesome! Which car brand do you prefer?"
            onclick={handleCarRecommendation}
          />
        );
      case "selectedFilter":
        return <CarRecommendationTable recommendations={filter} />;
      case "recommendationOption":
        return <OptionsCard onBack={onBack} onShowCars={onShowCar} />;
      case "researchOncar":
        return <CarResearchMenu />;
      // case "BestCarOption":
      //   return <BestCars setBrands={setBrands} />;

      default:
        return null;
    }
  };

  const handleUserMessage = (text: any) => {
    const lastItem = messages[messages.length - 1];
    const userMessage: Message = {
      id: String(Date.now()),
      message: "I am looking for cars based on the selected parameters.",
      render: "text",
      sender: "user",
    };

    const newsMessages: Message[] = [
      ...messages.slice(0, messages.length - 1),
      {
        ...lastItem,
        message: text,
      },
    ];
    newsMessages.push(userMessage);
    setMessages((prev) => [...prev, userMessage]);
  };
  useEffect(() => {
    if (messages.length === 0) return;

    const lastItem = messages[messages.length - 1];
    if (
      lastItem.message ==
      "I am looking for cars based on the selected parameters."
    ) {
      const botMessage: Message = {
        id: String(Date.now()),
        message: cars[cars.length - 1],
        render: "carOptions", // Change this to 'carOptions' if you want to show the carousel
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);
    }
  }, [messages]);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef<boolean>(false);




  const handleNeedAdviceSupport = () => {
    const userMessage: Message = {
      id: String(Date.now()),
      message: "I need advisor support",
      render: "text",
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
  };

  



    // Function to handle the drag event
  const handleDragStart = () => {
    draggingRef.current = true;
  };

  const handleDragEnd = () => {
    draggingRef.current = false;
    scrollToLastMessage();
  };

   const scrollToLastMessage = () => {
    if (chatContainerRef.current) {
      const lastMessage = chatContainerRef.current.lastElementChild as HTMLElement;
      if (lastMessage) {
        lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
  };

  // Add effect to scroll to the last message on mount or when new messages are added
  useEffect(() => {
    scrollToLastMessage();
  }, [messages]);



  const router = useRouter();
  const backToPrevious = () => {
    removeCookie("selectedOption");
    router.push("/");
  };

  console.log("kkkk0", filter)
  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          width: isSmallScreen ? "100%" : "80%",
          ml: { xs: 0, sm: 19 },
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 2,
            width: isSmallScreen ? "100%" : "70%",
            display: "flex",
            flexDirection: "column",
            padding: isSmallScreen ? "0px" : "16px",
          }}
        >
          <Button
            variant="outlined"
            sx={{ position: "fixed", border: "none" }}
            onClick={backToPrevious}
          >
            <KeyboardBackspaceSharp />
          </Button>

          <Box 
          sx={{minHeight:"100vh"}}
                ref={chatContainerRef}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}

          >
            {messages.map((msg, index) => (
              <Box
                key={msg.id}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
                  mb: 2,
                  mt: { xs: 4, sm: 1 },
                  p: { xs: 2, sm: 0 },
                  textAlign: msg.sender === "user" ? "right" : "left",
                  fontSize: "14px",
                }}
              >
                {msg.sender === "bot" && (
                  <Box sx={{ mb: 0.5 }}>
                    <Image src={bot} alt="bot" width={32} height={32} />
                  </Box>
                )}
                {msg.sender === "user" && (
                  <Box sx={{ mb: 0.5 }}>
                    <Avatar
                      sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}
                    >
                        <PersonIcon />

                    </Avatar>
                  </Box>
                )}
                <Paper
                  sx={{
                    p: 1.5,
                    maxWidth: isSmallScreen ? "100%" : "75%",
                    bgcolor:
                      msg.sender === "user" ? "rgb(211, 227, 255)" : "grey.100",
                    color: "black",
                  }}
                >
                  {renderMessage(msg, index)}
                </Paper>
              </Box>
            ))}
            {loading && (
              <Box display="flex" justifyContent="center" mt={2}>
                <CircularProgress />
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
      {/* <div ref={bottomRef} /> */}
    </>
  );
};

export default ChatBox;
