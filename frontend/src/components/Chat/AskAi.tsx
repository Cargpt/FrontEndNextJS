"use client";
import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Box,
  Avatar,
  Paper,
  TextField,
  IconButton,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Typography,
  useColorScheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Send,
  Person,
  KeyboardBackspaceSharp,
  Image as ImageIcon,
  PhotoCamera,
  PhotoLibrary,
  AutoAwesome,
} from "@mui/icons-material";

// import { useChats } from "@/Context/ChatContext";
import { useSnackbar } from "@/Context/SnackbarContext";
import { axiosInstance1 } from "@/utils/axiosInstance";
import { useRouter } from "next/navigation";
import { useCookies } from "react-cookie";
import { Button } from "@mui/material";
import { useColorMode } from "@/Context/ColorModeContext";

// interface Message {
//   id: string;
//   message: any;
//   sender: "user" | "bot";
//   timestamp: Date;
//   render?: "carOptions" | "text";
// }

const AskAIChat: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();
  const [cookies, setCookie, removeCookie] = useCookies(["selectedOption"]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      message: "Hi! I am Lisa, your AI car advisor. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { showSnackbar } = useSnackbar();
  const [imageMenuAnchor, setImageMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const isImageMenuOpen = Boolean(imageMenuAnchor);
  const [cameraDialogOpen, setCameraDialogOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const SUGGESTION_POOL: string[] = [
    "Suggest cars under 10 lakh budget",
    "Compare Hyundai Creta vs Kia Seltos",
    "Best mileage petrol cars",
    "Show safest cars with 5-star rating",
    "Low maintenance hatchbacks",
    "SUVs with sunroof under 15 lakh",
    "Which car is best for family of 5?",
    "EV cars with 300km+ range",
    "Best automatic cars for city traffic",
    "Help me choose a car for highway travel",
  ];
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const [quickPrompts, setQuickPrompts] = useState<string[]>([]);
  const quickRowRef = useRef<HTMLDivElement | null>(null);
  const autoScrollPaused = useRef<boolean>(false);
  const [typeaheadPool, setTypeaheadPool] = useState<string[]>(SUGGESTION_POOL);
  const hasCarCard = useMemo(() => {
    return messages.some((m) => (m as any)?.render === "carOptions");
  }, [messages]);

  const uniqueIdCounterRef = useRef<number>(0);
  const generateMessageId = (): string => {
    uniqueIdCounterRef.current += 1;
    // Prefer crypto.randomUUID when available
    try {
      // @ts-ignore
      if (typeof crypto !== "undefined" && crypto?.randomUUID) {
        // @ts-ignore
        return crypto.randomUUID();
      }
    } catch {}
    const counterPart = uniqueIdCounterRef.current;
    const randPart = Math.random().toString(36).slice(2, 8);
    return `${Date.now()}-${counterPart}-${randPart}`;
  };

  const handleBack = () => {
    removeCookie("selectedOption");
    router.push("/");
  };

  const sendMessage = async (textOverride?: string) => {
    const textToSend = (textOverride ?? inputMessage).trim();
    if (!textToSend) return;

    const userMessage: Message = {
      id: generateMessageId(),
      message: textToSend,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textOverride) setInputMessage("");
    setLoading(true);

    try {
      // Call fetchReply to get AI response (plain text)
      const response = await fetchReply(textToSend);
      let reply = "Sorry, I couldn't get a response.";
      if (response && response.data) {
        reply = response.data;
      }
      const botMessage: Message = {
        id: generateMessageId(),
        message: reply,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setLoading(false);
    } catch (error: any) {
      if (error.name === "AbortError") {
        showSnackbar("Request was cancelled.", {
          horizontal: "center",
          vertical: "bottom",
        });
      } else {
        showSnackbar("Failed to get AI response. Please try again.", {
          horizontal: "center",
          vertical: "bottom",
        });
      }
      const botMessage: Message = {
        id: generateMessageId(),
        message:
          "Due to too much traffic on site, we are unable to respond to your query. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);

      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const list = await fetchFaqPrompts();
        if (!mounted) return;
        if (list && list.length) {
          setQuickPrompts(list.slice(0, 12));
          setTypeaheadPool(list);
          return;
        }
      } catch (e) {
        // ignore and fallback
      }
      if (mounted) {
        const picks = [...SUGGESTION_POOL]
          .sort(() => Math.random() - 0.5)
          .slice(0, 8);
        setQuickPrompts(picks);
        setTypeaheadPool(SUGGESTION_POOL);
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const row = quickRowRef.current;
    if (!row) return;
    let direction = 1;
    const stepPx = 160;
    const timer = setInterval(() => {
      if (!quickRowRef.current || autoScrollPaused.current) return;
      const el = quickRowRef.current;
      const maxScroll = el.scrollWidth - el.clientWidth;
      let next = el.scrollLeft + direction * stepPx;
      if (next >= maxScroll) {
        next = maxScroll;
        direction = -1;
      } else if (next <= 0) {
        next = 0;
        direction = 1;
      }
      el.scrollTo({ left: next, behavior: "smooth" });
    }, 3000);
    return () => clearInterval(timer);
  }, [quickPrompts.length]);

  const handleQuickPromptClick = (prompt: string) => {
    setShowSuggestions(false);
    setHighlightIndex(-1);
    sendMessage(prompt);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (showSuggestions) return;
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  // Scroll to last message with sticky header offset (same as OptionsCard)
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
      // Offset for sticky header (height 64px + buffer)
      setTimeout(() => {
        if (bottomRef.current) {
          const rect = bottomRef.current.getBoundingClientRect();
          const scrollY = window.scrollY + rect.top - 80;
          window.scrollTo({ top: scrollY, behavior: "smooth" });
        }
      }, 350);
    }
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  //  Lisa risponse
  const fetchReply = async (input: string) => {
    // Ensure plain text response is returned
    const response = await axiosInstance1.post(`/api/cargpt/ai-response/`, {
      input: encodeURIComponent(input),
    });
    // If response is plain text, wrap it as { data: response }
    if (typeof response === "string") {
      return { data: response };
    }
    return response;
  };

  const { mode } = useColorMode();
  console.log(mode);

  const getTokenFromCookies = () => {
    const name = "token=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies = decodedCookie.split(";");
    for (let cookie of cookies) {
      const trimmed = cookie.trim();
      if (trimmed.startsWith(name)) {
        return trimmed.substring(name.length);
      }
    }
    return null;
  };
  const normalizeQuestions = (data: any): string[] => {
    if (!data) return [];
    if (Array.isArray(data)) {
      if (data.length === 0) return [];
      if (typeof data[0] === "string") return data as string[];
      return (data as any[])
        .map((d) => d?.question ?? d?.title ?? d?.text ?? d?.name)
        .filter(Boolean) as string[];
    }
    const arrays = [data?.results, data?.data, data?.questions, data?.items];
    for (const arr of arrays) {
      if (Array.isArray(arr)) return normalizeQuestions(arr);
    }
    if (typeof data === "string") {
      return data
        .split(/\r?\n+/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  const fetchFaqPrompts = async (): Promise<string[]> => {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://ec2-3-110-170-230.ap-south-1.compute.amazonaws.com";
    const url = `${baseUrl}/api/cargpt/faqs/questions/`;
    const token = getTokenFromCookies();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(url, {
      method: "GET",
      headers,
      redirect: "follow" as any,
    });
    if (!res.ok) throw new Error(`Failed to fetch FAQs (${res.status})`);
    const contentType = res.headers.get("content-type") || "";
    let data: any;
    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }
    return normalizeQuestions(data);
  };
  // Hint mobile browsers to open camera first; users can still choose gallery within camera UI
  const isMobileDevice =
    typeof window !== "undefined" &&
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const handleUploadClick = (event: React.MouseEvent<HTMLElement>) => {
    if (isMobileDevice) {
      setImageMenuAnchor(event.currentTarget as HTMLElement);
    } else {
      // Desktop web: open gallery directly
      galleryInputRef.current?.click();
    }
  };

  const handleCloseImageMenu = () => setImageMenuAnchor(null);
  const handleChooseCamera = async () => {
    handleCloseImageMenu();
    if (isMobileDevice) {
      cameraInputRef.current?.click();
      return;
    }
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        // @ts-ignore - srcObject exists on HTMLVideoElement
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraDialogOpen(true);
    } catch (err: any) {
      setCameraError(err?.message || "Unable to access camera");
      // Fallback to file input if camera not available
      galleryInputRef.current?.click();
    }
  };
  const handleChooseGallery = () => {
    handleCloseImageMenu();
    galleryInputRef.current?.click();
  };

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const handleCloseCameraDialog = () => {
    stopCameraStream();
    setCameraDialogOpen(false);
  };

  const captureFromCamera = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) return;
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);
    canvas.toBlob(
      async (blob) => {
        if (!blob) return;
        const file = new File([blob], `camera_capture_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        await uploadFile(file);
        handleCloseCameraDialog();
      },
      "image/jpeg",
      0.92
    );
  };

  const uploadFile = async (file: File) => {
    const userMessage: Message = {
      id: generateMessageId(),
      message: `Sent an image: ${file.name}`,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("car_image", file);

      const token = getTokenFromCookies();
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const url = `${baseUrl}/api/cargpt/ai-response/`;

      const response = await fetch(url, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
        mode: "cors",
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        const message = errText || response.statusText || "Unknown error";
        throw new Error(`Upload failed (${response.status}): ${message}`);
      }

      const contentType = response.headers.get("content-type") || "";
      let replyText = "";
      let jsonData: any = null;
      if (contentType.includes("application/json")) {
        try {
          jsonData = await response.json();
        } catch (e) {
          replyText = await response.text();
        }
      } else {
        replyText = await response.text();
      }

      // If API returned JSON that looks like car data, render a card inside Ask AI chat
      let renderedCard = false;
      if (jsonData) {
        const candidates = Array.isArray(jsonData)
          ? jsonData
          : Array.isArray(jsonData?.data)
          ? jsonData.data
          : jsonData?.result && Array.isArray(jsonData.result)
          ? jsonData.result
          : jsonData?.cars && Array.isArray(jsonData.cars)
          ? jsonData.cars
          : null;

        if (candidates && candidates.length) {
          const keyName =
            candidates?.[0]?.ModelName ||
            candidates?.[0]?.VariantName ||
            "matched";
          const selectedItem: Record<string, any[]> = {
            [String(keyName)]: candidates,
          };
          const identifiedTitle = [
            candidates?.[0]?.BrandName,
            candidates?.[0]?.ModelName,
            candidates?.[0]?.VariantName,
          ]
            .filter(Boolean)
            .join(" ");

          // Optional: include model's own summary text if present
          const messagesToAdd: Message[] = [];

          if (replyText && replyText.trim()) {
            messagesToAdd.push({
              id: generateMessageId(),
              message: replyText.trim(),
              sender: "bot",
              timestamp: new Date(),
            });
          }

          const textMessage: Message = {
            id: generateMessageId(),
            message: identifiedTitle
              ? `This looks like ${identifiedTitle}. Here are the matching variants:`
              : "Here are the cars that match your image:",
            sender: "bot",
            timestamp: new Date(),
          };
          messagesToAdd.push(textMessage);

          const cardMessage: Message = {
            id: generateMessageId(),
            message: selectedItem,
            render: "carOptions",
            sender: "bot",
            timestamp: new Date(),
          };
          messagesToAdd.push(cardMessage);

          setMessages((prev) => [...prev, ...messagesToAdd]);
          renderedCard = true;
        }
      }

      if (!renderedCard) {
        const botMessage: Message = {
          id: generateMessageId(),
          message:
            replyText ||
            (jsonData
              ? JSON.stringify(jsonData)
              : "Sorry, I couldn't get a response."),
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error: any) {
      console.error("Image upload failed:", error);
      showSnackbar(`Failed to upload image. ${error?.message ?? ""}`.trim(), {
        horizontal: "center",
        vertical: "bottom",
      });
      const botMessage: Message = {
        id: generateMessageId(),
        message: `Unable to process the image right now. ${
          error?.message ?? ""
        }`.trim(),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (
    e
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const updateSuggestions = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      setHighlightIndex(-1);
      return;
    }
    const lower = trimmed.toLowerCase();
    const results = typeaheadPool
      .filter((s) => s.toLowerCase().includes(lower))
      .slice(0, 6);
    setFilteredSuggestions(results);
    setShowSuggestions(results.length > 0);
    setHighlightIndex(results.length ? 0 : -1);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setInputMessage(value);
    updateSuggestions(value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    setShowSuggestions(false);
    setHighlightIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % filteredSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex(
        (prev) =>
          (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length
      );
    } else if (e.key === "Enter") {
      if (highlightIndex >= 0) {
        e.preventDefault();
        const chosen = filteredSuggestions[highlightIndex];
        handleSuggestionClick(chosen);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: isSmallScreen ? "100vw" : "90%",
        maxWidth: "800px",
        height: "calc(100vh - 100px)",
        borderRadius: 3,
        overflow: "hidden",
        mx: "auto",
        overflowX: "clip",
        bgcolor: mode === "dark" ? "#232323" : "#ffffff", // Use dark background in dark mode
      }}
    >
      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "clip",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          minWidth: 0,
          bgcolor: mode === "dark" ? "#232323" : "#ffffff", // Use #232323 for dark mode
        }}
      >
        {messages.map((message, index) => {
          const showAvatar =
            index === 0 ||
            (messages[index - 1] &&
              messages[index - 1].sender !== message.sender);
          const isCard = (message as any)?.render === "carOptions";
          const isFullWidthText =
            message.sender === "bot" &&
            !isCard &&
            ((messages[index + 1] &&
              (messages[index + 1] as any)?.render === "carOptions") ||
              (messages[index + 2] &&
                (messages[index + 2] as any)?.render === "carOptions"));
          const showTimestamp = isCard || !isFullWidthText;
          return (
            <Box
              key={message.id}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems:
                  message.sender === "user" ? "flex-end" : "flex-start",
                width: "100%",
              }}
            >
              {/* Avatar on top */}
              {showAvatar && (
                <Box sx={{ mb: 1 }}>
                  {message.sender === "bot" ? (
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: "transparent",
                      }}
                      onMouseEnter={() => {
                        autoScrollPaused.current = true;
                      }}
                      onMouseLeave={() => {
                        autoScrollPaused.current = false;
                      }}
                      onTouchStart={() => {
                        autoScrollPaused.current = true;
                      }}
                      onTouchEnd={() => {
                        autoScrollPaused.current = false;
                      }}
                    >
                      <img
                        loading="lazy"
                        src="/assets/lisa.svg"
                        alt="Lisa"
                        width={32}
                        height={32}
                      />
                    </Avatar>
                  ) : (
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: "primary.main",
                        color: "white",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        border: "2px solid white",
                      }}
                    >
                      <Person sx={{ fontSize: "1.2rem" }} />
                    </Avatar>
                  )}
                </Box>
              )}

              {/* Message Bubble */}
              <Box
                sx={{
                  maxWidth:
                    isCard || isFullWidthText
                      ? "100%"
                      : {
                          xs: "90%",
                          sm: "60%",
                        },
                  width: isCard || isFullWidthText ? "100%" : undefined,
                  alignSelf:
                    message.sender === "user" ? "flex-end" : "flex-start",
                }}
              >
                <Paper
                  sx={{
                    p: isCard || isFullWidthText ? 0 : 2,
                    bgcolor: isCard
                      ? mode === "dark"
                        ? "#232323"
                        : "#ffffff"
                      : isFullWidthText
                      ? "transparent"
                      : message.sender === "user"
                      ? mode == "dark"
                        ? "#232323"
                        : "rgb(211, 227, 255)"
                      : mode === "dark"
                      ? "#232323"
                      : "#F5F5F5",
                    borderRadius: isCard
                      ? 1
                      : isFullWidthText
                      ? 0
                      : message.sender === "user"
                      ? "18px 18px 4px 18px"
                      : "18px 18px 18px 4px",
                    wordBreak: "break-word",
                    boxShadow:
                      isCard || isFullWidthText
                        ? "none"
                        : "0 2px 8px rgba(24, 118, 210, 0.10)",
                    position: "relative",
                  }}
                >
                  {message.sender === "bot" ? (
                    message.render === "carOptions" &&
                    message.message &&
                    typeof message.message === "object" ? (
                      <div>
                        {/* Embed car cards inside Ask AI bubble as an iframe-like block */}
                        {/* Keep Paper container; cards component handles its own layout */}
                        {/* We reuse the existing Cards component by lazy requiring to avoid circular deps */}
                        {(() => {
                          const TeslaCard =
                            require("./Model/Cards/Car").default;
                          return (
                            <Box
                              sx={{ width: "100%", backgroundColor: "#ffffff" }}
                            >
                              <TeslaCard
                                selectedItem={message.message}
                                onClick={() => {}}
                                handleNeedAdviceSupport={() => {}}
                                variant="compact"
                              />
                            </Box>
                          );
                        })()}
                      </div>
                    ) : (
                      <Typography
                        variant="body2"
                        component="div"
                        sx={{
                          fontSize: { xs: "13px", sm: "14px" },
                          lineHeight: "1.4",
                          fontWeight: 400,
                        }}
                        dangerouslySetInnerHTML={{
                          __html: String(message.message)
                            .replace(/\*\*(.*?)\*\*/g, `<b>$1</b>`)
                            .replace(
                              /\* (.*?)\n/g,
                              `<div style="display:flex;align-items:flex-start;gap:6px;margin-top:10px;margin-bottom:5px;flex-wrap:wrap;word-break:break-word;">
                       <span style="color:#1876d2;font-size:16px;line-height:1;">👉</span>
                       <span style="flex:1;min-width:0;">$1</span>
                     </div>`
                            ),
                        }}
                      />
                    )
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "14px",
                        lineHeight: "1.4",
                        fontWeight: 400,
                      }}
                    >
                      {String(message.message)}
                    </Typography>
                  )}
                </Paper>
                {showTimestamp && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      mt: 0.5,
                      fontSize: "0.75rem",
                    }}
                  >
                    {message.timestamp ?formatTime(message.timestamp) : ""}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}

        {loading && (
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1,
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: "transparent",
              }}
            >
              <img
                loading="lazy"
                src="/assets/lisa.svg"
                alt="Lisa"
                width={32}
                height={32}
              />
            </Avatar>
            <Paper
              sx={{
                p: 2,
                bgcolor: mode == "dark" ? "transparent" : "#F5F5F5",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {/* <CircularProgress size={16} /> */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    px: 2,
                    py: 1,

                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    background: mode == "dark" ? "transparent" : "#F5F5F5",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      m: 0,
                      fontWeight: 500,
                      background: mode == "dark" ? "" : "#F5F5F5",
                    }}
                  >
                    Lisa is typing
                  </Typography>
                  <div className="loader"></div>
                </Box>
              </Box>
            </Paper>
          </Box>
        )}
        <div ref={bottomRef} />
      </Box>
      {/* Input Area */}
      <Box
        sx={{
          p: 3,
          borderTop: "1px solid #f0f0f0",
          bgcolor: mode === "dark" ? "#000" : "#ffffff", // Black in dark mode
          mb: isSmallScreen ? 0 : 2,
          minWidth: 0,
          boxShadow: "none", // Remove any shadow that could cause a black box effect
        }}
      >
        {/* Quick prompts row */}
        {!showSuggestions &&
          quickPrompts.length > 0 &&
          (!hasCarCard || inputMessage.length > 0) && (
            <Box
              ref={quickRowRef}
              sx={{
                display: "flex",
                flexWrap: "nowrap",
                overflowX: "auto",
                gap: 1,
                mb: 1.5,
                px: 0.5,
                whiteSpace: "nowrap",
                scrollBehavior: "smooth",
                WebkitOverflowScrolling: "touch",
                msOverflowStyle: "none",
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
                bgcolor: mode === "dark" ? "#232323" : undefined, // Match dark background
              }}
            >
              {quickPrompts.map((p) => (
                <Button
                  key={p}
                  onClick={() => handleQuickPromptClick(p)}
                  disabled={loading}
                  variant="contained"
                  size="small"
                  startIcon={<AutoAwesome sx={{ fontSize: 16 }} />}
                  sx={{
                    flex: "0 0 auto",
                    borderRadius: 999,
                    textTransform: "none",
                    px: 1.8,
                    py: 0.8,
                    bgcolor: "background.paper",
                    color: "text.primary",
                    boxShadow: "0 2px 10px rgba(24,118,210,0.15)",
                    border: "1px solid rgba(24,118,210,0.25)",
                    "&:hover": {
                      background:
                        "linear-gradient(90deg, #D0E7FC 0%, #A8D0FA 100%)",
                    },
                  }}
                >
                  {p}
                </Button>
              ))}
            </Box>
          )}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <Box
            sx={{
              mb: 1,
              mx: 0.5,
              borderRadius: 1,
              boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
              overflow: "auto",
              maxHeight: 168,
              bgcolor: "background.paper",
            }}
          >
            {filteredSuggestions.map((s, idx) => (
              <Box
                key={s}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSuggestionClick(s)}
                sx={{
                  px: 1.5,
                  py: 1.25,
                  cursor: "pointer",
                  bgcolor:
                    idx === highlightIndex ? "action.selected" : "transparent",
                  "&:hover": { bgcolor: "action.hover" },
                  fontSize: "14px",
                  minHeight: 48,
                }}
              >
                {s}
              </Box>
            ))}
          </Box>
        )}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            position: "relative",
            overflow: "visible",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <TextField
            fullWidth
            multiline
            maxRows={3}
            value={inputMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            variant="outlined"
            size="small"
            disabled={loading}
            sx={{
              pr: 0,
              "& .MuiOutlinedInput-root": {
                borderRadius: 999,
                bgcolor: mode === "dark" ? "#232323" : "#f5f5f5",
                border: "none",
                transition: "all 0.2s ease",
                "& fieldset": {
                  border: "none",
                },
                "&:hover": {
                  bgcolor: mode === "dark" ? "#232323" : "#eeeeee",
                },
                "&.Mui-focused": {
                  bgcolor: mode === "dark" ? "#232323" : "white",
                  boxShadow: "none",
                },
                "&.Mui-focused fieldset": {
                  border: `2px solid ${mode === "dark" ? "none" : "#1876d2"}`,
                },
              },
              "& .MuiInputBase-input": {
                padding: {
                  xs: "8px 10px",
                  sm: "10px 14px",
                },
                fontSize: "16px",
                lineHeight: "1.4",
                color: mode === "dark" ? "#fff" : "#000",
                "&::placeholder": {
                  color: mode === "dark" ? "#aaa" : "#9e9e9e",
                  opacity: 1,
                },
              },
            }}
            InputProps={{
              endAdornment: (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    position: "relative",
                    flexShrink: 0,
                  }}
                >
                  <IconButton
                    onClick={handleUploadClick}
                    disabled={loading}
                    sx={{
                      bgcolor: mode === "dark" ? "#2c2c2c" : "#eeeeee",
                      color: mode === "dark" ? "#fff" : "#000",
                      width: { xs: 32, sm: 38 },
                      height: { xs: 32, sm: 38 },
                      borderRadius: "50%",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: mode === "dark" ? "#3a3a3a" : "#e0e0e0",
                        transform: {
                          xs: "none",
                          sm: "scale(1.05)",
                        },
                      },
                      "&:disabled": {
                        bgcolor: "#e0e0e0",
                        color: "#9e9e9e",
                      },
                    }}
                  >
                    <ImageIcon fontSize="small" />
                  </IconButton>

                  {isMobileDevice && (
                    <Menu
                      anchorEl={imageMenuAnchor}
                      open={isImageMenuOpen}
                      onClose={handleCloseImageMenu}
                      keepMounted
                    >
                      <MenuItem onClick={handleChooseCamera} disabled={loading}>
                        <ListItemIcon>
                          <PhotoCamera fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Open Camera</ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={handleChooseGallery}
                        disabled={loading}
                      >
                        <ListItemIcon>
                          <PhotoLibrary fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Open Gallery</ListItemText>
                      </MenuItem>
                    </Menu>
                  )}

                  <IconButton
                    onClick={(e) => {
                      e.preventDefault(); // optional: prevents form submission if inside a form
                      sendMessage();
                    }}
                    disabled={!inputMessage.trim() || loading}
                    sx={{
                      bgcolor: "#1876d2",
                      color: "white",
                      width: { xs: 32, sm: 38 },
                      height: { xs: 32, sm: 38 },
                      borderRadius: "50%",
                      transition: "all 0.2s ease",
                      boxShadow: "0 2px 8px rgba(24, 118, 210, 0.3)",
                      "&:hover": {
                        bgcolor: "#1565c0",
                        transform: {
                          xs: "none",
                          sm: "scale(1.05)",
                        },
                      },
                      "&:disabled": {
                        bgcolor: "#e0e0e0",
                        color: "#9e9e9e",
                      },
                    }}
                  >
                    <Send fontSize="small" />
                  </IconButton>
                </Box>
              ),
            }}
          />
        </Box>
      </Box>
      {/* Hidden inputs for camera and gallery */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture={isMobileDevice ? "environment" : undefined}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      {/* Desktop camera dialog */}
      <Dialog
        open={cameraDialogOpen}
        onClose={handleCloseCameraDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Take a photo</DialogTitle>
        <DialogContent>
          {cameraError ? (
            <Typography color="error" variant="body2">
              {cameraError}
            </Typography>
          ) : (
            <Box sx={{ position: "relative", width: "100%" }}>
              <video
                ref={videoRef}
                style={{ width: "100%", borderRadius: 8 }}
                playsInline
                muted
              />
              <canvas ref={canvasRef} style={{ display: "none" }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCameraDialog}>Cancel</Button>
          <Button
            onClick={captureFromCamera}
            variant="contained"
            startIcon={<PhotoCamera />}
          >
            Capture
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AskAIChat;
