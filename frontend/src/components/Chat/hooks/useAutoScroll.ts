import { useEffect, useRef } from "react";

export const useAutoScroll = <T extends { sender: string }>(messages: T[], chatContainerRef: React.RefObject<HTMLDivElement | null>) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const userAvatarRef = useRef<HTMLDivElement | null>(null);

  const scrollToLastMessage = () => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      if (userAvatarRef.current) {
        const avatarRect = userAvatarRef.current.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const scrollPos = avatarRect.top - containerRect.top + container.scrollTop - 80; // Adjust 80 as needed for padding/offset
        container.scrollTo({ top: scrollPos, behavior: "smooth" });
      } else if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      }
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


