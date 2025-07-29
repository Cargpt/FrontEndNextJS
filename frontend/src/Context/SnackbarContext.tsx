import React, { createContext, useContext, useState, ReactNode } from "react";
import { Snackbar, SnackbarOrigin, Alert, AlertColor } from "@mui/material";

interface SnackbarOptions extends SnackbarOrigin {
  autoHideDuration?: number;
  color?: AlertColor; // 'success' | 'info' | 'warning' | 'error'
}

interface SnackbarContextType {
  showSnackbar: (message: string, options?: SnackbarOptions) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const SnackbarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [position, setPosition] = useState<SnackbarOrigin>({
    vertical: "bottom",
    horizontal: "center",
  });
  const [autoHideDuration, setAutoHideDuration] = useState(3000);
  const [color, setColor] = useState<AlertColor | undefined>(undefined);

  const showSnackbar = (
    msg: string,
    options: SnackbarOptions = { vertical: "bottom", horizontal: "center" }
  ) => {
    setMessage(msg);
    setPosition({
      vertical: options.vertical ?? "bottom",
      horizontal: options.horizontal ?? "center",
    });
    setColor(options.color);
    setAutoHideDuration(options.autoHideDuration ?? 3000);
    setOpen(true);
  };

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        anchorOrigin={position}
        open={open}
        onClose={handleClose}
        autoHideDuration={autoHideDuration}
        key={`${position.vertical}-${position.horizontal}`}
      >
        <Alert onClose={handleClose} severity={color ?? "info"} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
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
