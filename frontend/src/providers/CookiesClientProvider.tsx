// app/providers/CookiesClientProvider.tsx
'use client'; // <-- This directive is crucial! It marks this file as a Client Component.

import { CookiesProvider } from 'react-cookie';
import React from 'react';
import { FirebaseProvider } from '../Context/FirebaseAuthContext';
import { BotTypeProvider } from '../Context/BotTypeContext';
import { ChatsProvider } from '@/Context/ChatContext';
import SnackbarProvider from '@/Context/SnackbarContext';

interface CookiesClientProviderProps {
  children: React.ReactNode;
}

export default function CookiesClientProvider({ children }: CookiesClientProviderProps) {
  return (
      <CookiesProvider>
        <FirebaseProvider>

            <ChatsProvider>
          <BotTypeProvider>
          <SnackbarProvider> 
      {children}
      </SnackbarProvider> 
      
      </BotTypeProvider>
      </ChatsProvider>
    </FirebaseProvider>
    </CookiesProvider>
  );
}