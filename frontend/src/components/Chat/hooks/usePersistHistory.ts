import { useEffect, useRef } from "react";
import { axiosInstance1 } from "@/utils/axiosInstance";
import { Message } from "@/Context/ChatContext";
import { useCookies } from "react-cookie";

/**
 * Persists chat history whenever messages change.
 * - title: first user message's text (fallback to JSON of message if not a string)
 * - value: full messages array stringified
 * - deduped by signature to avoid redundant network calls
 */
export function usePersistHistory(
  messages: Message[],
  options?: {
    endpoint?: string; // default '/api/cargpt/history/'
    buildKey?: (firstUserMessage: Message | null) => string | null; // backwards-compatible naming
    isEnabled?: boolean;
  }
) {
  const lastSignatureRef = useRef<string>("");
const [cookies]=useCookies(['token', 'user'])
  useEffect(() => {
    if(!cookies.token) return
    if (!messages || messages.length === 0) return;
    if (options?.isEnabled === false) return;

    // Find the first user message in the list
    let firstUserMessage: Message | null = null;
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].sender === "user") {
        firstUserMessage = messages[i];
        break;
      }
    }

    if (!firstUserMessage) return;

    const title = options?.buildKey
      ? options.buildKey(firstUserMessage)
      : typeof firstUserMessage.message === "string"
      ? (firstUserMessage.message as string)
      : JSON.stringify(firstUserMessage.message ?? {});

    if (!title) return;

    const payloadString = JSON.stringify(messages);
    const signature = `${title}|${payloadString.length}`; // cheap signature to avoid tight loops
    if (signature === lastSignatureRef.current) return;
    lastSignatureRef.current = signature;

    const endpoint = options?.endpoint ?? "/api/cargpt/history/";

    // Fire-and-forget; swallow errors to avoid UI noise
    axiosInstance1
      .post(endpoint, { title, value: payloadString })
      .catch(() => {
        /* ignore */
      });
  }, [messages, options?.endpoint, options?.buildKey, options?.isEnabled, cookies.token, cookies.user]);
}


