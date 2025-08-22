import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
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
import FaceIcon from "@mui/icons-material/Face";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
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
  const [prompt, setprompt] = useState<string>("");
  const [chipsDisabled, setChipsDisabled] = useState(false);

  const fetchData = async () => {
    const lastMessage = messages[messages.length - 1];
    let currentMessage =
      typeof lastMessage.message === "string"
        ? lastMessage.message
        : cookies.selectedOption;

    console.log("Current message:", currentMessage);
    if (!currentMessage) return;
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
        render: "text",
        sender: "user",
      };

      const botMessage: Message = {
        id: String(Date.now()),
        message: { brand: data?.dada },
        render: "brandModelSelect",
        sender: "bot",
      };

      setMessages((prev) => [...prev, userMessage, botMessage]);
    } catch (error) {}
  };

  const onClick = () => {
    console.log("I know exactly what I want clicked");
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: Date.now().toString(),
        render: "text",
        sender: "user",
        message: "I know exactly what I want",
        prompt: true,
      },
    ]);
  };

  const handleNeedAdviceSupport = () => {
    console.log("I need advisor support clicked");
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: Date.now().toString(),
        render: "text",
        sender: "user",
        message: "I need advisor support",
        prompt: true,
      },
    ]);
  };

  const backTOIntial = () => {
    console.log("Back to car research clicked");
    const userMessage = {
      id: String(Date.now() + 1),
      message: "I want to do more research on cars",
      render: "text" as const,
      sender: "user" as const,
    };
    setMessages((prev) => [...prev, userMessage]);
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

      let brandId = 0;
      let models = [];
      setLoading(item?.Brand);
      for (let index = 0; index < item?.Models.length; index++) {
        const element = item?.Models[index];
        const response = await fetchBrandModelId(item?.Brand, element);
        models.push({
          ModelID: response?.ModelID,
          ModelName: element,
        });
        if (index === 0) {
          brandId = response?.BrandID;
        }
      }
      setLoading("");

      const botMessage: Message = {
        id: String(Date.now()) + 1,
        message: {
          brands: [{ BrandID: brandId, BrandName: item?.Brand }],
          models: models,
        },
        render: "brandModelSelect",
        sender: "bot",
        searchParam: COMBINEOPTIONS.find((option: string) =>
          item?.heading?.includes(option)
        ),
      };

      const newMessages = [userMessage, botMessage];
      setMessages((prev) => [...prev, ...newMessages]);
    } 
    
    else if (item && item?.Brand) {
      let fistItem = item?.Brand;
      const searchItem = CustomFilter.find((it) => fistItem?.includes(it));

      if (searchItem) {
        await searchBrands(searchItem);
      }
    }
  };

  const fetchBrandModelId = async (brand_name: string, model_name: string) => {
    try {
      let payload: any = {};
      if (brand_name) {
        payload["brand_name"] = brand_name;
      }
      if (model_name) {
        payload["model_name"] = model_name;
      }
      const response = await axiosInstance1.post(
        "/api/cargpt/get-brand-model-id/",
        payload
      );
      return response;
    } catch (error) {}
  };

  const [disbleBtn, setdisbleBtn] = useState<string>("");
  const [loading, setLoading] = useState<string>("");
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

    let brands: { BrandID: number; BrandName: string }[] = [];
    setLoading(search);
    for (let index = 0; index < data?.brands.length; index++) {
      const element = data?.brands[index];
      const fbmid = await fetchBrandModelId(element, "");
      brands.push(fbmid);
    }

    const response = await axiosInstance1.post("/api/cargpt/models/", {
      brand_id: brands?.[0]?.BrandID,
      ...payload,
    });

    const models = response?.models;
    console.log("models11", models);

    setLoading("");

    const userMessage: Message = {
      id: String(Date.now()),
      message: `Show me ${search} cars`,
      render: "text",
      sender: "user",
    };
    const botMessage: Message = {
      id: String(Date.now()) + 1,
      message: {
        brands: brands as { BrandID: number; BrandName: string }[],
        models: models,
      },
      render: "brandModelSelect",
      sender: "bot",
      searchParam: search,
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
  };
  const { mode } = useColorMode();
  return (
    <>
      <Box sx={{ marginTop: 0 }}>
        {response?.answers?.map((answer: any, index: number) => (
          <Box sx={{ paddingBottom: 0 }} key={index}>
            {response?.answers?.map((answer: any, index: number) => (
              <Box sx={{ paddingBottom: 2 }} key={index}>
                <div
                  className="prompt"
                  dangerouslySetInnerHTML={{ __html: answer?.text }}
                />
                {answer?.json && (
                  <Box sx={{ marginBottom: 2 , pt:0}}>
                    <RenderJson
                      data={JSON.parse(answer.json)}
                      onCategoryClick={handleClick}
                      title={"table"}
                      isLoading={loading}
                      heading={answer?.text}
                    />
                  </Box>
                )}
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
                            // New attractive styling
                            backgroundColor: (theme) =>
                              item.prompt__text === disbleBtn
                                ? theme.palette.primary.main
                                : theme.palette.background.paper,
                            color: (theme) =>
                              item.prompt__text === disbleBtn
                                ? theme.palette.primary.contrastText
                                : theme.palette.text.primary,
                            borderColor: (theme) => theme.palette.divider,
                            border: "1px solid",
                            "&:hover": {
                              backgroundColor: (theme) =>
                                item.prompt__text === disbleBtn
                                  ? theme.palette.primary.dark
                                  : theme.palette.action.hover,
                            },
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
          <Box
            sx={{
              marginTop: 2,
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <Stack
              direction="row"
              gap={1.5}
              mt={1}
              flexWrap="wrap"
              justifyContent={{ xs: "center", sm: "flex-start" }}
              sx={{
                pb: '15px',
                rowGap: 1,
              }}
            >
              <Chip
                label="I know exactly what I want"
                variant="filled"
                size="small"
                icon={<FaceIcon />}
                onClick={() => {
                  setChipsDisabled(true);
                  onClick?.();
                }}
                disabled={chipsDisabled}
                sx={{
                  fontSize: 13,
                  textTransform: "capitalize",
                  borderWidth: 1,
                  flex: { xs: "1 1 calc(50% - 12px)", sm: "0 auto" },
                  maxWidth: { xs: "calc(50% - 12px)", sm: "none" },
                }}
              />

              <Chip
                label="I need advisor support"
                variant="filled"
                size="small"
                color="default"
                icon={<SupportAgentIcon />}
                onClick={() => {
                  setChipsDisabled(true);
                  handleNeedAdviceSupport();
                }}
                disabled={chipsDisabled}
                sx={{
                  fontSize: 13,
                  textTransform: "capitalize",
                  borderWidth: 1,
                  flex: { xs: "1 1 calc(50% - 12px)", sm: "0 auto" },
                  maxWidth: { xs: "calc(50% - 12px)", sm: "none" },
                }}
              />

              {cookies.selectedOption ===
                "I want to do more research on cars" && (
                <Chip
                  label="Back to car research"
                  variant="filled"
                  size="small"
                  color="default"
                  icon={<DirectionsCarIcon />}
                  onClick={backTOIntial}
                  sx={{
                    fontSize: 13,
                    textTransform: "capitalize",
                    borderWidth: 1,
                    flex: { xs: "1 1 calc(50% - 12px)", sm: "0 auto" },
                    maxWidth: { xs: "calc(50% - 12px)", sm: "none" },
                  }}
                />
              )}
            </Stack>
          </Box>
        </Box>

        <style>
          {`
          .prompt {
            color: ${mode === "dark" ? "#e0e0e0" : "#333"} !important;
            line-height: 1.6;
            padding-bottom: 15px;
          }
          .prompt h1, .prompt h2, .prompt h3, .prompt h4, .prompt h5, .prompt h6 {
            color: ${mode === "dark" ? "#fff" : "#1976d2"} !important; /* Blue for light, white for dark */
            margin-bottom: 0.8em;
            font-weight: 600;
            padding-left: 5px; /* Added padding to headings */
          }
          .prompt h1 {
            font-size: 1.8em;
          }
          .prompt h2 {
            font-size: 1.5em;
          }
          .prompt h3 {
            font-size: 1.2em;
          }
          .prompt ul,
          .prompt ol {
            list-style-type: none; /* Remove all default list markers */
            padding-left: 0; /* Reset default padding */
            margin-bottom: 1em;
          }
          .prompt li {
            margin-bottom: 0.6em;
            color: ${mode === "dark" ? "#ccc" : "#555"} !important;
            position: relative;
            padding-left: 20px; /* Space for the custom icon */
          }
          .prompt li::before {
            content: "▶"; /* Custom right-pointing triangle */
            color: ${mode === "dark" ? "#1976d2" : "#1976d2"} !important;
            position: absolute;
            left: 0;
            font-size: 0.8em;
            line-height: inherit;
          }
          .prompt ul ul,
          .prompt ol ol {
            padding-left: 20px; /* Indent nested lists, but keep custom icon */
            list-style-type: none !important; /* Remove all default list markers */
          }
          .prompt li strong {
            color: ${mode === "dark" ? "#fff" : "#1976d2"} !important;
            list-style-type: none;
          }
          .prompt p {
            margin-bottom: 1em;
            padding-left: 5px;
          }
          .prompt .card {
            // background: ${mode === "dark" ? "#333" : "#f0f0f0"} !important;
            // border-radius: 8px;
            padding: 5px;
            margin-bottom: 1em;
          }
        `}
        </style>
      </Box>
    </>
  );
};

export default CarResearchMenu;
