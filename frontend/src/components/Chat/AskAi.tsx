"use client";
import React, { useEffect, useRef, useState } from "react";
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
} from "@mui/material";
import { Send, Person, KeyboardBackspaceSharp, Image as ImageIcon } from "@mui/icons-material";

// import { useChats } from "@/Context/ChatContext";
import { useSnackbar } from "@/Context/SnackbarContext";
import { axiosInstance1 } from "@/utils/axiosInstance";
import { useRouter } from "next/navigation";
import { useCookies } from "react-cookie";
import { Button } from "@mui/material";
import { useColorMode } from "@/Context/ColorModeContext";

interface Message {
  id: string;
  message: any;
  sender: "user" | "bot";
  timestamp: Date;
  render?: "carOptions" | "text";
}

const AskAIChat: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();
  const [cookies, setCookie, removeCookie] = useCookies(['selectedOption']);
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
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { showSnackbar } = useSnackbar();

  const handleBack = () => {
    removeCookie('selectedOption');
    router.push('/');
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: String(Date.now()),
      message: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setLoading(true);

    try {
      // Call fetchReply to get AI response (plain text)
      const response = await fetchReply(inputMessage);
      let reply = "Sorry, I couldn't get a response.";
      if (response && response.data) {
        reply = response.data;
      }
      const botMessage: Message = {
        id: String(Date.now() + 1),
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
        id: String(Date.now() + 1),
        message: "Due to too much traffic on site, we are unable to respond to your query. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
      };
            setMessages((prev) => [...prev, botMessage]);

      setLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
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
    const response = await axiosInstance1.post(`/api/cargpt/ai-response/`, { input: encodeURIComponent(input) });
    // If response is plain text, wrap it as { data: response }
    if (typeof response === "string") {
      return { data: response };
    }
    return response;
  }

  const {mode}=useColorMode()
  console.log(mode)

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
  // Hint mobile browsers to open camera first; users can still choose gallery within camera UI
  const isMobileDevice = typeof window !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const userMessage: Message = {
      id: String(Date.now()),
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
          const keyName = candidates?.[0]?.ModelName || candidates?.[0]?.VariantName || "matched";
          const selectedItem: Record<string, any[]> = { [String(keyName)]: candidates };
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
              id: String(Date.now() + 1),
              message: replyText.trim(),
              sender: "bot",
              timestamp: new Date(),
            });
          }

          const textMessage: Message = {
            id: String(Date.now() + 2),
            message:
              identifiedTitle
                ? `This looks like ${identifiedTitle}. Here are the matching variants:`
                : "Here are the cars that match your image:",
            sender: "bot",
            timestamp: new Date(),
          };
          messagesToAdd.push(textMessage);

          const cardMessage: Message = {
            id: String(Date.now() + 2),
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
          id: String(Date.now() + 1),
          message: replyText || (jsonData ? JSON.stringify(jsonData) : "Sorry, I couldn't get a response."),
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error:any) {
      console.error("Image upload failed:", error);
      showSnackbar(`Failed to upload image. ${error?.message ?? ""}`.trim(), {
        horizontal: "center",
        vertical: "bottom",
      });
      const botMessage: Message = {
        id: String(Date.now() + 1),
        message:
          `Unable to process the image right now. ${error?.message ?? ""}`.trim(),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
        bgcolor: "#ffffff", // Force white background for Ask AI container
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
          bgcolor: "#ffffff", // Ensure message area background remains white
        }}
      >
       {messages.map((message, index) => {
  const showAvatar = index === 0 || (messages[index - 1] && messages[index - 1].sender !== message.sender);
  const isCard = (message as any)?.render === "carOptions";
  const isFullWidthText =
    message.sender === "bot" && !isCard && (
      (messages[index + 1] && (messages[index + 1] as any)?.render === "carOptions") ||
      (messages[index + 2] && (messages[index + 2] as any)?.render === "carOptions")
    );
  const showTimestamp = isCard || !isFullWidthText;
  return (
  <Box
    key={message.id}
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: message.sender === "user" ? "flex-end" : "flex-start",
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
          >
            <img loading="lazy" src="/assets/lisa.svg" alt="Lisa" width={32} height={32} />
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
        maxWidth: (isCard || isFullWidthText)
          ? "100%"
          : {
              xs: "90%",
              sm: "60%",
            },
        width: (isCard || isFullWidthText) ? "100%" : undefined,
        alignSelf: message.sender === "user" ? "flex-end" : "flex-start",
      }}
    >
      <Paper
        sx={{
          p: (isCard || isFullWidthText) ? 0 : 2,
          bgcolor: isCard
            ? "#ffffff"
            : (isFullWidthText
              ? "transparent"
              : (message.sender === "user"
                ? (mode=="dark"? "rgba(82, 139, 237, 1)":  "rgb(211, 227, 255)")
                : (mode==="dark"? "" : "#F5F5F5"))),
          borderRadius: isCard
            ? 1
            : ((isFullWidthText)
              ? 0
              : (message.sender === "user"
                ? "18px 18px 4px 18px"
                : "18px 18px 18px 4px")),
          wordBreak: "break-word",
          boxShadow: (isCard || isFullWidthText) ? "none" : "0 2px 8px rgba(24, 118, 210, 0.10)",
          position: "relative",
        }}
      >
        {message.sender === "bot" ? (
          message.render === "carOptions" && message.message && typeof message.message === "object" ? (
            <div>
              {/* Embed car cards inside Ask AI bubble as an iframe-like block */}
              {/* Keep Paper container; cards component handles its own layout */}
              {/* We reuse the existing Cards component by lazy requiring to avoid circular deps */}
              {(() => {
                const TeslaCard = require("./Model/Cards/Car").default;
                return (
                  <Box sx={{ width: '100%', backgroundColor: '#ffffff' }}>
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
          <Typography variant="body2" sx={{ fontSize: "14px", lineHeight: "1.4", fontWeight: 400 }}>
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
          {formatTime(message.timestamp)}
        </Typography>
      )}
    </Box>
  </Box>
)})}

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
              <img loading="lazy" src="/assets/lisa.svg" alt="Lisa" width={32} height={32} />
            </Avatar>
            <Paper
              sx={{
                p: 2,
                bgcolor: mode=="dark"? "transparent": "#F5F5F5",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >

              {/* <CircularProgress size={16} /> */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  px: 2,
                  py: 1,
                
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  background: mode=="dark"? "transparent": "#F5F5F5",
                }}>
                  <Typography variant="body2" sx={{ m: 0, fontWeight: 500, background:mode=="dark"? "": "#F5F5F5" }} >
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
          borderTop:  "1px solid #f0f0f0",
          bgcolor:  "#ffffff", // Force white background for input area as well
          mb: isSmallScreen ? 5 : 2,
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            position: "relative",
            minWidth: 0,
            overflow: "visible", // ✅ Fix overflow on input focus
          }}
        >
          <TextField
        fullWidth
        multiline
        maxRows={3}
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your message..."
        variant="outlined"
        size="small"
        disabled={loading}
        sx={{
          pr: 0,
          minWidth: 0,
          "& .MuiOutlinedInput-root": {
            borderRadius: 4,
            bgcolor: mode === "dark" ? "#2c2c2c" : "#f5f5f5",
            border: "none",
            transition: "all 0.2s ease",
            minWidth: 0,
            maxWidth: "100%",
            "& fieldset": {
              border: "none",
            },
            "&:hover": {
              bgcolor: mode === "dark" ? "#3a3a3a" : "#eeeeee",
            },
            "&.Mui-focused": {
              bgcolor: mode === "dark" ? "#1e1e1e" : "white",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
            },
            "&.Mui-focused fieldset": {
              border: `2px solid ${mode === "dark" ? "#90caf9" : "#1876d2"}`,
            },
          },
          "& .MuiInputBase-input": {
            padding: "10px 14px",
            fontSize: "16px",
            lineHeight: "1.4",
            minWidth: 0,
            color: mode === "dark" ? "#fff" : "#000",
            "&::placeholder": {
              color: mode === "dark" ? "#aaa" : "#9e9e9e",
              opacity: 1,
            },
          },
          "& .MuiInputBase-root": {
            minWidth: 0,
            "&:has(input:focus)": {
              bgcolor: mode === "dark" ? "#1e1e1e" : "white",
            },
          },
        }}
        InputProps={{
          endAdornment: (
            <Box sx={{ display: "flex", alignItems: "flex-end", minWidth: 0 }}>
              <IconButton
                onClick={handleUploadClick}
                disabled={loading}
                sx={{
                  bgcolor: mode === "dark" ? "#2c2c2c" : "#eeeeee",
                  color: mode === "dark" ? "#fff" : "#000",
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  mr: 1,
                  "&:hover": {
                    bgcolor: mode === "dark" ? "#3a3a3a" : "#e0e0e0",
                    transform: "scale(1.05)",
                  },
                  "&:disabled": {
                    bgcolor: "#e0e0e0",
                    color: "#9e9e9e",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <ImageIcon />
              </IconButton>
              <IconButton
                onClick={sendMessage}
                disabled={!inputMessage.trim() || loading}
                sx={{
                  bgcolor: "#1876d2",
                  color: "white",
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  ml: 1,
                  "&:hover": {
                    bgcolor: "#1565c0",
                    transform: "scale(1.05)",
                  },
                  "&:disabled": {
                    bgcolor: "#e0e0e0",
                    color: "#9e9e9e",
                  },
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 8px rgba(24, 118, 210, 0.3)",
                }}
              >
                <Send />
              </IconButton>
            </Box>
          ),
        }}
      />

        </Box>
      </Box>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture={isMobileDevice ? "environment" : undefined}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </Box>
  );
};

export default AskAIChat; 