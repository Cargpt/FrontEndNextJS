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

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: isSmallScreen ? "100vw" : "90%",
        maxWidth: "800px",
        height: "calc(100vh - 100px)",
        bgcolor: "white",
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        mx: "auto",
        overflowX: "clip",
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
        }}
      >
       {messages.map((message) => (
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
    <Box sx={{ mb: 0.5 }}>
      {message.sender === "bot" ? (
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: "transparent",
          }}
        >
          <Image src={bot} alt="Lisa" width={32} height={32} />
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

    {/* Message Bubble */}
    <Box
      sx={{
        maxWidth: {
          xs: "80%", // 👈 80% width on small screens
          sm: "60%", // 👈 narrower on medium/large
        },
        alignSelf: message.sender === "user" ? "flex-end" : "flex-start",
      }}
    >
      <Paper
        sx={{
          p: 2,
          bgcolor: message.sender === "user" ? "#e3f2fd" : "#bbdefb", // light blue for user, slightly deeper light blue for bot
          color: "#1565c0",
          borderRadius:
            message.sender === "user"
              ? "18px 18px 4px 18px"
              : "18px 18px 18px 4px",
          wordBreak: "break-word",
          boxShadow: "0 2px 8px rgba(24, 118, 210, 0.10)",
          position: "relative",
        }}
      >
        {message.sender === "bot" ? (
          <Typography
            variant="body2"
            sx={{ fontSize: "14px", lineHeight: "1.4", fontWeight: 400 }}
            component="div"
            dangerouslySetInnerHTML={{
              __html: message.message
                .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
                .replace(/\* (.*?)\n/g, '<span style="display:flex;align-items:center;margin-bottom:2px;"><span style="color:#1876d2;font-size:16px;margin-right:6px;">&#128073;</span>$1</span>')
                .replace(/\n/g, "<br/>")
            }}
          />
        ) : (
          <Typography
            variant="body2"
            sx={{ fontSize: "14px", lineHeight: "1.4", fontWeight: 400 }}
          >
            {message.message}
          </Typography>
        )}
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
                bgcolor: "#bbdefb",
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
                  bgcolor: '#bbdefb',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}>
                  <Typography variant="body2" sx={{ m: 0, color: '#1565c0', fontWeight: 500 }}>
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
    bgcolor: "white",
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
          bgcolor: "#f5f5f5",
          border: "none",
          transition: "all 0.2s ease",
          minWidth: 0,
          maxWidth: "100%",
          "& fieldset": {
            border: "none",
          },
          "&:hover": {
            bgcolor: "#eeeeee",
            // Removed transform to prevent overflow
          },
          "&.Mui-focused": {
            bgcolor: "white",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            // Removed transform to prevent overflow
          },
          "&.Mui-focused fieldset": {
            border: "2px solid #1876d2",
          },
        },
        "& .MuiInputBase-input": {
          padding: "10px 14px",
          fontSize: "16px", // Prevent mobile zoom
          lineHeight: "1.4",
          minWidth: 0,
          "&::placeholder": {
            color: "#9e9e9e",
            opacity: 1,
          },
        },
        "& .MuiInputBase-root": {
          minWidth: 0,
          "&:has(input:focus)": {
            bgcolor: "white",
          },
        },
      }}
      InputProps={{
        endAdornment: (
          <Box sx={{ display: "flex", alignItems: "flex-end", minWidth: 0 }}>
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
      
    </Box>
  );
};

export default AskAIChat; 