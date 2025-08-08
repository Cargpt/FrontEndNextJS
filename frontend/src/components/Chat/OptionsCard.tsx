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
import { useChats } from "@/Context/ChatContext";
import PersonIcon from '@mui/icons-material/Person';

import AdviceSelectionCard from "./Model/AdviceSelectionCard";
import {  BudgetToRange, capitalizeFirst } from "@/utils/services";
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
import FixedHeaderWithBack from "../Navbar/Navbar";
import AskAIChat from "./AskAi";
import { useColorMode } from "@/Context/ColorModeContext";
import { Capacitor } from "@capacitor/core";

const ChatBox: React.FC = () => {
  const { cars, messages, setMessages, filter, bookmark, setCars } = useChats();
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
      data:messages[messages.length-1].data

    };
  } else if (
    lastMsg.sender === "user" &&
    typeof lastMsg.message === "string" &&
    lastMsg.message.includes("fuel type set to")
  ) {
    botMessage = {
      id: String(Date.now()),
      message: {},
      render: "transmissionOption",
      sender: "bot",
      data:messages[messages.length-1].data
    };
  } else if (
    lastMsg.sender === "user" &&
    typeof lastMsg.message === "string" &&
    lastMsg.message.includes("body type set to")
  ) {
    botMessage = {
      id: String(Date.now()),
      message: {},
      render: "brandOption",
      sender: "bot",
      data:messages[messages.length-1].data

    };
  } else if (
    lastMsg.sender === "user" &&
    typeof lastMsg.message === "string" &&
    lastMsg.message.includes("transmission type set to")
  ) {
    botMessage = {
      id: String(Date.now()),
      message: {},
      render: "bodyOption",
      sender: "bot",
      data:messages[messages.length-1].data

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
    console.log("filter", filter)
    setCars((prev)=>[
      ...prev, {[`${filter?.brand_name}_${filter.model_name}`]: data?.data}

    ])
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
      // Add user message before bot message
      const userMessage: Message = {
        id: String(Date.now()),
        message: "Show me car models for the selected parameters.",
        render: "text",
        sender: "user",
      };
      const botMessage: Message = {
        id: String(Date.now() + 1),
        message: { [filter.brand_name]: remondatedCarModels },
        render: "carOptions",
        sender: "bot",
      };
      setMessages((prev) => [...prev, userMessage, botMessage]);
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
        return <Typography sx={{fontSize:"14px"}}  id={`user-message-${index}`}>{capitalizeFirst(message.message)}</Typography>; // Default text rendering
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
            options={message?.data?.fuel_types}
            label="fuel type"
            h1="⛽: Got it! What’s your preferred fuel type?
"
          />
        );
        case "transmissionOption":
        return (
          <AdviceSelectionCard
            options={message?.data?.transmission_types}
            label="transmission type"
            h1="⚙️ Cool! What kind of transmission do you prefer?"
             onBack={onBack}
            
          />
        );
      case "bodyOption":
        return (
          <AdviceSelectionCard
            options={message?.data?.body_types}
            label="body type"
            h1="🏎️: Great. What type of car body are you looking for?"
          />
        );
      
      case "brandOption":
        return (
          <CarModel
            options={message?.data?.brands}
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
      "I am looking for cars based on the selected parameters." && !lastItem.bookmark
    ) {

      console.log("hit here")
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
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const userAvatarRef = useRef<HTMLDivElement | null>(null);
  // Find the last user message index
  const lastUserMsgIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === "user") return i;
    }
    return -1;
  })();




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
    if (userAvatarRef.current) {
      const rect = userAvatarRef.current.getBoundingClientRect();
      const scrollY = window.scrollY + rect.top - 80;
      window.scrollTo({ top: scrollY, behavior: 'smooth' });
    } else if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
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


  useEffect(() => {
    if(bookmark){
      console.log("bookmark",bookmark)
      setMessages([ {
        id: String(Date.now()),
        message: `show me ${bookmark?.BrandName} ${bookmark?.ModelName} ${bookmark?.VariantName}  car.`,
        render: "text",
        sender: "user",

    },
    {
        id: String(Date.now() +1),
        message: {data:[bookmark]},
        render: "carOptions",
        sender: "bot",
        bookmark: true,

    }
    ]);
    }
  }, [bookmark]);
const isNative = Capacitor.isNativePlatform()
  const isLastMessage = messages.length - 1;

const bottomSpacing = `calc(
  ${theme.spacing(isLastMessage ? 6 : 2)} + 
  ${isNative ? theme.spacing(4) : theme.spacing(2)} + 
  env(safe-area-inset-bottom, 0px)
)`;

  const {mode}=useColorMode()
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
         
          <FixedHeaderWithBack backToPrevious={backToPrevious}/>
          {
           messages&& messages?.[messages.length-1]?.message==="Ask AI" &&
            <AskAIChat/>
          }
          {
            messages?.[messages?.length-1]?.message!=="Ask AI" &&

          <Box 
            sx={{minHeight:"100vh", background:"transparent"}}
            ref={chatContainerRef}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            
          >
            {messages.map((msg, index) => {
              const isLastUserMsg = msg.sender === "user" && index === lastUserMsgIndex;
              return (
                <Box
                  key={msg.id}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: msg.sender === "user" ? "flex-end" : "flex-start",

                    mb:bottomSpacing,
                    mt: { xs: 0, sm: 1 },
                    px: { xs: 2, sm: 0 },
                    textAlign: msg.sender === "user" ? "right" : "left",
                    fontSize: "14px",
                  }}
                >
                  {msg.sender === "bot" && (
                    <Box sx={{ mb: 0.5 }}>
                      <img loading="lazy" src="/assets/lisa.svg" alt="bot" width={32} height={32} />
                    </Box>
                  )}
                  {msg.sender === "user" && (
                    <Box sx={{ mb: 0.5 }} ref={isLastUserMsg ? userAvatarRef : undefined}>
                      <Avatar
                        sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}
                      >
                          <PersonIcon />
                      </Avatar>
                    </Box>
                  )}
                  <Paper
                    sx={{
                      p:  Number(`${msg.sender=="user" ? "1.5" : 0}`),
                      maxWidth: isSmallScreen ? "100%" : "75%",
                      bgcolor:
                        msg.sender === "user" ? "rgb(211, 227, 255)" : mode==="dark"?"transparent":"grey.100",
                      color: "black",
                    }}
                  >
                    {renderMessage(msg, index)}
                  </Paper>
                </Box>
              );
            })}
            {loading && (
              <Box display="flex" justifyContent="center" mt={2}>
                <CircularProgress />
              </Box>
            )}
            <div ref={bottomRef} />
          </Box>
}
        </Paper>
      </Box>



      {/* <div ref={bottomRef} /> */}
      
    </>
  );
};

export default ChatBox;