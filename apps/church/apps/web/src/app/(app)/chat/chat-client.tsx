"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { RoomList } from "@/features/chat/components/room-list";
import { ChatArea } from "@/features/chat/components/chat-area";
import { CreateRoomModal } from "@/features/chat/components/create-room-modal";
import { useRooms } from "@/features/chat/hooks/use-rooms";
import type { ChatRoom } from "@kairos/chat/types";

interface ChatClientProps {
  currentUserId: string;
  churchName?: string;
  userName?: string;
  userRole?: string;
}

export function ChatClient({ currentUserId, churchName, userName, userRole }: ChatClientProps) {
  const { data: rooms = [], isLoading } = useRooms();
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full -m-6 overflow-hidden rounded-xl border">
        <RoomList
          rooms={rooms}
          activeRoomId={activeRoom?.id ?? null}
          onSelectRoom={setActiveRoom}
          onCreateRoom={() => setShowCreateModal(true)}
        />

        {activeRoom ? (
          <ChatArea
            room={activeRoom}
            currentUserId={currentUserId}
            churchName={churchName}
            userName={userName}
            userRole={userRole}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="mb-4 rounded-full bg-muted p-5">
              <MessageSquare className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold">Bem-vindo ao Chat</h2>
            <p className="text-muted-foreground text-sm mt-2 max-w-xs">
              Selecione uma sala para começar a conversar ou crie uma nova sala.
            </p>
            {rooms.length === 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Criar primeira sala
              </button>
            )}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateRoomModal onClose={() => setShowCreateModal(false)} />
      )}
    </>
  );
}
