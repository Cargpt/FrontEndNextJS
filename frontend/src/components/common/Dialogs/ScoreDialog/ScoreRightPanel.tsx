import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { Close } from "@mui/icons-material";

const ScoreRightPanel = () => {
  const cardData = [
    { id: 1, title: "Score Card 1" },
    { id: 2, title: "Score Card 2" },
    { id: 3, title: "Score Card 3" },
    { id: 4, title: "Score Card 4" },
    { id: 5, title: "Score Card 5" },
    { id: 6, title: "Score Card 6" },
  ];

  return (
    <Box
      sx={{
        width: { xs: "100%", md: "70%" },
        p: { xs: 2, md: 3 },
        overflowY: "auto",
        height: "100%",
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#bbb",
          borderRadius: "3px",
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "#f0f0f0",
        },
        scrollbarWidth: "thin",
        scrollbarColor: "#bbb #f0f0f0",

        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "1fr 1fr",
          md: "1fr 1fr 1fr",
        },
        gap: 2,
      }}
    >
      {cardData.map((card) => (
        <Card
          key={card.id}
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            transition: "box-shadow 0.3s ease-in-out",
            "&:hover": {
              boxShadow: 4,
            },
            background: "linear-gradient(135deg, #e6f1fc, #fff)",
            boxShadow: "0 3px 6px #0003",
          }}
        >
          <CardContent
            sx={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <Typography
              variant="h6"
              component="h6"
              sx={{ mb: 2, fontWeight: "bold" }}
            >
              {card.title}
            </Typography>
            <Typography
              variant="h3"
              component="div"
              sx={{
                mb: 2,
                fontWeight: "bold",
                color: "primary.main",
              }}
            >
              <Close fontSize="inherit" />
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default ScoreRightPanel;
