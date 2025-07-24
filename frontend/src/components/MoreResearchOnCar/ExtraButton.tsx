import React from "react";
import { Button } from "@mui/material";

interface MyButtonsProps {
  items: string[];
  disbleBtn: string | null;
  handleClick: (item: string) => void;
}

const ExtraButton: React.FC<MyButtonsProps> = ({ items, disbleBtn, handleClick }) => {
  return (
    <>
      {items.map((item, idx) => {
        const isDisabled = item === disbleBtn;
        const isContained = item === disbleBtn;

        return (
          <Button
            key={idx}
            disabled={isDisabled}
            variant={isContained ? "contained" : "outlined"}
            color="primary"
            size="small"
            onClick={() => handleClick(item)}
            sx={{
              fontSize: "14px",
              padding: "5px 10px",
              textTransform: "none",
              marginRight: "8px",
              ...(isContained
                ? {}
                : {
                    borderColor: "#1976d2",
                    color: "#1976d2",
                    "&:hover": {
                      borderColor: "#1565c0",
                      backgroundColor: "rgba(25, 118, 210, 0.04)",
                    },
                  }),
            }}
          >
            {item}
          </Button>
        );
      })}
    </>
  );
};

export default ExtraButton;
