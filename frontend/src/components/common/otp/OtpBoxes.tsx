"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { Box, TextField } from "@mui/material";

export interface OtpBoxesProps {
  length?: number;
  value: string;
  onChange: (nextValue: string) => void;
  onComplete?: (code: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  gap?: number;
  useWebOtp?: boolean;
  autoReadClipboard?: boolean;
}

const OtpBoxes: React.FC<OtpBoxesProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  autoFocus = false,
  disabled = false,
  gap = 1,
  useWebOtp = true,
  autoReadClipboard = true,
}) => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const digits = useMemo(() => {
    const cleaned = (value || "").replace(/\D/g, "");
    return Array.from({ length }, (_, i) => cleaned[i] || "");
  }, [value, length]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  // Fire onComplete when all digits are filled
  useEffect(() => {
    const cleaned = (value || "").replace(/\D/g, "");
    if (onComplete && cleaned.length === length) {
      onComplete(cleaned);
    }
  }, [value, length, onComplete]);

  // Web OTP API: auto-read SMS code on supported browsers (Android Chrome)
  useEffect(() => {
    if (!useWebOtp) return;
    // @ts-ignore - feature detect safely
    const supportsWebOtp = typeof window !== "undefined" && "OTPCredential" in window;
    if (!supportsWebOtp) return;
    const ac = new AbortController();
    // @ts-ignore - OTPCredential types not in TS DOM lib yet for some setups
    (navigator as any).credentials
      ?.get({ otp: { transport: ["sms"] }, signal: ac.signal })
      .then((cred: any) => {
        const code: string | undefined = cred?.code;
        if (code) {
          onChange(code);
          if (onComplete) onComplete(code);
        }
      })
      .catch(() => {})
      .finally(() => {});
    return () => ac.abort();
  }, [useWebOtp, onChange, onComplete]);

  // Attempt to read from clipboard automatically (if allowed)
  useEffect(() => {
    if (!autoReadClipboard) return;
    if (typeof navigator === "undefined" || !navigator.clipboard?.readText) return;
    let cancelled = false;
    navigator.clipboard
      .readText()
      .then((text) => {
        if (cancelled || !text) return;
        const digitsOnly = (text.match(/\d+/g) || []).join("");
        if (digitsOnly.length >= length) {
          const code = digitsOnly.slice(0, length);
          onChange(code);
          if (onComplete) onComplete(code);
        }
      })
      .catch(() => {})
      .finally(() => {});
    return () => {
      cancelled = true;
    };
  }, [autoReadClipboard, length, onChange, onComplete]);

  const updateValue = (nextDigits: string[]) => {
    const nextValue = nextDigits.join("").slice(0, length);
    onChange(nextValue);
  };

  const handleChange = (index: number, char: string) => {
    const nextDigits = [...digits];
    const cleaned = char.replace(/\D/g, "");
    if (!cleaned) {
      nextDigits[index] = "";
      updateValue(nextDigits);
      return;
    }
    const chars = cleaned.split("");
    for (let offset = 0; offset < chars.length && index + offset < length; offset += 1) {
      nextDigits[index + offset] = chars[offset];
    }
    updateValue(nextDigits);

    const nextIndex = Math.min(index + chars.length, length - 1);
    const nextRef = inputRefs.current[nextIndex];
    if (nextRef) nextRef.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      const prevRef = inputRefs.current[index - 1];
      if (prevRef) prevRef.focus();
    }
  };

  const handlePaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    e.preventDefault();
    const nextDigits = [...digits];
    for (let i = 0; i < pasted.length && index + i < length; i += 1) {
      nextDigits[index + i] = pasted[i];
    }
    updateValue(nextDigits);
    const lastIndex = Math.min(index + pasted.length - 1, length - 1);
    const lastRef = inputRefs.current[lastIndex];
    if (lastRef) lastRef.focus();
  };

  return (
    <Box display="flex" gap={gap} justifyContent="center">
      {Array.from({ length }).map((_, idx) => (
        <TextField
          key={idx}
          inputRef={(el) => (inputRefs.current[idx] = el)}
          value={digits[idx]}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(idx, e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(idx, e)}
          onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => handlePaste(idx, e)}
          inputProps={{
            inputMode: "numeric",
            pattern: "[0-9]*",
            maxLength: 1,
            style: { textAlign: "center", fontSize: 18, width: 40 },
          }}
          disabled={disabled}
        />
      ))}
      {/* Hidden input to hint platform auto-fill (iOS etc.) */}
      <input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        aria-hidden="true"
        tabIndex={-1}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
      />
    </Box>
  );
};

export default OtpBoxes;


