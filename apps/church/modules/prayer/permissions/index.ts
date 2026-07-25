import { registerModule } from "@kairos/types";

export const prayerModule = registerModule({
  id: "prayer", name: "Oração", description: "Pedidos de oração e intercessão",
  icon: "HeartHandshake",
  routes: [
    { path: "/prayer", label: "Oração", component: "PrayerPage" },
    { path: "/prayer/new", label: "Novo Pedido", component: "NewPrayerPage" },
  ],
  permissions: [
    { action: "read", minRole: "member" },
    { action: "create", minRole: "member" },
    { action: "update", minRole: "leader" },
    { action: "delete", minRole: "pastor" },
    { action: "manage", minRole: "church_admin" },
  ],
  sidebar: [{ label: "Oração", href: "/prayer", icon: "HeartHandshake" }],
  dashboardWidgets: ["prayer-requests-count"],
  minRole: "member",
});
