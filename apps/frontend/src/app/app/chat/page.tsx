"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import useSWR from "swr";
import { apiFetch, streamChat } from "../../../lib/api";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// ── Types ────────────────────────────────────────────────────────────────────

interface Contact {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

interface Conversation {
  id: string;
  status: string;
  lastMessageAt: string | null;
  contact: Contact;
}

interface Message {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
  status?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const fetcher = (url: string) => apiFetch<{ items: Conversation[] }>(url).then((r) => r?.items ?? []);
const msgFetcher = (url: string) => apiFetch<{ items: Message[] }>(url).then((r) => r?.items ?? []);

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function timeAgo(date: string | null) {
  if (!date) return "";
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
  } catch {
    return "";
  }
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Conversations list — refresh every 5s to catch incoming WhatsApp messages
  const { data: conversations = [], mutate: reloadConversations } = useSWR(
    "/conversations",
    fetcher,
    { refreshInterval: 5000 }
  );

  // Messages for selected conversation — refresh every 3s
  const { data: messages = [], mutate: reloadMessages } = useSWR(
    selectedId ? `/conversations/${selectedId}/messages` : null,
    msgFetcher,
    { refreshInterval: 3000 }
  );

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamBuffer]);

  // Filter conversations by search
  const filtered = conversations.filter((c) =>
    c.contact.name.toLowerCase().includes(search.toLowerCase())
  );

  // Send message via SSE stream
  const sendMessage = useCallback(async () => {
    if (!input.trim() || !selectedId || streaming) return;
    const text = input.trim();
    setInput("");
    setStreaming(true);
    setStreamBuffer("");

    try {
      for await (const chunk of streamChat({
        message: text,
        conversationId: selectedId,
      })) {
        if (chunk?.type === "content" && chunk?.content) {
          setStreamBuffer((prev) => prev + chunk.content);
        }
      }
    } catch (err) {
      console.error("[chat] stream error", err);
    } finally {
      setStreaming(false);
      setStreamBuffer("");
      reloadMessages();
      reloadConversations();
    }
  }, [input, selectedId, streaming, reloadMessages, reloadConversations]);

  // Send on Enter (Shift+Enter = new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectedConv = conversations.find((c) => c.id === selectedId);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white">
      {/* ── Sidebar ── */}
      <aside className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 mb-3">Conversas</h1>
          <input
            type="text"
            placeholder="Buscar contato…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">
              Nenhuma conversa encontrada
            </div>
          ) : (
            filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                  selectedId === conv.id ? "bg-green-50 border-l-4 border-l-green-500" : ""
                }`}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-green-700 font-semibold text-sm">
                  {conv.contact.avatarUrl ? (
                    <img
                      src={conv.contact.avatarUrl}
                      alt={conv.contact.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    initials(conv.contact.name)
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {conv.contact.name}
                    </span>
                    <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                      {timeAgo(conv.lastMessageAt)}
                    </span>
                  </div>
                  <span
                    className={`text-xs mt-0.5 inline-block px-1.5 py-0.5 rounded-full ${
                      conv.status === "OPEN"
                        ? "bg-green-100 text-green-700"
                        : conv.status === "RESOLVED"
                        ? "bg-gray-100 text-gray-600"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {conv.status}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ── Chat Area ── */}
      {selectedId ? (
        <main className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-200 bg-white shadow-sm">
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm">
              {selectedConv ? initials(selectedConv.contact.name) : "?"}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                {selectedConv?.contact.name ?? "Carregando…"}
              </p>
              <p className="text-xs text-gray-500">
                {selectedConv?.status ?? ""}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "USER" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words shadow-sm ${
                    msg.role === "USER"
                      ? "bg-green-500 text-white rounded-br-sm"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                  <div
                    className={`text-[10px] mt-1 text-right ${
                      msg.role === "USER" ? "text-green-100" : "text-gray-400"
                    }`}
                  >
                    {msg.createdAt
                      ? new Date(msg.createdAt).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </div>
                </div>
              </div>
            ))}

            {/* Streaming preview */}
            {streaming && streamBuffer && (
              <div className="flex justify-start">
                <div className="max-w-[70%] px-4 py-2 rounded-2xl text-sm bg-white border border-gray-200 rounded-bl-sm text-gray-800 opacity-70 whitespace-pre-wrap">
                  {streamBuffer}
                  <span className="inline-block w-1 h-4 bg-gray-400 ml-1 animate-pulse" />
                </div>
              </div>
            )}

            {streaming && !streamBuffer && (
              <div className="flex justify-start">
                <div className="px-4 py-2 rounded-2xl bg-white border border-gray-200 rounded-bl-sm">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-6 py-4 border-t border-gray-200 bg-white flex gap-3 items-end">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite uma mensagem (Enter para enviar)…"
              disabled={streaming}
              className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 max-h-32 overflow-y-auto"
            />
            <button
              onClick={sendMessage}
              disabled={streaming || !input.trim()}
              className="px-4 py-2.5 bg-green-500 text-white rounded-xl font-medium text-sm hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              {streaming ? "…" : "Enviar"}
            </button>
          </div>
        </main>
      ) : (
        // Empty state
        <main className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
          <div className="text-5xl mb-4">💬</div>
          <p className="text-lg font-medium text-gray-600">
            Selecione uma conversa
          </p>
          <p className="text-sm mt-1">
            Escolha uma conversa na lista para começar
          </p>
        </main>
      )}
    </div>
  );
}
