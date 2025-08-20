import { useEffect, useRef, useState } from "react";

export const useAutoScroll = <T extends { sender: string }>(messages: T[], chatContainerRef: React.RefObject<HTMLDivElement | null>) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const userAvatarRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

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

  useEffect(() => {
    if (!chatContainerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsAtBottom(entry.isIntersecting);
      },
      {
        root: chatContainerRef.current,
        threshold: 1.0, // Changed threshold to 1.0
      }
    );

    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }

    return () => {
      if (bottomRef.current) {
        observer.unobserve(bottomRef.current);
      }
    };
  }, [chatContainerRef.current, bottomRef.current]);

  const lastUserMsgIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if ((messages[i] as any).sender === "user") return i;
    }
    return -1;
  })();

  return { bottomRef, userAvatarRef, lastUserMsgIndex, scrollToLastMessage, isAtBottom };
};


