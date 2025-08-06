"use client";

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useChats } from '@/Context/ChatContext';
import OptionsCard from '@/components/Chat/OptionsCard';

export default function ChatPage() {
  const { id } = useParams();
  const { setMessages, setFilter } = useChats();

  useEffect(() => {
    if (id) {
      const chats = JSON.parse(localStorage.getItem('chats') || '[]');
      const chat = chats.find((c: any) => String(c.id) === String(id));
      if (chat) {
        setMessages(chat.messages);
        if (chat.filter) setFilter(chat.filter);
      }
    }
  }, [id, setMessages, setFilter]);

  return <OptionsCard />;
}