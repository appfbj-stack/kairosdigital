import { registerModule } from "@kairos/types";

export const chatModule = registerModule({
  id: "chat",
  name: "Chat",
  description: "Comunicação em tempo real entre membros e líderes",
  icon: "MessageSquare",
  routes: [
    { path: "/chat", label: "Chat", component: "ChatPage" },
    { path: "/chat/[roomId]", label: "Sala", component: "ChatRoomPage" },
  ],
  permissions: [
    { action: "read", minRole: "member" },
    { action: "create", minRole: "member" },
    { action: "update", minRole: "leader" },
    { action: "delete", minRole: "pastor" },
    { action: "manage", minRole: "church_admin" },
  ],
  sidebar: [
    { label: "Chat", href: "/chat", icon: "MessageSquare" },
  ],
  dashboardWidgets: ["unread-messages-count"],
  minRole: "member",
});
