import { useEffect, useRef, useState, useCallback } from "react";

export const useAutoScroll = <T extends { sender: string }>(messages: T[], chatContainerRef: React.RefObject<HTMLDivElement | null>) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const userAvatarRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToLastMessage = () => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      if (userAvatarRef.current) {
        const avatarRect = userAvatarRef.current.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const scrollPos = avatarRect.top - containerRect.top + container.scrollTop - 80;
        container.scrollTo({ top: scrollPos, behavior: "smooth" });
      } else if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      }
      
      // Ensure state is updated after smooth scrolling completes
      setTimeout(() => {
        if (chatContainerRef.current) {
          const container = chatContainerRef.current;
          const scrollTop = container.scrollTop;
          const scrollHeight = container.scrollHeight;
          const clientHeight = container.clientHeight;
          const isAtBottomNow = Math.abs((scrollTop + clientHeight) - scrollHeight) <= 20;
          setIsAtBottom(isAtBottomNow);
        }
      }, 300);
    }
  };

  useEffect(() => {
    scrollToLastMessage();
  }, [messages]);

  // Debounced scroll handler for better performance
  const debouncedCheckIfAtBottom = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      if (!chatContainerRef.current) return;
      
      const container = chatContainerRef.current;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      
      // Consider "at bottom" if within 20px of the bottom
      const isAtBottomNow = Math.abs((scrollTop + clientHeight) - scrollHeight) <= 20;
      setIsAtBottom(isAtBottomNow);
    }, 100);
  }, []);

  useEffect(() => {
    if (!chatContainerRef.current) return;

    const container = chatContainerRef.current;
    
    // Function to check if we're at the bottom
    const checkIfAtBottom = () => {
      if (!container) return;
      
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      
      // Consider "at bottom" if within 20px of the bottom
      const isAtBottomNow = Math.abs((scrollTop + clientHeight) - scrollHeight) <= 20;
      setIsAtBottom(isAtBottomNow);
    };

    // Add scroll event listener for more accurate detection
    container.addEventListener('scroll', debouncedCheckIfAtBottom, { passive: true });
    
    // Also check on resize
    const resizeObserver = new ResizeObserver(debouncedCheckIfAtBottom);
    resizeObserver.observe(container);

    // Watch for content changes that might affect scroll height
    const mutationObserver = new MutationObserver(debouncedCheckIfAtBottom);
    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false
    });

    // IntersectionObserver as backup with lower threshold
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsAtBottom(true);
        }
      },
      {
        root: chatContainerRef.current,
        threshold: 0.1,
        rootMargin: '0px 0px -20px 0px',
      }
    );

    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }

    // Initial check
    checkIfAtBottom();

    return () => {
      container.removeEventListener('scroll', debouncedCheckIfAtBottom);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      if (bottomRef.current) {
        observer.unobserve(bottomRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [chatContainerRef.current, bottomRef.current, debouncedCheckIfAtBottom]);

  const lastUserMsgIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if ((messages[i] as any).sender === "user") return i;
    }
    return -1;
  })();

  return { bottomRef, userAvatarRef, lastUserMsgIndex, scrollToLastMessage, isAtBottom };
};
