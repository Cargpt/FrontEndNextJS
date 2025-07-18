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
  CustomFilter,
  FUELTYPES,
  TRANSMISSIONTYPES,
} from "@/utils/services";

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

  const fetchData = async () => {
    const lastMessage = messages[messages.length - 1];
    let currentMessage =
      typeof lastMessage.message === "string"
        ? lastMessage.message
        : cookies.selectedOption;

    console.log("Current message:", currentMessage);

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
    } else if (typeof item === "string") {
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
      const botMessage: Message = {
        id: String(),
        message: {
          brands: [{ BrandID: 1, BrandName: item?.Brand }],
          models: item?.Models?.map((model: string, index: number) => ({
            ModelID: index + 1,
            ModelName: model,
          })),
        },
        render: "brandModelSelect",
        sender: "bot",
      };

      const newMessages = [userMessage, botMessage];
      setMessages((prev) => [...prev, ...newMessages]);
      console.log("item", item, userMessage);
    } else if (item && item?.Brand) {
      let fistItem = item?.Brand;
      if (fistItem == "MT") fistItem = "MT";
      if (fistItem == "AT") fistItem = "AT";
      const searchItem = CustomFilter.find((it) =>
        fistItem?.toLowerCase().includes(it?.toLowerCase())
      );
      if (searchItem) {
        await searchBrands(searchItem);
      }
    }

    // Add logic for navigation or state change here
  };
  const [disbleBtn, setdisbleBtn] = useState<string>("");

  const searchBrands = async (search: string) => {
    let payload: any = {};

    
    if (BODYTYPES.includes(search.toLowerCase())) {
      payload["body_type"] = search;
    } else if (FUELTYPES.includes(search.toLowerCase())) {
      payload["fuel_type"] = search;
    } else if (TRANSMISSIONTYPES.includes(search.toLowerCase())) {
      payload["transmission_type"] = search;
    } else if (BUDGET.includes(search.toLowerCase())) {
      payload["budget"] = search;
    }

    const data = await axiosInstance1.post("/api/cargpt/search/", payload);
    const brands = data?.brands?.map((item:string, index:number)=> ({BrandName:item, BrandID:index+1}))

    // Get first brand and its models
    const firstBrand = brands[0];
    // const data = await axiosInstance1.post("/api/cargpt/search/", payload);

    // const models = data[0][firstBrand?.BrandName].map(
    //   (item: any, index: number) => ({ ModelName: item, ModelID: index + 1 })
    // );

    const userMessage: Message = {
      id: String(Date.now()),
      message: `Show me ${search} cars`,
      render: "text",
      sender: "user",
    };
    const botMessage: Message = {
      id: String(Date.now()) + 1,
      message: { brands: brands},
      render: "brandModelSelect",
      sender: "bot",
      searchParam:payload
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
  };

  
  console.log("response", response);
  return (
    <>
      <Box sx={{ marginTop: 0 }}>
        {response?.answers?.map((answer: any, index: number) => (
          <Box sx={{ paddingBottom: 0 }} key={index}>
              <Box dangerouslySetInnerHTML={{ __html: answer?.text }}  sx={{py:2}}/>
            {/* </Typography> */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              {response?.answers?.map((answer: any, index: number) => (
                <Box sx={{ paddingBottom: 2 }} key={index}>
                  {/* JSON block, if present */}
                  {answer?.json && (
                    <Box sx={{ marginBottom: 2 }}>
                      <RenderJson
                        data={JSON.parse(answer.json)}
                        onCategoryClick={handleClick}
                        title={"table"}
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
            </Box>
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
              variant={item === disbleBtn ? "contained" : "outlined"}
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
      </Box>
    </>
  );
};

export default CarResearchMenu;
