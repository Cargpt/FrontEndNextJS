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
} from "@mui/material";
import { Send, Person, KeyboardBackspaceSharp } from "@mui/icons-material";
import Image from "next/image";
import bot from "../../../public/assets/lisa.svg";
import { useChats } from "@/Context/ChatContext";
import { useSnackbar } from "@/Context/SnackbarContext";
import { axiosInstance1 } from "@/utils/axiosInstance";
import { useRouter } from "next/navigation";
import { useCookies } from "react-cookie";
import { Button } from "@mui/material";

interface Message {
  id: string;
  message: string;
  sender: "user" | "bot";
  timestamp: Date;
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
      // Simulate AI response - replace with actual API call
      setTimeout(() => {
        const botMessage: Message = {
          id: String(Date.now() + 1),
          message: `I understand you're asking about "${inputMessage}". Let me help you with that. This is a simulated response - you can integrate with your actual AI service here.`,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setLoading(false);
      }, 1500);

      // Uncomment and modify this for actual API integration:
      // const response = await axiosInstance1.post("/api/ai/chat", {
      //   message: inputMessage,
      //   context: "car_advisor"
      // });
      // const botMessage: Message = {
      //   id: String(Date.now() + 1),
      //   message: response.data.reply,
      //   sender: "bot",
      //   timestamp: new Date(),
      // };
      // setMessages((prev) => [...prev, botMessage]);
      // setLoading(false);

    } catch (error) {
      showSnackbar("Failed to get AI response. Please try again.", {
        horizontal: "center",
        vertical: "bottom",
      });
      setLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: isSmallScreen ? "100%" : "90%",
        maxWidth: "800px",
        height: "calc(100vh - 100px)",
        bgcolor: "white",
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      }}
    >
      
      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: message.sender === "user" ? "flex-end" : "flex-start",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
                maxWidth: "80%",
              }}
            >
              {message.sender === "bot" && (
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "transparent",
                  }}
                >
                  <Image src={bot} alt="Lisa" width={32} height={32} />
                </Avatar>
              )}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: message.sender === "user" ? "flex-end" : "flex-start",
                }}
              >
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: "#f5f5f5",
                    color: "black",
                    borderRadius: message.sender === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    maxWidth: "100%",
                    wordBreak: "break-word",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    position: "relative",
                    "&::after": message.sender === "user" ? {
                      content: '""',
                      position: "absolute",
                      right: "-8px",
                      bottom: "8px",
                      width: 0,
                      height: 0,
                      borderLeft: "8px solid #f5f5f5",
                      borderTop: "8px solid transparent",
                      borderBottom: "8px solid transparent",
                    } : {
                      content: '""',
                      position: "absolute",
                      left: "-8px",
                      bottom: "8px",
                      width: 0,
                      height: 0,
                      borderRight: "8px solid #f5f5f5",
                      borderTop: "8px solid transparent",
                      borderBottom: "8px solid transparent",
                    }
                  }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: "14px",
                      lineHeight: "1.4",
                      fontWeight: 400,
                    }}
                  >
                    {message.message}
                  </Typography>
                </Paper>
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
              </Box>
              {message.sender === "user" && (
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: "primary.main",
                    color: "",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    border: "2px solid white",
                  }}
                >
                  <Person sx={{ fontSize: "1.2rem" }} />
                </Avatar>
              )}
            </Box>
          </Box>
        ))}
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
              <Image src={bot} alt="Lisa" width={32} height={32} />
            </Avatar>
            <Paper
              sx={{
                p: 2,
                bgcolor: "#f5f5f5",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">
                Lisa is typing...
              </Typography>
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
          bgcolor: "white",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "flex-end",
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
              "& .MuiOutlinedInput-root": {
                borderRadius: 4,
                bgcolor: "#f5f5f5",
                border: "none",
                transition: "all 0.2s ease",
                "& fieldset": {
                  border: "none",
                },
                "&:hover": {
                  bgcolor: "#eeeeee",
                  transform: "translateY(-1px)",
                },
                "&.Mui-focused": {
                  bgcolor: "white",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  transform: "translateY(-2px)",
                },
                "&.Mui-focused fieldset": {
                  border: "2px solid #1876d2",
                },
              },
              "& .MuiInputBase-input": {
                padding: "10px 14px",
                fontSize: "13px",
                lineHeight: "1.4",
                "&::placeholder": {
                  color: "#9e9e9e",
                  opacity: 1,
                },
              },
              "& .MuiInputBase-root": {
                "&:has(input:focus)": {
                  bgcolor: "white",
                },
              },
            }}
          />
          <IconButton
            onClick={sendMessage}
            disabled={!inputMessage.trim() || loading}
            sx={{
              bgcolor: "#1876d2",
              color: "white",
              width: 38,
              height: 38,
              borderRadius: "50%",
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
      </Box>
    </Box>
  );
};

export default AskAIChat; 