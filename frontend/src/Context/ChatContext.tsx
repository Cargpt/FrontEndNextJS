// context/ChatsContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ChatMessage = {
  id: string;
  message?: string; // optional if using a component
  sender: 'user' | 'bot';
  render?: 'brandModelSelect' | 'carOptions' | 'text';
  data?: any; // used to pass props to component renders
};

type ChatsContextType = {
  chats: ChatMessage[];
  addChat: (chat: Omit<ChatMessage, 'id'>) => void;
};

const ChatsContext = createContext<ChatsContextType | undefined>(undefined);

export const ChatsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<ChatMessage[]>([]);

  const addChat = (chat: Omit<ChatMessage, 'id'>) => {
    setChats(prev => [...prev, { id: Date.now().toString(), ...chat }]);
  };

  return (
    <ChatsContext.Provider value={{ chats, addChat }}>
      {children}
    </ChatsContext.Provider>
  );
};

export const useChats = (): ChatsContextType => {
  const context = useContext(ChatsContext);
  if (!context) {
    throw new Error('useChats must be used within a ChatsProvider');
  }
  return context;
};
