"use client";
import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Avatar,
  Typography,
  Paper,
  Stack,
  CircularProgress,
} from '@mui/material';
import Image from 'next/image';
import bot from "../../../public/assets/lisa.svg"
import BrandModelSelectCard from './Model/BrandModelSelectCard';
import ModelCarousel from '../ModelCarousel/ModelCarousel';
interface Message {
  id: string;
  sender: 'user' | 'bot';
  render: 'brandModelSelect' | 'carOptions' | 'text';
  message: string | any
  
}



const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      message: 'I know exactly what I want',
      render: 'text',
      sender: 'user',
    },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate bot reply after a delay
    const timer = setTimeout(() => {
      const lastMsg = messages[messages.length - 1];

      if (lastMsg.sender === 'user') {
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
    }, 1000);

    return () => clearTimeout(timer);
  }, []);



  const renderMessage = (message:Message) => {
    switch (message.render) {
      case 'brandModelSelect':
        return <BrandModelSelectCard  handleUserMessage={handleUserMessage}/>;
      case 'carOptions':
        return <ModelCarousel />;
      case 'text':
        return <div>{message.message}</div>; // Default text rendering
      default:
        return null;
    }

  }

  const handleUserMessage = (text: any) => {
    const lastItem = messages[messages.length - 1];
    const userMessage:Message = {
      id: String(Date.now()),
      message: "I am looking for cars based on the selected parameters.",
      render: 'text',
      sender: 'user',
    }

    const newsMessages:Message[]=[...messages.slice(0, messages.length-1), { 
      ...lastItem,
      message:text
      }]
    newsMessages.push(userMessage);
      setMessages(newsMessages);
   
  }
useEffect(() => {
   const lastItem = messages[messages.length - 1]
   if(lastItem.message=="I am looking for cars based on the selected parameters."){
      const botMessage: Message = {
        id: String(Date.now()),
        message: {},
        render: "carOptions", // Change this to 'carOptions' if you want to show the carousel
        sender: 'bot',
      };
      setMessages(prev=> [...prev, botMessage]);


   }
  
  
}, [messages]);

const bottomRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  if (bottomRef.current) {
    bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }
}, [messages]);

  console.log("messages", messages);
  return (
    <>
    <Paper
      elevation={3}
      sx={{
        p: 2,
        width: '100%',

        display: 'flex',
        flexDirection: 'column',
        mx: 'auto',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Chat
      </Typography>

      {/* Message List */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          mb: 2,
          pr: 1,
        }}
      >
        {messages.map((msg) => (
         <Stack
  key={msg.id}
  direction="row"
  spacing={1}
  alignItems="flex-start"
  justifyContent={msg.sender === 'user' ? 'flex-end' : 'flex-start'}
  sx={{ mb: 2 }}
>
  {msg.sender === 'bot' && (
    <Image src={bot} alt="bot" width={40} height={40} />
  )}
  <Paper
    sx={{
      p: 1.5,
      maxWidth: '75%',
      bgcolor: msg.sender === 'user' ? 'primary.main' : 'grey.200',
      color: msg.sender === 'user' ? 'white' : 'black',
    }}
  >
    {renderMessage(msg)}
  </Paper>
  {msg.sender === 'user' && (
    <Avatar sx={{ bgcolor: 'secondary.main' }}>U</Avatar>
  )}
</Stack>

          // <React.Fragment key={msg.id}>
          //   <Stack
          //     direction="row"
          //     spacing={1}
          //     alignItems="flex-start"
          //     justifyContent={msg.sender === 'user' ? 'flex-end' : 'flex-start'}
          //     sx={{ mb: 1 }}
          //   >
          //     {msg.sender === 'bot' && (
          //       <Image src={bot} alt='bot' width={40} height={40}/>
          //     )}
          //     <Paper
          //       sx={{
          //         p: 1.5,
          //         maxWidth: '70%',
          //         bgcolor:
          //           msg.sender === 'user' ? 'primary.main' : 'grey.200',
          //         color: msg.sender === 'user' ? 'white' : 'black',
          //       }}
          //     >

          //        {
          //       msg.sender==='bot' &&
          //       <BrandModelSelectCard/>
                
          //        }
          //        {msg.text=="I am looking for cars based on the selected parameters."}



          //     <Typography variant="body2">{msg.text}</Typography>


                 
          //     </Paper>
          //     {msg.sender === 'user' && (
          //       <Avatar sx={{ bgcolor: 'secondary.main' }}>U</Avatar>
          //     )}
          //   </Stack>

          //   {/* 🧠 Conditional Component Rendering */}

          // </React.Fragment>
        ))}

        {loading && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main' }}>B</Avatar>
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
