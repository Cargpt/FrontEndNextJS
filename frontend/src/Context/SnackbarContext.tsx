import React, { createContext, useContext, useState, ReactNode } from "react";
import { Snackbar, SnackbarOrigin } from "@mui/material";

type SnackbarPosition = SnackbarOrigin;
type SnackbarOptions = SnackbarPosition;

interface SnackbarContextType {
  showSnackbar: (message: string, options?: SnackbarOptions) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined
);

export const SnackbarProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [position, setPosition] = useState<SnackbarPosition>({
    vertical: "bottom",
    horizontal: "center",
  });

  const showSnackbar = (
    msg: string,
    options: SnackbarOptions = { vertical: "bottom", horizontal: "center" }
  ) => {
    setMessage(msg);
    setPosition(options);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        anchorOrigin={position}
        open={open}
        onClose={handleClose}
        message={message}
        autoHideDuration={3000}
        key={`${position.vertical}-${position.horizontal}`}
      />
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};
export default SnackbarProvider;
