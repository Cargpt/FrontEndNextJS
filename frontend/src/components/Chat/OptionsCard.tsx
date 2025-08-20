"use client";
import React, { useEffect, useRef, useState } from "react";
import { Box, Avatar, Paper, useMediaQuery, useTheme, CircularProgress, Grow, Chip } from "@mui/material";
import { useChats } from "@/Context/ChatContext";
import PersonIcon from "@mui/icons-material/Person";
import { axiosInstance1 } from "@/utils/axiosInstance";
import { useSnackbar } from "@/Context/SnackbarContext";
import { useCookies } from "react-cookie";
import { useRouter } from "next/navigation";
import FixedHeaderWithBack from "../Navbar/Navbar";
import AskAIChat from "./AskAi";
import { useColorMode } from "@/Context/ColorModeContext";
import { Capacitor } from "@capacitor/core";
import MessageRenderer from "./components/MessageRenderer";
import { useBrands } from "./hooks/useBrands";
import { usePreferences } from "./hooks/usePreferences";
import { useAutoScroll } from "./hooks/useAutoScroll";
import { usePersistHistory } from "./hooks/usePersistHistory";

const ChatBox: React.FC = () => {
  const { cars, messages, setMessages, filter, bookmark, setCars } = useChats();
  const theme = useTheme();
  
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(false);
  const { brands } = useBrands();
  const [cookies, , removeCookie] = useCookies(["selectedOption", "user"]);
  const [loadingMoreRecommendations, setLoadingMoreRecommendations] = useState<boolean>(false);

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

  const [remondatedCarModels, setRecommondatedCarModels] = useState<CarDetails[]>([]);

  const handleCarRecommendation = async () => {
    setLoadingMoreRecommendations(true);
    try {
      const payload = {
        ...filter
      };
      const response = await axiosInstance1.post(
        "/api/cargpt/car-for-para-advisor/",
        payload
      );
      const data = response?.data; // axiosInstance1 returns parsed data directly
      const recommendations = Array.isArray(data)
        ? data
        : (Array.isArray((data as any)?.recommendations) ? (data as any).recommendations : []);

      if (!recommendations || recommendations.length === 0) {
        showSnackbar("No cars found for the selected parameters.", {
          horizontal: "center",
          vertical: "bottom",
        });
        return;
      }
      setRecommondatedCarModels(recommendations);
      console.log("filter", filter)
      // We don't have brand_name or model_name from recommend-by-price, so we'll use a generic key or derive one if possible.
      // For now, let's just add the new recommendations under a generic key or the first car's brand/model if available.
      const newCarsEntry = { "Recommendations": recommendations };
      setCars((prev)=>[
        ...prev, newCarsEntry

      ])
      // onShowCar(); // Removed direct call to onShowCar
      return;
    } catch (error: any) {
      console.error("Error fetching recommendations:", error);
      let errorMessage = "Failed to fetch recommendations. Please try again later.";
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      showSnackbar(errorMessage, {
        horizontal: "center",
        vertical: "bottom",
      });
      return;
    } finally {
      setLoadingMoreRecommendations(false);
    }
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

  // New useEffect to display cars when remondatedCarModels updates
  // useEffect(() => {
  //   if (remondatedCarModels.length > 0) {
  //     const count = remondatedCarModels.length;
  //     const carPlural = count === 1 ? "car" : "cars";
  //     const userMessage: Message = {
  //       id: String(Date.now()),
  //       message: `Here are the best ${count} ${carPlural} that match your preferences 🚗✨`,
  //       render: "text",
  //       sender: "user",
  //     };
  //     const botMessage: Message = {
  //       id: String(Date.now() + 1),
  //       // When using recommend-by-price, filter.brand_name might be undefined.
  //       // We need a fallback key here, e.g., "Recommendations" or the first car's brand name.
  //       message: { [filter.brand_name || "Recommendations"]: remondatedCarModels },
  //       render: "carOptions",
  //       sender: "bot",
  //     };
  //     setMessages((prev) => [...prev, userMessage, botMessage]);
  //     setRecommondatedCarModels([]); // Clear after displaying
  //   }
  // }, [remondatedCarModels]);

  const onBack = () => {
    const userMessage: Message = {
      id: String(Date.now()),
      message: "I need advisor support",
      render: "text",
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
  };
  // Fetch preferences when a selectOption card is present anywhere in the restored history
  const hasSelectOption = messages.some((m) => m.render === "selectOption");
  const { preferences } = usePreferences(hasSelectOption);


 
  
  // Message rendering delegated to MessageRenderer

  const handleUserMessage = (text: any) => {
    const lastItem = messages[messages.length - 1];
    const userMessage: Message = {
      id: String(Date.now()),
      message: "I am looking for cars based on the selected parameters.",
      render: "text",
      sender: "user",
    };

    const mergedPayload =
      lastItem && typeof lastItem.message === "object" && lastItem.message !== null
        ? { ...(lastItem.message as Record<string, any>), ...(text as Record<string, any>) }
        : text;

    const updatedLastItem: Message = {
      ...lastItem,
      message: mergedPayload,
    };

    const updatedMessages: Message[] = [
      ...messages.slice(0, messages.length - 1),
      updatedLastItem,
      userMessage,
    ];
    setMessages(updatedMessages);
  };

  // Silent updater to persist Brand/Model intermediate selections in the last bot message
  const updateBrandModelState = (partial: any) => {
    if (messages.length === 0) return;
    const lastItem = messages[messages.length - 1];
    const merged =
      lastItem && typeof lastItem.message === "object" && lastItem.message !== null
        ? { ...(lastItem.message as Record<string, any>), ...(partial as Record<string, any>) }
        : partial;
    const updatedLastItem: Message = { ...lastItem, message: merged };
    setMessages([...messages.slice(0, -1), updatedLastItem]);
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
  const { bottomRef, userAvatarRef, lastUserMsgIndex, scrollToLastMessage } = useAutoScroll(messages);

  // Persist history only when a logged-in user is present
  usePersistHistory(messages, {
    endpoint: "/api/cargpt/history/",
    isEnabled: Boolean(cookies?.user),
  });




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
  // scrollToLastMessage handled by hook on messages change



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
  console.log("history", messages)
  // Helper function to sort car arrays
  const [sortOption, setSortOption] = useState<string>("none");
  useEffect(() => {
    const handler = (e: any) => {
      const detail = e?.detail as string;
      if (detail === "price" || detail === "mileage" || detail === "none") {
        setSortOption(detail);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('car-sort', handler as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('car-sort', handler as EventListener);
      }
    };
  }, []);
  const sortCars = (carsArray: any[], option: string) => {
    if (option === "price") {
      return [...carsArray].sort((a, b) => (a.Price || 0) - (b.Price || 0));
    } else if (option === "mileage") {
      return [...carsArray].sort((a, b) => (b.Mileage || 0) - (a.Mileage || 0));
    }
    return carsArray;
  };
  
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
          <>
          <Box 
            sx={{minHeight:"100vh",
              
              background:"transparent",  
              marginBottom:isNative ? "2.7rem":"1.5rem"

              
              
            }}
            
            ref={chatContainerRef}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            
          >
            {messages.map((msg, index) => {
              // If this is a carOptions render, sort the car data before passing
              let sortedMsg = msg;
              if (msg.render === "carOptions" && msg.message && typeof msg.message === "object") {
                const carObj = msg.message as Record<string, any>;
                const key = Object.keys(carObj)[0];
                if (Array.isArray(carObj[key])) {
                  const sortedArr = sortCars(carObj[key], sortOption);
                  sortedMsg = {
                    ...msg,
                    message: { [key]: sortedArr },
                  } as typeof msg;
                }
              }
              const isLastUserMsg = msg.sender === "user" && index === lastUserMsgIndex;

              return (
                <>
                <Box
                  key={msg.id}
                  sx={{
                     paddingX:"1rem",
                     
                     paddingBottom: index%2==1 && index>0 ? "20px" : "10px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
                    transition: 'background 0.3s ease',

                     // '&:hover': {
                    //   background: 'rgba(0, 0, 0, 0.05)', // 👈 Example hover effect
                    //   cursor: 'pointer',               // Optional
                    // },
                

                    
                    mt: { xs: isNative && index===0? 3:  0, sm: isNative && index===0? 3: 0 },
                    px: { xs: 2, sm: 0 },
                    textAlign: msg.sender === "user" ? "right" : "left",
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
                  <Grow in appear timeout={300}>
                  <Paper
                  elevation={ 0}

                    sx={{
                      p:  Number(`${msg.sender=="user" ? "1.5" : 0}`),
                      maxWidth: isSmallScreen ? "100%" : "75%",
                      minWidth: index%2==1 ? "100%":"0px",
                     backgroundImage:"none",
borderRadius: '16px',
      borderBottomRightRadius: 0,
                      
                      bgcolor:
                        msg.sender === "user" && mode==="light"? "rgb(211, 227, 255)"   : mode==="dark" && msg.sender==="user"? "primary":"transparent",
                    
                    
                    }}
                  >
                    <MessageRenderer
                      message={sortedMsg}
                      index={index}
                      preferences={preferences}
                      filter={filter}
                      availableBrands={brands}
                      onIknowExactly={handleIknowWhatEaxactlyWhatIWant}
                      onNeedAdviceSupport={handleNeedAdviceSupport}
                      onBack={onBack}
                      onShowCars={onShowCar}
                      onCarRecommendation={handleCarRecommendation}
                      onUserMessage={handleUserMessage}
                      onPersistBrandModel={updateBrandModelState}
                      onTriggerOverallRecommendations={handleCarRecommendation} // Pass the function here
                    />
                  </Paper>
                  </Grow>
                </Box>
                {
                  index%2==1 &&
                   <Box
                   sx={{
                   borderBottom: "1px solid",
  borderColor: (theme) =>
    theme.palette.mode === 'light'
      ? '#f7f7f7'        // ✅ subtle for white bg
      : theme.palette.grey[800], // ✅ soft dark gray for dark mode
 
              mb:1
                }}>
                  </Box>
                }
               
                  </>
              );
            })}
            {loading && (
              <Box display="flex" justifyContent="center" mt={2}>
                <CircularProgress />
              </Box>
            )}
            
            <div ref={bottomRef} />
          </Box>
          </>
}
        </Paper>
      </Box>



      {/* <div ref={bottomRef} /> */}
      
    </>
  );
};

export default ChatBox;