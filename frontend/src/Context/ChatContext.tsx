// context/ChatsContext.tsx
import { DEFAULTSEARCHPARAMS } from "@/utils/services";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useCookies } from "react-cookie";

// export type ChatMessage = {
//   id: string;
//   message?: string; // optional if using a component
//   sender: 'user' | 'bot';
//   render?: 'brandModelSelect' | 'carOptions' | 'text' | 'selectOption' | 'flueOption' | 'bodyOption' |'transmissionOption' | 'brandOption'| 'selectedFilter' | 'recommendationOption';
//   data?: any; // used to pass props to component renders
// };

type ChatsContextType = {
  chats: Message[];
  addChat: (chat: Omit<Message, "id">) => void;
  setCars: React.Dispatch<React.SetStateAction<any[]>>;
  cars: any[];
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  updateFilter: (name: string, value: number | string) => void;
  filter: CarFilter;
};

const ChatsContext = createContext<ChatsContextType | undefined>(undefined);

export const ChatsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [chats, setChats] = useState<Message[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [cookies] = useCookies(["selectedOption"]);

  const [filter, setFilter] = useState<CarFilter>(DEFAULTSEARCHPARAMS);

  const [cars, setCars] = useState<any[]>([]);
  const addChat = (chat: Omit<Message, "id">) => {
    setChats((prev) => [...prev, { id: Date.now().toString(), ...chat }]);
  };

  const updateFilter = (name: string, value: number | string) => {
    setFilter((prev) => ({
      ...prev,
      [name]:
        name === "budget" || name === "seat_capacity" ? Number(value) : value,
    }));
  };

  useEffect(() => {
    if (cookies.selectedOption) {
      const initialChat: Message = {
        id: Date.now().toString(),
        message: cookies.selectedOption,
        sender: "user",
        render: "text",
      };
      setMessages([initialChat]);
    }
  }, [cookies.selectedOption]);

  return (
    <ChatsContext.Provider
      value={{
        chats,
        addChat,
        cars,
        setCars,
        messages,
        setMessages,
        filter,
        updateFilter,
      }}
    >
      {children}
    </ChatsContext.Provider>
  );
};

export const useChats = (): ChatsContextType => {
  const context = useContext(ChatsContext);
  if (!context) {
    throw new Error("useChats must be used within a ChatsProvider");
  }
  return context;
};
