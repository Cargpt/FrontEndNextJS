import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { axiosInstance1 } from "@/utils/axiosInstance";
import { useChats } from "@/Context/ChatContext";
import { useSnackbar } from "@/Context/SnackbarContext";
import { useCookies } from "react-cookie";
import RenderJson from "./JsonRender";
import {
  BODYTYPES,
  BUDGET,
  COMBINEOPTIONS,
  CustomFilter,
  FUELTYPES,
  TRANSMISSIONTYPES,
} from "@/utils/services";
import { Style } from "@mui/icons-material";
import { useColorMode } from "@/Context/ColorModeContext";

const AdditionalOptions = [
  "I know exactly what I want",
  "I need advisor support",
  "Back to car research",
];


const CarResearchMenu: React.FC = () => {
  const [response, setResponse] = useState<any>(null);
  const { messages, setMessages } = useChats();
  const { showSnackbar } = useSnackbar();
  const [cookies] = useCookies(["selectedOption"]);
  const [prompt, setprompt] = useState<string>('')

  const fetchData = async () => {
    const lastMessage = messages[messages.length - 1];
    let currentMessage =
      typeof lastMessage.message === "string"
        ? lastMessage.message
        : cookies.selectedOption;

    console.log("Current message:", currentMessage);
     if(!currentMessage) return;
    try {
      const data = await axiosInstance1.get(
        `/api/cargpt/prompt-search/?text=${currentMessage}`
      );
      if (!data) {
        showSnackbar("No data found for the given query", {
          vertical: "bottom",
          horizontal: "center",
        });
        return;
      }
      setResponse(data);
    } catch (error) {
      console.error("Error fetching car research menu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [cookies.selectedOption]);

  const fetchBrands = async (message: string) => {
    try {
      const data = await axiosInstance1.get("/api/cargpt/brands/");

      const userMessage: Message = {
        id: String(Date.now() + 1),
        message: { message },
        render: "text", // Change this to 'carOptions' if you want to show the carousel
        sender: "user",
      };

      const botMessage: Message = {
        id: String(Date.now()),
        message: { brand: data?.dada },
        render: "brandModelSelect", // Change this to 'carOptions' if you want to show the carousel
        sender: "bot",
      };

      setMessages((prev) => [...prev, userMessage, botMessage]);
    } catch (error) {}
  };

  const handleClick = async (item: any) => {
    console.log("item", item);

    if (typeof item === "string" && item?.toLowerCase()?.includes("back")) {
      const newMessage: Message[] = [
        {
          id: Date.now().toString(),
          render: "text",
          sender: "user",
          message: item,
          prompt: true,
        },
        {
          id: Date.now().toString(),
          render: "researchOncar",
          sender: "bot",
          message: {},
          prompt: true,
        },
      ];
      setMessages((prevMessages) => [...prevMessages, ...newMessage]);
      setdisbleBtn(item);
    }
     else if (typeof item === "string") {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now().toString(),
          render: "text",
          sender: "user",
          message: item,
          prompt: false,
        },
      ]);
      setdisbleBtn(item);
    } else if (item?.prompt__text) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now().toString(),
          render: "text",
          sender: "user",
          message: item?.prompt__text,
          prompt: true,
        },
      ]);
      setdisbleBtn(item?.prompt__text);
    } else if (item?.Brand && item?.Models) {
      const userMessage: Message = {
        id: String(Date.now()),
        message: `Show me ${item?.Brand} cars`,
        render: "text",
        sender: "user",
      };

      let brandId = 0;
      let models = [];
       setLoading(item?.Brand);
      for (let index = 0; index < item?.Models.length; index++) {
        const element = item?.Models[index];
        const response = await fetchBrandModelId(item?.Brand, element)
        models.push({
          ModelID:response?.ModelID,
          ModelName: element,
        })
        if (index === 0) {
          brandId = response?.BrandID;
        }
        
      }
      setLoading('');


      const botMessage: Message = {
        id: String(Date.now()) + 1,
        message: {
          brands: [{ BrandID: brandId, BrandName: item?.Brand }],
          models: models,
        },
        render: "brandModelSelect",
        sender: "bot",
        searchParam:COMBINEOPTIONS.find((option:string)=>item?.heading?.includes(option)),
      };

      const newMessages = [userMessage, botMessage];
      setMessages((prev) => [...prev, ...newMessages]);
    } else if (item && item?.Brand) {
      let fistItem = item?.Brand;
      const searchItem = CustomFilter.find((it) =>
        fistItem?.includes(it)
      );

      if (searchItem) {
        await searchBrands(searchItem);
      }
    }

    // Add logic for navigation or state change here
  };

  const fetchBrandModelId = async (brand_name: string, model_name: string) => {
    try {
      let payload:any ={}
      if(brand_name){
        payload["brand_name"] = brand_name;
      }
      if(model_name){
        payload["model_name"] = model_name;
      }
      const response =  await axiosInstance1.post('/api/cargpt/get-brand-model-id/', payload)
       return response;
      
    } catch (error) {
      
    }
  }


  const [disbleBtn, setdisbleBtn] = useState<string>("");
  const [loading, setLoading] = useState<string>('');
  const searchBrands = async (search: string) => {
    let payload: any = {};
    console.log("search123", search);
    
    if (BODYTYPES.includes(search)) {
      payload["body_type"] = search;
    } else if (FUELTYPES.includes(search.toLowerCase())) {
      payload["fuel_type"] = search;
    } else if (TRANSMISSIONTYPES.includes(search)) {
      payload["transmission_type"] = search;
    } else if (BUDGET.includes(search.toLowerCase())) {
      payload["budget"] = search;
    }

    const data = await axiosInstance1.post("/api/cargpt/search/", payload);
        
          let brands = [];
          setLoading(search);
         for (let index = 0; index < data?.brands.length; index++) {
          const element = data?.brands[index];
            const fbmid = await fetchBrandModelId(element, '');
            brands.push(fbmid)

          
         }

         const response = await axiosInstance1.post("/api/cargpt/models/", {
          brand_id:brands?.[0]?.BrandID,
          ...payload,
        
        });

         const models = response?.models;
          console.log("models11", models);
       
       
         setLoading('');

    const userMessage: Message = {
      id: String(Date.now()),
      message: `Show me ${search} cars`,
      render: "text",
      sender: "user",
    };
    const botMessage: Message = {
      id: String(Date.now()) + 1,
      message: { brands: brands, models: models},
      render: "brandModelSelect",
      sender: "bot",
      searchParam:search
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
  };
 const {mode}= useColorMode()
  return (
    <>
      <Box sx={{ marginTop: 0 }}>
        {response?.answers?.map((answer: any, index: number) => (
          <Box sx={{ paddingBottom: 0 }} key={index}>

            

              {response?.answers?.map((answer: any, index: number) => (
                <Box sx={{ paddingBottom: 2 }} key={index}>
                  {/* JSON block, if present */}

                  <div className="prompt" dangerouslySetInnerHTML={{__html:answer?.text}}/>
                  {answer?.json && (
                    <Box sx={{ marginBottom: 2 }}>
                      <RenderJson
                        data={JSON.parse(answer.json)}
                        onCategoryClick={handleClick}
                        title={"table"}
                        isLoading={loading}
                        heading={answer?.text}
                      />
                    </Box>
                  )}

                  {/* Prompt buttons block, if present */}
                  {answer?.recommended_prompts?.length > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1,

                      }}
                    >
                      {answer.recommended_prompts.map(
                        (item: any, idx: number) => (
                          <Button
                            disabled={!!disbleBtn}
                            key={idx}
                            variant={
                              item.prompt__text === disbleBtn
                                ? "contained"
                                : "outlined"
                            }
                            size="small"
                            onClick={() => handleClick(item)}
                            sx={{
                              fontSize: "14px",
                              padding: "5px 10px",
                              textTransform: "none",
                            }}
                          >
                            {item.prompt__text}
                          </Button>
                        )
                      )}
                    </Box>
                  )}
                </Box>
              ))}
            {/* </Box> */}
          </Box>
        ))}
        <Box
          sx={{
            gap: 1,
            marginTop: 2,
          }}
        >
          {response?.answers.length < 1 && (
            <Typography
              component="p"
              sx={{ marginBottom: 2, fontSize: "15px", fontWeight: "" }}
            >
              <div dangerouslySetInnerHTML={{ __html: "No Data found" }} />
            </Typography>
          )}
 <Box sx={{
    marginTop: 2,
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'  // space between items even when wrapped
  }}
>
          {AdditionalOptions.map((item, idx) => (
            
            <Button
            
              disabled={!!disbleBtn}
              key={idx}
              
              variant={item === disbleBtn ? "outlined" : "contained"}
              size="small"
              onClick={() => handleClick(item)}
              sx={{
                fontSize: "14px",
                padding: "5px 10px",
                textTransform: "none",
                marginRight:"8px"
              }}
            >
              {item}
            </Button>
          ))}
          </Box>
        </Box>

            <style>
        {`
          .prompt {
            color: ${mode === 'dark' ? '#fff' : '#000'} !important;
           
          }
                      .prompt card {
            color: ${mode === 'dark' ? '#fff' : '#000'} !important;
            background: ${mode === 'dark' ? 'transparent' : '#fff'} !important;

           
          }
            .prompt h2 {
                        color: ${mode === 'dark' ? '#fff' : '#333'} !important;


            }
                        .prompt h3, .prompt ul{
                          color: ${mode === 'dark' ? '#fff' : '#333'} !important;

                        }
                          .prompt li strong{
                              color: ${mode === 'dark' ? '#fff' : '#000'} !important;

                          }
           

        `}
        </style>
      </Box>
    </>
  );
};

export default CarResearchMenu;
