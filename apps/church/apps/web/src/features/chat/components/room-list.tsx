"use client";

import { Hash, Plus, Volume2, Lock, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatRoom, RoomType } from "@kairos/chat/types";

const roomIcons: Record<RoomType, typeof Hash> = {
  general: Hash,
  ministry: Volume2,
  cell: MessageSquare,
  direct: Lock,
};

interface RoomListProps {
  rooms: ChatRoom[];
  activeRoomId: string | null;
  onSelectRoom: (room: ChatRoom) => void;
  onCreateRoom: () => void;
}

export function RoomList({ rooms, activeRoomId, onSelectRoom, onCreateRoom }: RoomListProps) {
  const grouped = {
    general: rooms.filter((r) => r.type === "general"),
    ministry: rooms.filter((r) => r.type === "ministry"),
    cell: rooms.filter((r) => r.type === "cell"),
    direct: rooms.filter((r) => r.type === "direct"),
  };

  const groupLabels: Record<RoomType, string> = {
    general: "GERAL",
    ministry: "MINISTÉRIOS",
    cell: "CÉLULAS",
    direct: "MENSAGENS DIRETAS",
  };

  return (
    <aside className="w-60 flex flex-col bg-sidebar border-r border-sidebar-border shrink-0">
      <div className="px-4 py-4 border-b border-sidebar-border">
        <h2 className="text-sm font-bold text-sidebar-foreground">Chat da Igreja</h2>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {(Object.keys(grouped) as RoomType[]).map((type) => {
          const list = grouped[type];
          if (list.length === 0) return null;
          const Icon = roomIcons[type];

          return (
            <div key={type} className="mb-4">
              <div className="flex items-center justify-between px-4 mb-1">
                <span className="text-xs font-semibold text-sidebar-foreground/50 tracking-wider">
                  {groupLabels[type]}
                </span>
                {type === "general" && (
                  <button
                    onClick={onCreateRoom}
                    className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {list.map((room) => (
                <button
                  key={room.id}
                  onClick={() => onSelectRoom(room)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-1.5 mx-1 rounded-md text-sm transition-colors",
                    "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                    activeRoomId === room.id && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{room.name}</span>
                </button>
              ))}
            </div>
          );
        })}
      </nav>

      <button
        onClick={onCreateRoom}
        className="flex items-center gap-2 px-4 py-3 border-t border-sidebar-border text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
      >
        <Plus className="w-4 h-4" />
        Nova sala
      </button>
    </aside>
  );
}
