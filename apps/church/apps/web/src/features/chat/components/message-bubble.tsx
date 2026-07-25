"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@kairos/chat/types";

interface MessageBubbleProps {
  message: ChatMessage;
  isMine: boolean;
  showSender: boolean;
}

const roleColors: Record<string, string> = {
  church_admin: "text-yellow-400",
  pastor: "text-purple-400",
  leader: "text-blue-400",
  member: "text-foreground",
  visitor: "text-muted-foreground",
};

const roleLabels: Record<string, string> = {
  church_admin: "Admin",
  pastor: "Pastor",
  leader: "Líder",
  member: "Membro",
  visitor: "Visitante",
};

export function MessageBubble({ message, isMine, showSender }: MessageBubbleProps) {
  const timeAgo = formatDistanceToNow(new Date(message.createdAt), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <div className={cn("flex gap-3 px-4 py-1 group hover:bg-muted/20 transition-colors", showSender && "mt-3")}>
      {!isMine && (
        <div className="shrink-0 mt-0.5">
          {showSender ? (
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
              {message.sender?.name[0]?.toUpperCase() ?? "?"}
            </div>
          ) : (
            <div className="w-8 h-8" />
          )}
        </div>
      )}

      <div className={cn("flex-1", isMine && "flex flex-col items-end")}>
        {showSender && !isMine && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className={cn("text-sm font-semibold", roleColors[message.sender?.role ?? "member"])}>
              {message.sender?.name ?? "Usuário"}
            </span>
            <span className="text-xs text-muted-foreground">
              {roleLabels[message.sender?.role ?? "member"]}
            </span>
            <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              {timeAgo}
            </span>
          </div>
        )}

        <div
          className={cn(
            "px-3 py-2 rounded-2xl text-sm max-w-md break-words",
            isMine
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-muted rounded-bl-sm"
          )}
        >
          {message.content}
        </div>

        {isMine && (
          <span className="text-xs text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {timeAgo}
          </span>
        )}
      </div>

      {isMine && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0 mt-0.5">
          {message.sender?.name[0]?.toUpperCase() ?? "?"}
        </div>
      )}
    </div>
  );
}
