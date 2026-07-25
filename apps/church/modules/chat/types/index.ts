export type RoomType = "general" | "ministry" | "cell" | "direct";

export interface ChatRoom {
  id: string;
  churchId: string;
  name: string;
  type: RoomType;
  description?: string;
  createdAt: string;
  createdBy: string;
  memberCount?: number;
  lastMessage?: ChatMessage;
}

export interface ChatMessage {
  id: string;
  churchId: string;
  roomId: string;
  senderId: string;
  content: string;
  type: "text" | "image" | "audio" | "file";
  mediaUrl?: string | null;
  createdAt: string;
  sender?: MessageSender;
  reactions?: MessageReaction[];
}

export interface MessageSender {
  id: string;
  name: string;
  avatarUrl?: string | null;
  role: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  userIds: string[];
}
