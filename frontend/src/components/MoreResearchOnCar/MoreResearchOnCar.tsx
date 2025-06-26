import React, { useEffect, useState } from 'react';
import { Box, Button } from '@mui/material';
import { axiosInstance1 } from '@/utils/axiosInstance';
import { useChats } from '@/Context/ChatContext';
import { useSnackbar } from '@/Context/SnackbarContext';
import { useCookies } from 'react-cookie';

interface MenuItem {
  label: string;
}

const menuItems: MenuItem[] = [
  { label: 'Fuel types' },
  { label: 'Body types' },
  { label: 'Manual and Automatic' },
  { label: 'Technical Details' },
  { label: 'Brand recommendations' },
  { label: 'Brand opinion' },
  { label: 'I know exactly what I want' },
  { label: 'I need advisor support' },
  { label: 'Back to Car Research' },
];

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
  const handleClick = (label: string) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now().toString(),
          render: 'text',
          sender: 'user',
          message: label,
          prompt: label.includes("Best")? false : true,
        },
      ]);

    console.log(`Clicked: ${label}`);
    // Add logic for navigation or state change here
  };


  return (
  <Box sx={{marginTop:3}}>
    {
    response?.answers?.map((answer:any, index:number)=>(
       <Box sx={{ paddingBottom: 2 }} key={index}>
      <Box component="p" sx={{ marginBottom: 2, fontSize: '14px',  fontWeight:"" }}>
        {answer?.text}
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          
        }}
      >
        {answer?.recommended_prompts?.map((item:any, index:null) => (
          <Button
            key={index}
            variant="outlined"
            size="small"
            onClick={() => handleClick(item.prompt__text)}
            sx={{ fontSize: '14px', padding: '5px 10px', textTransform: 'none' }}
          >
            {item.prompt__text}
          </Button>
        ))}
      </Box>
    </Box>

    ))
    }
    
   
    </Box>
  );
};

export default CarResearchMenu;
