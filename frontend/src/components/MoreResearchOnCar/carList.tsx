import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";
import { axiosInstance1 } from "@/utils/axiosInstance";
import { useSnackbar } from "@/Context/SnackbarContext";
import { useChats } from "@/Context/ChatContext";
import { useCookies } from "react-cookie";

const bottomMenuItems = [
  "Should I buy a Diesel car",
  "Should I buy an Electric car",
  "I know exactly what I want",
  "I need advisor support",
  "Back to Car Research",
];

interface BestCarProps {
  setBrands: React.Dispatch<React.SetStateAction<Brand[]>>;
}
const BestCars: React.FC<BestCarProps> = ({ setBrands }) => {
  const [response, setResponse] = useState<any>(null);
  const { messages, setMessages } = useChats();
  const { showSnackbar } = useSnackbar();
  const [cookies] = useCookies(["selectedOption"]);

  const handleMenuClick = async (brandModel: any) => {
    try {
      const data = await axiosInstance1.get("/api/cargpt/brands/");

      const brands = data?.data?.filter((brand: Brand) =>
        brandModel?.brand
          ?.toLowerCase()
          ?.includes(brand.BrandName.toLowerCase())
      );

      setBrands(brands);

      const userMessage: Message = {
        id: String(Date.now()),
        message: `Show me ${brandModel?.brand} cars`,
        render: "text",
        sender: "user",
      };
      setMessages((prev) => [...prev, userMessage]);
    } catch (error) {}

    // You can replace this with routing or logic
  };
  const fetchData = async () => {
    const lastMessage = messages[messages.length - 1];
    let currentMessage =
      typeof lastMessage.message === "string"
        ? lastMessage.message
        : cookies.selectedOption;

    try {
      const data = await axiosInstance1.get(
        `/api/cargpt/prompt-search/?text=${
          messages[messages.length - 2]?.message
        }`
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

  const [h1, setH1] = useState();

  useEffect(() => {
    setH1(
      (typeof messages[messages?.length - 2]?.message === "string" &&
        messages[messages?.length - 2]?.message) ||
        "Best Cars for You"
    );
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {h1}
      </Typography>

      {response?.answers?.map((answer: any, index: number) => {
        const tableData = JSON.parse(answer?.json);
        const keys = Object.keys(tableData);
        const values = Object.values(tableData);
        console.log("value", values);
        return (
          <TableContainer component={Paper} sx={{ mb: 3 }} key={index}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#424242" }}>
                  <TableCell sx={{ color: "white" }}>Category</TableCell>
                  <TableCell sx={{ color: "white" }}>Models</TableCell>
                  <TableCell sx={{ color: "white" }}>Mileage (km/l)</TableCell>
                  <TableCell sx={{ color: "white" }}>
                    Price Range (INR, lakh)
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {keys.map((keyData, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          handleMenuClick({
                            brand: keyData,
                            models: tableData[keyData]?.Models,
                          })
                        }
                        sx={{ textTransform: "none", fontSize: "14px" }}
                      >
                        {keyData}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {tableData[keyData]?.Models?.join(",")}
                    </TableCell>
                    <TableCell>
                      {tableData[keyData]?.["Mileage (km/l)"]?.join(",")}
                    </TableCell>
                    <TableCell>
                      {tableData[keyData]?.["Price Range (INR, lakh)"]?.join([
                        ",",
                      ])}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      })}

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {bottomMenuItems.map((item, idx) => (
          <Button
            key={idx}
            variant="outlined"
            size="small"
            onClick={() => handleMenuClick(item)}
            sx={{
              textTransform: "none",
              fontSize: "14px",
              padding: "5px 10px",
            }}
          >
            {item}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default BestCars;
