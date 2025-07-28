'use client';

import React, { createContext, useContext, useState } from "react";

interface LoginDialogContextType {
  open: boolean;
  show: () => void;
  hide: () => void;
}

const LoginDialogContext = createContext<LoginDialogContextType | undefined>(undefined);

export const useLoginDialog = () => {
  const ctx = useContext(LoginDialogContext);
  if (!ctx) throw new Error("useLoginDialog must be used within LoginDialogProvider");
  return ctx;
};

export const LoginDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const show = () => setOpen(true);
  const hide = () => setOpen(false);

  return (
    <LoginDialogContext.Provider value={{ open, show, hide }}>
      {children}
    </LoginDialogContext.Provider>
  );
};