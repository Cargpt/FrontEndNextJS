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



type ChatsContextType = {
  chats: Message[];
  addChat: (chat: Omit<Message, "id">) => void;
  setCars: React.Dispatch<React.SetStateAction<any[]>>;
  cars: any[];
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  updateFilter: (name: string, value: number | string | string[]) => void;
  filter: CarFilter;
setFilter: React.Dispatch<React.SetStateAction<CarFilter>>;
bookmark: any|null;
handleBookmark: (car: any) => void;

};

const ChatsContext = createContext<ChatsContextType | undefined>(undefined);

export const ChatsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [chats, setChats] = useState<Message[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [cookies] = useCookies(["selectedOption"]);
  const [bookmark, setBookmark] = useState<any>(null);
  const [filter, setFilter] = useState<CarFilter>(DEFAULTSEARCHPARAMS);

  const [cars, setCars] = useState<any[]>([]);
  const addChat = (chat: Omit<Message, "id">) => {
    setChats((prev) => [...prev, { id: Date.now().toString(), ...chat }]);
  };

 
const handleBookmark = (car: any) => {
  setBookmark(car)
}




  useEffect(() => {
  const selected = cookies.selectedOption ?? "I know exactly what I want";

  const initialChat: Message = {
    id: Date.now().toString(),
    message: selected,
    sender: "user",
    render: "text",
  };

  setMessages([initialChat]);
}, [cookies.selectedOption]);



   const updateFilter = (name: string, value: number | string | string[]) => {

    const newFilter = {
      ...filter,
      [name]:
        name === "budget" || name === "seat_capacity" ? Number(value) : value,
    }


    setFilter(newFilter);


  };

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
        setFilter,
        bookmark,
        handleBookmark
      
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
