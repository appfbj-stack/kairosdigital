import { registerModule } from "@kairos/types";

export const eventsModule = registerModule({
  id: "events", name: "Eventos", description: "Agenda e eventos da igreja",
  icon: "Calendar",
  routes: [
    { path: "/events", label: "Eventos", component: "EventsPage" },
    { path: "/events/new", label: "Novo Evento", component: "NewEventPage" },
    { path: "/events/[id]", label: "Evento", component: "EventDetailPage" },
  ],
  permissions: [
    { action: "read", minRole: "member" },
    { action: "create", minRole: "leader" },
    { action: "update", minRole: "leader" },
    { action: "delete", minRole: "pastor" },
    { action: "manage", minRole: "church_admin" },
  ],
  sidebar: [{ label: "Eventos", href: "/events", icon: "Calendar" }],
  dashboardWidgets: ["upcoming-events"],
  minRole: "member",
});
