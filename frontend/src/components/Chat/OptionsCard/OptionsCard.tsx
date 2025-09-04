"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Avatar,
  Paper,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Grow,
  Fab, // Add Fab import
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"; // Add KeyboardArrowDownIcon import
import { useChats } from "@/Context/ChatContext";
import PersonIcon from "@mui/icons-material/Person";
import { axiosInstance1 } from "@/utils/axiosInstance";
import { useSnackbar } from "@/Context/SnackbarContext";
import { useCookies } from "react-cookie";
import { v4 as uuidv4 } from "uuid"; // Import uuidv4
import { useRouter } from "next/navigation";
import FixedHeaderWithBack from "../../Navbar/Navbar";
import AskAIChat from "../AskAi";
import { useColorMode } from "@/Context/ColorModeContext";
import { Capacitor } from "@capacitor/core";
import MessageRenderer from "../components/MessageRenderer";
import { useBrands } from "../hooks/useBrands";
import { usePreferences } from "../hooks/usePreferences";
import { useAutoScroll } from "../hooks/useAutoScroll";
import { usePersistHistory } from "../hooks/usePersistHistory";
import DealerList from "./DealerList";
import Feeds from "./Feeds";

// This is a dummy comment to trigger linter re-evaluation
const ChatBox: React.FC = () => {
  const { cars, messages, setMessages, filter, bookmark, setCars } = useChats();
  const theme = useTheme();

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(false);
  const { brands, setBrands } = useBrands(); // Destructure setBrands from useBrands
  const [cookies, setCookie, removeCookie] = useCookies(["selectedOption", "user", "token"]);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const handleGuestLogin = async () => {
    const uniqueUserId = uuidv4();

    const payload = {
      userId: uniqueUserId, // Include unique user ID
    };

    try {
      const response = await axiosInstance1.post(
        `/api/cargpt/createUser/`,
        payload,
        {}
      );
      if (response.data.token) {
        setCookie("token", response.data.token, { path: "/", maxAge: 365 * 24 * 60 * 60 }); // Store the token for 1 year
        console.log("Guest token generated:", response.data.token);
      } else {
        console.error("Token not received from createUser API");
      }
    } catch (error) {
      console.error("Error creating guest user:", error);
    }
  };

  useEffect(() => {
    if (messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];
    let botMessage: Message | null = null;

    if (
      lastMsg.sender === "user" &&
      lastMsg.message === "I know exactly what I want"
    ) {
      botMessage = {
        id: String(Date.now()),
        message: { brands },
        render: "brandModelSelect",
        sender: "bot",
      };
    } else if (
      lastMsg.sender === "user" &&
      lastMsg.message === "I need advisor support"
    ) {
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
        data: messages[messages.length - 1].data,
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
        data: messages[messages.length - 1].data,
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
        data: messages[messages.length - 1].data,
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
        data: messages[messages.length - 1].data,
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
    } else if (lastMsg.sender === "user" &&  typeof lastMsg.message === "string" && lastMsg.message === "Compare Car.") {
        console.log("lastMsg", messages);
        const msgs :Message[]=  [
          ...messages,
        
          {
            id: String(Date.now() + 1),
            render: "compareVsSelector" as const,
            sender: "bot" as const,
            message: ""
          }
        ]
        setMessages(msgs);
      

    }

    if (botMessage && brands.length > 0) {
      setMessages((prev) => [...prev, botMessage!]);

      // setLoading(true);

      // const timer = setTimeout(() => {

      //   setLoading(false);
      // }, 1000);

      // return () => clearTimeout(timer);
    }
  }, [messages, brands]);

  // New useEffect for token check and API calls
  useEffect(() => {
    const checkTokenAndFetchData = async () => {
      if (!cookies.token) {
        await handleGuestLogin();
      }

      // After token is available (either existed or newly generated)
      if (cookies.token) {
        try {
          // Fetch city dealers
        
          // setDealerList(dealersResponse.data);

          // Fetch brands
          const brandsResponse = await axiosInstance1.get("/api/cargpt/brands/");
          // Assuming setBrands is available in context or passed as prop
          setBrands(brandsResponse.data); // Update brands using setBrands from useBrands
          console.log("Brands fetched:", brandsResponse.data);
        } catch (error) {
          console.error("Error fetching initial data:", error);
        }
      }
    };

    checkTokenAndFetchData();
  }, [cookies.token]); // Rerun when token changes


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
    if (data.data.length === 0) return;
    setRecommondatedCarModels(data.data);
    console.log("filter", filter);
    setCars((prev) => [
      ...prev,
      { [`${filter?.brand_name}_${filter.model_name}`]: data?.data },
    ]);
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
        message: "Show cars that fit my preferences",
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
      lastItem &&
      typeof lastItem.message === "object" &&
      lastItem.message !== null
        ? {
            ...(lastItem.message as Record<string, any>),
            ...(text as Record<string, any>),
          }
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
      lastItem &&
      typeof lastItem.message === "object" &&
      lastItem.message !== null
        ? {
            ...(lastItem.message as Record<string, any>),
            ...(partial as Record<string, any>),
          }
        : partial;
    const updatedLastItem: Message = { ...lastItem, message: merged };
    setMessages([...messages.slice(0, -1), updatedLastItem]);
  };

  useEffect(() => {
    if (messages.length === 0) return;

    const lastItem = messages[messages.length - 1];
    if (
      lastItem.message ==
        "I am looking for cars based on the selected parameters." &&
      !lastItem.bookmark
    ) {
      console.log("hit here");
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
  const {
    bottomRef,
    userAvatarRef,
    lastUserMsgIndex,
    scrollToLastMessage,
    isAtBottom,
  } = useAutoScroll(
    messages,
    chatContainerRef as React.RefObject<HTMLDivElement | null>
  );

  useEffect(() => {
    if (chatContainerRef.current) {
      setShowScrollToBottom(!isAtBottom);
    }
  }, [isAtBottom]);

  const scrollToBottom = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

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
    if (bookmark) {
      console.log("bookmark", bookmark);
      setMessages([
        {
          id: String(Date.now()),
          message: `show me ${bookmark?.BrandName} ${bookmark?.ModelName} ${bookmark?.VariantName}  car.`,
          render: "text",
          sender: "user",
        },
        {
          id: String(Date.now() + 1),
          message: { data: [bookmark] },
          render: "carOptions",
          sender: "bot",
          bookmark: true,
        },
      ]);
    }
  }, [bookmark]);
  const isNative = Capacitor.isNativePlatform();
  const isLastMessage = messages.length - 1;
  const isAndroid = Capacitor.getPlatform() === "android";

  const bottomSpacing = `calc(
  ${theme.spacing(isLastMessage ? 6 : 2)} + 
  ${isNative ? theme.spacing(4) : theme.spacing(2)} + 
  env(safe-area-inset-bottom, 0px)

)`;

  const { mode } = useColorMode();

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          ml: { xs: 0, sm: 0 },
        }}
      >
        {!isSmallScreen && <Feeds />}
        <Paper
          elevation={1}
          sx={{
            p: 2,

            width: isSmallScreen ? "100%" : "50%",
            display: "flex",
            flexDirection: "column",
            padding: isSmallScreen ? "0px" : "16px",
          }}
        >
          <FixedHeaderWithBack backToPrevious={backToPrevious} />
          {messages &&
            messages?.[messages.length - 1]?.message === "Ask AI" && (
              <AskAIChat />
            )}
          {messages?.[messages?.length - 1]?.message !== "Ask AI" && (
            <Box
              sx={{
                minHeight: "80vh",
                maxHeight: "calc(100vh - 120px)", // Adjust this value as needed
                overflowY: "auto",
                background: "transparent",
                marginBottom: isNative ? "2.7rem" : "1.5rem",
                paddingBottom: isNative ? "calc(80px + env(safe-area-inset-bottom, 20px))" : "calc(60px + env(safe-area-inset-bottom, 20px))",
                ...(isNative && isAndroid && {
                  paddingBottom: "calc(100px + env(safe-area-inset-bottom, 30px))",
                  marginBottom: "3.5rem",
                }),

                scrollbarWidth: "thin", // Firefox
                scrollbarColor: "transparent transparent", // Firefox
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "transparent",
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "transparent",
                },
              }}
              ref={chatContainerRef}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              {showScrollToBottom && (
                <Fab
                  size="small"
                  color="primary"
                  aria-label="scroll to bottom"
                  onClick={scrollToBottom}
                  sx={{
                    position: "absolute",
                    bottom: isNative ? "calc(90px + env(safe-area-inset-bottom, 20px))" : "calc(70px + env(safe-area-inset-bottom, 20px))",
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 999,
                    ...(isNative && isAndroid && {
                      bottom: "calc(100px + env(safe-area-inset-bottom, 30px))",
                    }),
                  }}
                >
                  <KeyboardArrowDownIcon />
                </Fab>
              )}

              {messages.map((msg, index) => {
                const isLastUserMsg =
                  msg.sender === "user" && index === lastUserMsgIndex;

                return (
                  <>
                    <Box
                      key={msg.id}
                      sx={{
                        paddingX: "1rem",

                        paddingBottom:
                          index % 2 == 1 && index > 0 ? "20px" : "10px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems:
                          msg.sender === "user" ? "flex-end" : "flex-start",
                        transition: "background 0.3s ease",

                        // '&:hover': {
                        //   background: 'rgba(0, 0, 0, 0.05)', // 👈 Example hover effect
                        //   cursor: 'pointer',               // Optional
                        // },

                        mt: {
                          xs: isNative && index === 0 ? 3 : 0,
                          sm: isNative && index === 0 ? 3 : 0,
                        },
                        px: { xs: 2, sm: 0 },
                        textAlign: msg.sender === "user" ? "right" : "left",
                      }}
                    >
                      {msg.sender === "bot" && (
                        <Box sx={{ mb: 0.5 }}>
                          <img
                            loading="lazy"
                            src="/assets/lisa.svg"
                            alt="bot"
                            width={32}
                            height={32}
                          />
                        </Box>
                      )}
                      {msg.sender === "user" && (
                        <Box
                          sx={{ mb: 0.5 }}
                          ref={isLastUserMsg ? userAvatarRef : undefined}
                        >
                          <Avatar
                            sx={{
                              bgcolor: "primary.main",
                              width: 32,
                              height: 32,
                            }}
                          >
                            <PersonIcon />
                          </Avatar>
                        </Box>
                      )}
                      <Grow in appear timeout={300}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: Number(`${msg.sender == "user" ? "1.5" : 0}`),
                            maxWidth: isSmallScreen ? "100%" : "75%",
                            minWidth: index % 2 == 1 ? "100%" : "0px",
                            backgroundImage: "none",
                            borderRadius: "16px",
                            borderBottomRightRadius: 0,

                            bgcolor:
                              msg.sender === "user" && mode === "light"
                                ? "rgb(211, 227, 255)"
                                : mode === "dark" && msg.sender === "user"
                                ? "rgb(144, 202, 249)"
                                : "transparent",

                            color:
                              mode === "light" || msg.sender === "user"
                                ? "black"
                                : "white",
                          }}
                        >
                          <MessageRenderer
                            message={msg}
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
                          />
                        </Paper>
                      </Grow>
                    </Box>
                    {index % 2 == 1 && (
                      <Box
                        sx={{
                          borderBottom: "1px solid",
                          borderColor: (theme) =>
                            theme.palette.mode === "light"
                              ? "#f7f7f7" // ✅ subtle for white bg
                              : theme.palette.grey[800], // ✅ soft dark gray for dark mode
                          mb: 1,
                        }}
                      ></Box>
                    )}
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
          )}
        </Paper>
        {!isSmallScreen && <DealerList />}
      </Box>

      {/* <div ref={bottomRef} /> */}
    </>
  );
};

export default ChatBox;