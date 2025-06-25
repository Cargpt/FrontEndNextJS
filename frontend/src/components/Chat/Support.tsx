"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Avatar,
  Typography,
  Paper,
  Stack,
  CircularProgress,
} from "@mui/material";
import Image from "next/image";
import bot from "../../../public/assets/lisa.svg"

import BrandModelSelectCard from "./Model/BrandModelSelectCard";
import AdviseSelectionCard from "./Model/AdviceSelectionCard";
interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

const CarOptions = () => (
  <Box sx={{ mt: 1, pl: 2 }}>
    <Typography variant="body2">🚗 Sedan</Typography>
    <Typography variant="body2">🚙 SUV</Typography>
    <Typography variant="body2">🚘 Hatchback</Typography>
  </Box>
);

const Support: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "2",
      text: "I need advisor support",
      sender: "user",
    },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate bot reply after a delay
    const timer = setTimeout(() => {
      const lastMsg = messages[messages.length - 1];

      if (lastMsg.sender === "user") {
        setLoading(true);
        setTimeout(() => {
          const botMessage: Message = {
            id: String(Date.now()),
            text: "I am looking for",
            sender: "bot",
          };
          setMessages((prev) => [...prev, botMessage]);
          setLoading(false);
        }, 1000);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [messages]);

  return (
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
      <Typography variant="h6" gutterBottom>
        Chat
      </Typography>

      {/* Message List */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          mb: 2,
          pr: 1,
        }}
      >
        {messages.map((msg) => (
          <React.Fragment key={msg.id}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="flex-start"
              justifyContent={msg.sender === "user" ? "flex-end" : "flex-start"}
              sx={{ mb: 1 }}
            >
              {msg.sender === "bot" && (
                <Image src={bot} alt="bot" width={40} height={40} />
              )}
              <Paper
                sx={{
                  p: 1.5,
                  maxWidth: "70%",
                  bgcolor: msg.sender === "user" ? "primary.main" : "grey.200",
                  color: msg.sender === "user" ? "white" : "black",
                }}
              >
                {msg.sender === "bot" ? (
                  <AdviseSelectionCard options={[]} label={""} h1={""} />
                ) : (
                  <Typography variant="body2">{msg.text}</Typography>
                )}
              </Paper>
              {msg.sender === "user" && (
                <Avatar sx={{ bgcolor: "secondary.main" }}>U</Avatar>
              )}
            </Stack>

            {/* 🧠 Conditional Component Rendering */}
            {msg.text.toLowerCase().includes("type of car") && <CarOptions />}
          </React.Fragment>
        ))}

        {loading && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar sx={{ bgcolor: "primary.main" }}>B</Avatar>
            <CircularProgress size={20} />
          </Stack>
        )}
      </Box>
    </Paper>
  );
};

export default Support;
