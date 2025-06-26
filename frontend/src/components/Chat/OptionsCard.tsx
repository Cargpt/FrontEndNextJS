"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Avatar,
  Typography,
  Paper,
  Stack,
  CircularProgress,
  Button,
} from '@mui/material';
import Image from 'next/image';
import bot from "../../../public/assets/lisa.svg"
import BrandModelSelectCard from './Model/BrandModelSelectCard';
import ModelCarousel from '../ModelCarousel/ModelCarousel';
import { useChats } from '@/Context/ChatContext';
import AdviceSelectionCard from './Model/AdviceSelectionCard';
import { BUDGET, MORERESEARCHONCAROPTIONS } from '@/utils/services';
import CarModel from './Model/AdviceSelectionCard/CarOptions';
import { axiosInstance1 } from '@/utils/axiosInstance';
import CarRecommendationTable from './Model/AdviceSelectionCard/Recommondation';
import OptionsCard from './Model/AdviceSelectionCard/OptionCard';
import { useSnackbar } from '@/Context/SnackbarContext';
import { useCookies } from 'react-cookie';
import { KeyboardBackspaceSharp } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import CarResearchMenu from '../MoreResearchOnCar/MoreResearchOnCar';
import BestCars from '../MoreResearchOnCar/carList';


const ChatBox: React.FC = () => {
  const { cars, messages, setMessages, filter } = useChats();

  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [cookies, setCookie, removeCookie] = useCookies(["selectedOPtion"]);
  const fetchBrands = async () => {
    try {
      const data = await axiosInstance1.get("/api/brands/");

      setBrands(data?.data);
    } catch (error) {}
  };
  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    // Simulate bot reply after a delay
    const timer = setTimeout(() => {
      const lastMsg = messages[messages.length - 1];

      if (
        lastMsg.sender === "user" &&
        lastMsg.message === "I know exactly what I want"
      ) {
        setLoading(true);
        setTimeout(() => {
          const botMessage: Message = {
            id: String(Date.now()),
            message: {},
            render: "brandModelSelect", // Change this to 'carOptions' if you want to show the carousel
            sender: "bot",
          };
          setMessages((prev) => [...prev, botMessage]);
          setLoading(false);
        }, 1000);
      }

      else if (
        lastMsg.sender === "user" &&
        lastMsg.message === "I need advisor support"
      ) {
        setLoading(true);
        setTimeout(() => {
          const botMessage: Message = {
            id: String(Date.now()),
            message: {},
            render: "selectOption", // Change this to 'carOptions' if you want to show the carousel
            sender: "bot",
          };
          setMessages((prev) => [...prev, botMessage]);
          setLoading(false);
        }, 1000);
      }
     else if (
        lastMsg.sender === "user" &&
        typeof lastMsg.message == "string" &&
        lastMsg.message?.includes("budget set to")
      ) {
        setLoading(true);
        setTimeout(() => {
          const botMessage: Message = {
            id: String(Date.now()),
            message: {},
            render: "flueOption", // Change this to 'carOptions' if you want to show the carousel
            sender: "bot",
          };
          setMessages((prev) => [...prev, botMessage]);
          setLoading(false);
        }, 1000);
      }
     else if (
        lastMsg.sender === "user" &&
        typeof lastMsg.message == "string" &&
        lastMsg.message?.includes("fuel type set to")
      ) {
        setLoading(true);
        setTimeout(() => {
          const botMessage: Message = {
            id: String(Date.now()),
            message: {},
            render: "bodyOption", // Change this to 'carOptions' if you want to show the carousel
            sender: "bot",
          };
          setMessages((prev) => [...prev, botMessage]);
          setLoading(false);
        }, 1000);
      }
      else if (
        lastMsg.sender === "user" &&
        typeof lastMsg.message == "string" &&
        lastMsg.message?.includes("body type set to")
      ) {
        setLoading(true);
        setTimeout(() => {
          const botMessage: Message = {
            id: String(Date.now()),
            message: {},
            render: "transmissionOption", // Change this to 'carOptions' if you want to show the carousel
            sender: "bot",
          };
          setMessages((prev) => [...prev, botMessage]);
          setLoading(false);
        }, 1000);
      }
      else if (
        lastMsg.sender === "user" &&
        typeof lastMsg.message == "string" &&
        lastMsg.message?.includes("transmission type set to")
      ) {
        setLoading(true);
        setTimeout(() => {
          const botMessage: Message = {
            id: String(Date.now()),
            message: {},
            render: "brandOption", // Change this to 'carOptions' if you want to show the carousel
            sender: "bot",
          };
          setMessages((prev) => [...prev, botMessage]);
          setLoading(false);
        }, 1000);
      }
       else if (lastMsg.sender === 'user' && typeof lastMsg.message=="string" && lastMsg.message?.includes('transmission type set to')) {
          setLoading(true);
          setTimeout(() => {
            const botMessage: Message = {
              id: String(Date.now()),
              message: {},
              render:"brandOption", // Change this to 'carOptions' if you want to show the carousel
              sender: 'bot',
            };
            setMessages(prev => [...prev, botMessage]);
            setLoading(false);
          }, 1000);
        }

        else if (lastMsg.sender === 'user' && lastMsg.message?.brand_name) {
          setLoading(true);
          setTimeout(() => {
            const botMessage: Message = {
              id: String(Date.now()),
              message: {},
              render:"recommendationOption", // Change this to 'carOptions' if you want to show the carousel
              sender: 'bot',
            };
            setMessages(prev => [...prev, botMessage]);
            setLoading(false);
          }, 1000);
        }

        else if (lastMsg.sender === 'user' && typeof lastMsg.message=="string" && lastMsg.message?.includes('I want to do more research on car')) {
          setLoading(true);
          setTimeout(() => {
            const botMessage: Message = {
              id: String(Date.now()),
              message: {},
              render:"researchOncar", // Change this to 'carOptions' if you want to show the carousel
              sender: 'bot',
            };
            setMessages(prev => [...prev, botMessage]);
            setLoading(false);
          }, 1000);
        }


  else if (lastMsg.sender === 'user' && typeof lastMsg.message=="string" &&  lastMsg.prompt) {
          setLoading(true);
          setTimeout(() => {
            const botMessage: Message = {
              id: String(Date.now()),
              message: messages[messages.length-1].message,
              render:"researchOncar", // Change this to 'carOptions' if you want to show the carousel
              sender: 'bot',
            };
            setMessages(prev => [...prev, botMessage]);
            setLoading(false);
          }, 1000);
        }

     else if (lastMsg.sender === 'user' && typeof lastMsg.message=="string" && lastMsg.message?.includes('Best')) {
          setLoading(true);
          setTimeout(() => {
            const botMessage: Message = {
              id: String(Date.now()),
              message: {},
              render:"BestCarOption", // Change this to 'carOptions' if you want to show the carousel
              sender: 'bot',
            };
            setMessages(prev => [...prev, botMessage]);
            setLoading(false);
          }, 1000);
        }
else if (lastMsg.sender === 'user' &&  lastMsg.message.includes("Show me")) {
        setLoading(true);
        setTimeout(() => {
          const botMessage: Message = {
            id: String(Date.now()),
            message: {},
            render:"brandModelSelect", // Change this to 'carOptions' if you want to show the carousel
            sender: 'bot',
          };
          setMessages(prev => [...prev, botMessage]);
          setLoading(false);
        }, 1000);
      }


      else if (lastMsg.sender === "user" && lastMsg.message?.brand_name) {
        setLoading(true);
        setTimeout(() => {
          const botMessage: Message = {
            id: String(Date.now()),
            message: {},
            render: "recommendationOption", // Change this to 'carOptions' if you want to show the carousel
            sender: "bot",
          };
          setMessages((prev) => [...prev, botMessage]);
          setLoading(false);
        }, 1000);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [messages]);

  const handleIknowWhatEaxactlyWhatIWant = () => {
    // const lastItem = messages[messages.length - 1];
    const userMessage: Message = {
      id: String(Date.now()),
      message: "I know exactly what I want",
      render: "text",
      sender: "user",
    };

    // // const newsMessages: Message[] = [...messages.slice(0, messages.length - 1), {
    // //   ...lastItem,
    // //   message: "I know exactly what I want"
    // // }];
    // newsMessages.push(userMessage);
    setMessages((prev) => [...prev, userMessage]);
  };

  const [remondatedCarModels, setRecommondatedCarModels] = useState<
    CarDetails[]
  >([]);

  const handleCarRecommendation = async () => {
    const data = await axiosInstance1.post("/api/car-for-para-advisor/", {
      ...filter,
    });
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

      return;
    }
    const userMessage: Message = {
      id: String(Date.now()),
      message: { [filter.brand_name]: remondatedCarModels },
      render: "carOptions",
      sender: "bot",
    };
    setMessages((prev) => [...prev, userMessage]);
    setRecommondatedCarModels([]);
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
  const renderMessage = (message: Message) => {
    switch (message.render) {
      case "brandModelSelect":
        return (
          <BrandModelSelectCard
            handleUserMessage={handleUserMessage}
            brands={brands}
          />
        );
      case "carOptions":
        return (
          <ModelCarousel
            onClick={handleIknowWhatEaxactlyWhatIWant}
            selectedItem={message.message}
            handleNeedAdviceSupport={handleNeedAdviceSupport}
          />
        );
      case "text":
        return <div>{message.message}</div>; // Default text rendering
      case "selectOption":
        return (
          <AdviceSelectionCard
            options={BUDGET}
            label="budget"
            h1={
              "Hi! :👋 I can help you choose the right car based on your preferences. Let's get started! First, what's your budget range in INR?"
            }
          />
        );
      case "flueOption":
        return (
          <AdviceSelectionCard
            options={["Petrol", "Diesel", "CNG", "Electric"]}
            label="fuel type"
            h1="⛽: Got it! What’s your preferred fuel type?
"
          />
        );
      case "bodyOption":
        return (
          <AdviceSelectionCard
            options={["Hatchback", "Sedan", "SUV", "MPV"]}
            label="body type"
            h1="🏎️: Great. What type of car body are you looking for?"
          />
        );
      case "transmissionOption":
        return (
          <AdviceSelectionCard
            options={["Automatic", "Manual"]}
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
        return <CarRecommendationTable  recommendations={filter} /> 
      case  'recommendationOption':
        return <OptionsCard onBack={onBack} onShowCars={onShowCar} />
      case 'researchOncar':
        return <CarResearchMenu/> 
      case 'BestCarOption':
        return <BestCars setBrands={setBrands} />



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
    setMessages(newsMessages);
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

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const handleNeedAdviceSupport = () => {
    const userMessage: Message = {
      id: String(Date.now()),
      message: "I need advisor support",
      render: "text",
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
  };

  useEffect(() => {
    if (messages.length === 0) return;

    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const router = useRouter();
  const backToPrevious = () => {
    removeCookie("selectedOPtion");
    router.push("/");
  };

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          width: "100%",

          display: "flex",
          flexDirection: "column",
          mx: "auto",
        }}
      >
        <Button
          variant="outlined"
          sx={{ position: "fixed" }}
          onClick={backToPrevious}
        >
          <KeyboardBackspaceSharp />
        </Button>

        {/* Message List */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            mb: 2,
            pr: 1,
          }}
        >
          {messages.map((msg, index) => (
            <Stack
              key={msg.id}
              direction="row"
              spacing={1}
              alignItems="flex-start"
              justifyContent={msg.sender === "user" ? "flex-end" : "flex-start"}
              sx={{ mb: 2 }}
            >
              {msg.sender === "bot" && (
                <Image src={bot} alt="bot" width={40} height={40} />
              )}
              <Paper
                sx={{
                  p: 1.5,
                  maxWidth: "75%",
                  bgcolor:
                    msg.sender === "user" ? "rgb(211, 227, 255)" : "gray.100",
                  color: msg.sender === "user" ? "black" : "black",
                }}
              >
                <div key={index}>{renderMessage(msg)}</div>
              </Paper>
              {msg.sender === "user" && (
                <Avatar sx={{ bgcolor: "secondary.main" }}>U</Avatar>
              )}
            </Stack>
          ))}

          {loading && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Image src={bot} alt="bot" width={40} height={40} />
              <CircularProgress size={20} />
            </Stack>
          )}
        </Box>
      </Paper>
      <div ref={bottomRef} />
    </>
  );
};

export default ChatBox;
