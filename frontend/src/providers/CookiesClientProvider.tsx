// app/providers/CookiesClientProvider.tsx
"use client"; // <-- This directive is crucial! It marks this file as a Client Component.

import { CookiesProvider } from "react-cookie";
import React from "react";
import { FirebaseProvider } from "../Context/FirebaseAuthContext";
import { BotTypeProvider } from "../Context/BotTypeContext";
import { ChatsProvider } from "@/Context/ChatContext";
import SnackbarProvider from "@/Context/SnackbarContext";
import { LoginDialogProvider } from "@/Context/LoginDialogContextType";
import {
  
  createTheme,
} from "@mui/material";
import { ColorModeProvider, useColorMode } from "@/Context/ColorModeContext";

interface CookiesClientProviderProps {
  children: React.ReactNode;
}

export default function CookiesClientProvider({
  children,
}: CookiesClientProviderProps) {

  return (



    <CookiesProvider>
      <ColorModeProvider>
      <FirebaseProvider>
        <LoginDialogProvider>
        <ChatsProvider>
          <BotTypeProvider>
            <SnackbarProvider>{children}</SnackbarProvider>
          </BotTypeProvider>
        </ChatsProvider>
        </LoginDialogProvider>
      </FirebaseProvider>
      </ColorModeProvider>
    </CookiesProvider>
  );
}
