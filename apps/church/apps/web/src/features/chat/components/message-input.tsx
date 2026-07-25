"use client";

import { useState, useRef, type KeyboardEvent } from "react";
import { Send, Smile, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  roomName: string;
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function MessageInput({ roomName, onSend, disabled }: MessageInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  return (
    <div className="px-4 pb-4 pt-2">
      <div className="flex items-end gap-2 bg-muted rounded-xl px-3 py-2">
        <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <Paperclip className="w-4 h-4" />
        </button>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={`Mensagem em #${roomName}`}
          rows={1}
          disabled={disabled}
          className={cn(
            "flex-1 bg-transparent text-sm resize-none outline-none leading-relaxed py-1",
            "placeholder:text-muted-foreground max-h-40",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />

        <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <Smile className="w-4 h-4" />
        </button>

        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className={cn(
            "p-1.5 rounded-lg transition-colors shrink-0",
            value.trim() && !disabled
              ? "bg-primary text-primary-foreground hover:opacity-90"
              : "text-muted-foreground cursor-not-allowed"
          )}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-muted-foreground mt-1.5 px-1">
        Enter para enviar · Shift+Enter para nova linha
      </p>
    </div>
  );
}
