"use client";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Send, Loader2, Bot, User } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { cn, formatDate } from "@/lib/utils";

interface Message { id: string; from: "user" | "bot"; text: string; timestamp: Date; }

export function ChatWidget() {
  const { tenant } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tenant) return;
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";
    const socket = io(wsUrl, { transports: ["websocket"], auth: { token: document.cookie.split("; ").find(r => r.startsWith("token="))?.split("=")[1] } });
    socketRef.current = socket;

    socket.emit("join", { tenantId: tenant.id });
    socket.on("bot-response", (data: { text: string }) => {
      setMessages(m => [...m, { id: Date.now().toString(), from: "bot", text: data.text, timestamp: new Date() }]);
    });

    return () => { socket.disconnect(); };
  }, [tenant]);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !socketRef.current || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    setMessages(m => [...m, { id: Date.now().toString(), from: "user", text, timestamp: new Date() }]);
    socketRef.current.emit("user-message", { text });
    setSending(false);
  };

  return (
    <div className="flex flex-col h-[500px] bg-white dark:bg-gray-800 border rounded-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {messages.map((m) => (
          <div key={m.id} className={cn("flex", m.from === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[70%] px-3 py-2 rounded-2xl", m.from === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none")}>
              <p className="text-sm">{m.text}</p>
              <span className="text-xs opacity-60 mt-1 block text-right">{formatDate(m.timestamp)}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t p-3 flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} placeholder="Digite sua mensagem..." className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={sending} />
        <button onClick={handleSend} disabled={sending || !input.trim()} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}