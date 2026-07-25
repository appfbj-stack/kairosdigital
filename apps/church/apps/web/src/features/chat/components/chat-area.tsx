"use client";

import { useState } from "react";
import { Hash, Users, Settings, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";
import { useMessages, useSendMessage } from "../hooks/use-messages";
import type { ChatRoom } from "@kairos/chat/types";
import type { ChatMessage } from "@kairos/chat/types";

export interface KairosVirtualMessage {
  id: string;
  content: string;
  createdAt: string;
  isKairos: true;
}

interface ChatAreaProps {
  room: ChatRoom;
  currentUserId: string;
  churchName?: string | undefined;
  userName?: string | undefined;
  userRole?: string | undefined;
}

const KAIROS_TRIGGER = /^@kairos\s+/i;

export function ChatArea({ room, currentUserId, churchName, userName, userRole }: ChatAreaProps) {
  const { data: messages = [], isLoading } = useMessages(room.id);
  const sendMessage = useSendMessage(room.id);
  const [kairosMessages, setKairosMessages] = useState<KairosVirtualMessage[]>([]);
  const [kairosLoading, setKairosLoading] = useState(false);

  const handleSend = async (content: string) => {
    // Envia mensagem normal
    sendMessage.mutate(content, {
      onError: (err) => toast.error(err instanceof Error ? err.message : "Erro ao enviar mensagem"),
    });

    // Detecta @kairos
    const match = content.match(KAIROS_TRIGGER);
    if (!match) return;

    const question = content.replace(KAIROS_TRIGGER, "").trim();
    if (!question) return;

    setKairosLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: question }],
          context: { churchName, userRole },
          module: "chat",
        }),
      });

      const data = await res.json() as { content?: string; error?: string };

      const virtualMsg: KairosVirtualMessage = {
        id: `kairos-${Date.now()}`,
        content: data.content ?? "Não consegui processar sua pergunta. Tente novamente.",
        createdAt: new Date().toISOString(),
        isKairos: true,
      };

      setKairosMessages((prev) => [...prev, virtualMsg]);
    } catch {
      toast.error("Kairos AI indisponível no momento");
    } finally {
      setKairosLoading(false);
    }
  };

  // Mescla mensagens reais com respostas virtuais da Kairos
  const allMessages = mergeMessages(messages, kairosMessages);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background shrink-0">
        <div className="flex items-center gap-2">
          <Hash className="w-5 h-5 text-muted-foreground" />
          <span className="font-semibold">{room.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            title="Digite @kairos [pergunta] para acionar a IA"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-primary/30 bg-primary/5 text-xs text-primary font-medium cursor-default select-none"
          >
            <Sparkles className="w-3 h-3" />
            @kairos
          </div>
          <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <Users className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <MessageList
        messages={allMessages}
        currentUserId={currentUserId}
        isLoading={isLoading}
        kairosLoading={kairosLoading}
      />

      {/* Input */}
      <MessageInput
        roomName={room.name}
        onSend={(content) => void handleSend(content)}
        disabled={sendMessage.isPending || kairosLoading}
      />
    </div>
  );
}

// Mescla mensagens do DB com respostas virtuais da Kairos por ordem de tempo
function mergeMessages(
  real: ChatMessage[],
  virtual: KairosVirtualMessage[]
): (ChatMessage | KairosVirtualMessage)[] {
  const all: (ChatMessage | KairosVirtualMessage)[] = [...real, ...virtual];
  all.sort((a, b) => {
    const ta = "createdAt" in a ? a.createdAt : "";
    const tb = "createdAt" in b ? b.createdAt : "";
    return ta.localeCompare(tb);
  });
  return all;
}
