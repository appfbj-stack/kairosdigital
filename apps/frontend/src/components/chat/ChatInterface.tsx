"use client";

import { useEffect, useRef, useState } from "react";
import { streamChat } from "../../lib/api";
import { Button } from "@hermes/ui";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Msg {
  id: string;
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
}

const QUICK_COMMANDS = [
  "Crie um lead chamado João, telefone +5511999998888",
  "Quais contatos não falamos há 7 dias?",
  "Agende reunião amanhã às 14h com a Maria",
  "Mostre meu consumo de IA este mês",
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || streaming) return;
    const userMsg: Msg = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
    };
    const asstMsg: Msg = {
      id: `a-${Date.now()}`,
      role: "assistant",
      content: "",
      pending: true,
    };
    setMessages((m) => [...m, userMsg, asstMsg]);
    setInput("");
    setStreaming(true);

    try {
      for await (const chunk of streamChat({ message: text, conversationId })) {
        if (chunk.type === "delta") {
          setMessages((m) =>
            m.map((msg) =>
              msg.id === asstMsg.id ? { ...msg, content: msg.content + chunk.content } : msg
            )
          );
        } else if (chunk.type === "done") {
          setConversationId(chunk.conversationId);
          setMessages((m) => m.map((msg) => (msg.id === asstMsg.id ? { ...msg, pending: false } : msg)));
        } else if (chunk.type === "error") {
          setMessages((m) =>
            m.map((msg) =>
              msg.id === asstMsg.id
                ? { ...msg, content: `⚠️ ${chunk.message}`, pending: false }
                : msg
            )
          );
        }
      }
    } catch (err: any) {
      setMessages((m) =>
        m.map((msg) =>
          msg.id === asstMsg.id ? { ...msg, content: `⚠️ ${err.message}`, pending: false } : msg
        )
      );
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h1 className="text-lg font-semibold">Hermes</h1>
          <p className="text-xs text-slate-500">Converse com sua empresa</p>
        </div>
        {streaming && (
          <span className="inline-flex items-center gap-2 text-xs text-indigo-600">
            <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" /> pensando…
          </span>
        )}
      </header>

      <div ref={scrollRef} className="scrollbar-thin flex-1 overflow-y-auto px-4 py-6 sm:px-8">
        {messages.length === 0 ? (
          <EmptyState onPick={send} />
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            {messages.map((m) => (
              <MessageBubble key={m.id} msg={m} />
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="mx-auto flex max-w-3xl items-end gap-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Pergunte algo ou peça uma ação…"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
          />
          <Button type="submit" disabled={!input.trim() || streaming} loading={streaming}>
            Enviar
          </Button>
        </form>
      </footer>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white ${
          isUser ? "bg-slate-700" : "bg-indigo-600"
        }`}
      >
        {isUser ? "U" : "H"}
      </div>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-indigo-600 text-white"
            : "bg-white text-slate-900 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700"
        }`}
      >
        {isUser ? (
          msg.content
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content || (msg.pending ? "…" : "")}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (txt: string) => void }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-bold text-white">
        H
      </div>
      <div>
        <h2 className="text-2xl font-semibold">Como posso ajudar hoje?</h2>
        <p className="mt-1 text-sm text-slate-500">
          Peça em linguagem natural — eu cuido do CRM, agenda, WhatsApp, follow-ups e automações.
        </p>
      </div>
      <div className="grid w-full gap-2 sm:grid-cols-2">
        {QUICK_COMMANDS.map((cmd) => (
          <button
            key={cmd}
            onClick={() => onPick(cmd)}
            className="rounded-xl border border-slate-200 bg-white p-3 text-left text-sm text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
}
