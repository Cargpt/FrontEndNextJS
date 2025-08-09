import { useEffect, useRef } from "react";

export const useAutoScroll = <T extends { sender: string }>(messages: T[]) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const userAvatarRef = useRef<HTMLDivElement | null>(null);

  const scrollToLastMessage = () => {
    if (userAvatarRef.current) {
      const rect = userAvatarRef.current.getBoundingClientRect();
      const scrollY = window.scrollY + rect.top - 80;
      window.scrollTo({ top: scrollY, behavior: "smooth" });
    } else if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  useEffect(() => {
    scrollToLastMessage();
  }, [messages]);

  const lastUserMsgIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if ((messages[i] as any).sender === "user") return i;
    }
    return -1;
  })();

  return { bottomRef, userAvatarRef, lastUserMsgIndex, scrollToLastMessage };
};


