// app/providers/CookiesClientProvider.tsx
'use client'; // <-- This directive is crucial! It marks this file as a Client Component.

import { CookiesProvider } from 'react-cookie';
import React from 'react';
import { FirebaseProvider } from '../Context/FirebaseAuthContext';
import { BotTypeProvider } from '../Context/BotTypeContext';

interface CookiesClientProviderProps {
  children: React.ReactNode;
}

export default function CookiesClientProvider({ children }: CookiesClientProviderProps) {
  return (
      <CookiesProvider>
        <FirebaseProvider>
          <BotTypeProvider>
      {children}
      </BotTypeProvider>
    </FirebaseProvider>
    </CookiesProvider>
  );
}