import React, { useEffect, useState } from 'react';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { axiosInstance1 } from '@/utils/axiosInstance';
import { useChats } from '@/Context/ChatContext';
import { useSnackbar } from '@/Context/SnackbarContext';
import { useCookies } from 'react-cookie';
import RenderJson from './JsonRender';


const AdditionalOptions = [

  "I know exactly what I want",
  "I need advisor support",
  "Back to car research"


]


const CarResearchMenu: React.FC = () => {

  const [response, setResponse] = useState<any>(null);
const {messages, setMessages}=useChats()
const {showSnackbar}=useSnackbar()
const [cookies]=useCookies(["selectedOption"])



  const fetchData = async () => {
    const lastMessage = messages[messages.length-1]
    let currentMessage =  typeof lastMessage.message === "string" ? lastMessage.message : cookies.selectedOption
   
    console.log('Current message:', currentMessage);

      try {
        const data = await axiosInstance1.get(`/api/prompt-search/?text=${currentMessage}`);
         if(!data){
          showSnackbar('No data found for the given query', {'vertical': 'bottom', 'horizontal': 'center'});
          return;
         }
        setResponse(data);
      } catch (error) {
        console.error('Error fetching car research menu:', error);
      }
    };


  useEffect(() => {
    
    
      

    fetchData();
  }, [cookies.selectedOption]);

  const handleClick = (item: any) => {
    
    if(typeof item==="string" && item?.toLowerCase()?.includes("back") ){

      const newMessage:Message[]=[
                {
          id: Date.now().toString(),
          render: 'text',
          sender: 'user',
          message: item,
          prompt:true,
        },
        {
          id: Date.now().toString(),
          render: 'researchOncar',
          sender: 'bot',
          message: {},
          prompt:true,
        }
      ]
      setMessages((prevMessages) => [
        ...prevMessages,
        ...newMessage
        
      ]);
      setdisbleBtn(item)

    }
    else if(typeof item==="string"){
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now().toString(),
          render: 'text',
          sender: 'user',
          message: item,
          prompt:false,
        },
      ]);
      setdisbleBtn(item)
    }

    else if(item?.prompt__text){
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now().toString(),
          render: 'text',
          sender: 'user',
          message: item?.prompt__text,
          prompt:true,
        },
      ]);
      setdisbleBtn(item?.prompt__text)
    }
    else if(item?.Brand && item?.Models){
const userMessage: Message = {
      id: String(Date.now()),
      message: `Show me ${item?.Brand} cars`,
      render: "text",
      sender: "user",
    };
  const botMessage:Message={
    id:String(),
     message:{brands: [{BrandID:1, BrandName:item?.Brand}], models:item?.Models?.map((model:string, index:number)=> ({ModelID:index+1, ModelName:model}))},
      render: "brandModelSelect",
      sender: "bot",
  } 
  
  const newMessages = [userMessage, botMessage]
   setMessages((prev)=>[...prev, ...newMessages])
        console.log("item", item, userMessage)

    }
    console.log("item", item)
    // Add logic for navigation or state change here
  };
const [disbleBtn, setdisbleBtn] = useState<string>('');
 
  return (
    <>
  <Box sx={{marginTop:3}}>
    {
    response?.answers?.map((answer:any, index:number)=>(
       <Box sx={{ paddingBottom: 2 }} key={index}>
      <Typography component="p" sx={{ marginBottom: 2, fontSize: '14px',  fontWeight:"" }}>
        <div dangerouslySetInnerHTML={{__html:answer?.text}}/>
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          
        }}
      >


      {response?.answers?.map((answer: any, index: number) => (
  <Box sx={{ paddingBottom: 2 }} key={index}>
    
    {/* JSON block, if present */}
    {answer?.json && (
      <Box sx={{ marginBottom: 2 }}>
        <RenderJson data={JSON.parse(answer.json)} onCategoryClick={handleClick} />
      </Box>
    )}

    {/* Prompt buttons block, if present */}
    {answer?.recommended_prompts?.length > 0 && (
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        {answer.recommended_prompts.map((item: any, idx: number) => (
          <Button
            disabled={!!disbleBtn}
            key={idx}
            variant={item.prompt__text === disbleBtn ? 'contained' : 'outlined'}
            size="small"
            onClick={() => handleClick(item)}
            sx={{ fontSize: '14px', padding: '5px 10px', textTransform: 'none' }}
          >
            {item.prompt__text}
          </Button>
        ))}
       
        
      </Box>
    )}


    <Box
            sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          marginTop:2
        }}

    >

      {
          AdditionalOptions.map((item, idx)=>(
             <Button
            disabled={!!disbleBtn}
            key={idx}
            variant={item === disbleBtn ? 'contained' : 'outlined'}
            size="small"
            onClick={() => handleClick(item)}
            sx={{ fontSize: '14px', padding: '5px 10px', textTransform: 'none' }}
          >
            {item}
          </Button>
          ))
        }
    </Box>
  </Box>
))}


      </Box>
    </Box>

    ))
    }
    
        
    </Box>
    </>
  );
};

export default CarResearchMenu;
