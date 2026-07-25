"use client";

import { useEffect, useRef } from "react";
import { MessageSquare, Sparkles } from "lucide-react";
import { MessageBubble } from "./message-bubble";
import type { ChatMessage } from "@kairos/chat/types";
import type { KairosVirtualMessage } from "./chat-area";

interface MessageListProps {
  messages: (ChatMessage | KairosVirtualMessage)[];
  currentUserId: string;
  isLoading: boolean;
  kairosLoading?: boolean;
}

function isKairos(msg: ChatMessage | KairosVirtualMessage): msg is KairosVirtualMessage {
  return "isKairos" in msg && msg.isKairos === true;
}

export function MessageList({ messages, currentUserId, isLoading, kairosLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, kairosLoading]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <div className="w-6 h-6 rounded-full border-2 border-current border-t-transparent animate-spin" />
          <span className="text-sm">Carregando mensagens...</span>
        </div>
      </div>
    );
  }

  if (messages.length === 0 && !kairosLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="mb-3 rounded-full bg-muted p-4">
          <MessageSquare className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold">Início da conversa</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Seja o primeiro a enviar uma mensagem!
        </p>
        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-primary" />
          Digite <strong className="text-primary">@kairos</strong> para acionar a assistente AI
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto py-4 flex flex-col">
      {messages.map((message, index) => {
        if (isKairos(message)) {
          return <KairosBubble key={message.id} message={message} />;
        }

        const prev = messages[index - 1];
        const showSender =
          !prev || isKairos(prev) || (prev as ChatMessage).senderId !== (message as ChatMessage).senderId;

        return (
          <MessageBubble
            key={message.id}
            message={message as ChatMessage}
            isMine={(message as ChatMessage).senderId === currentUserId}
            showSender={showSender}
          />
        );
      })}

      {/* Kairos está pensando... */}
      {kairosLoading && (
        <div className="flex gap-3 px-4 py-2 mt-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-primary">Kairos AI</span>
            <div className="bg-muted rounded-2xl rounded-bl-sm px-3 py-2">
              <div className="flex gap-1 items-center">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

function KairosBubble({ message }: { message: KairosVirtualMessage }) {
  return (
    <div className="flex gap-3 px-4 py-2 mt-2 bg-primary/5 border-l-2 border-primary/30">
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold text-primary">Kairos AI</span>
          <span className="text-xs text-muted-foreground bg-primary/10 rounded-full px-2 py-0.5">
            ✦ Só você vê isso
          </span>
        </div>
        <div className="text-sm whitespace-pre-wrap leading-relaxed text-foreground">
          {message.content}
        </div>
      </div>
    </div>
  );
}
