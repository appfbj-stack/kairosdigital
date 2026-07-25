import { registerModule } from "@kairos/types";

export const ministriesModule = registerModule({
  id: "ministries", name: "Ministérios", description: "Grupos e ministérios da igreja",
  icon: "Church",
  routes: [
    { path: "/ministries", label: "Ministérios", component: "MinistriesPage" },
    { path: "/ministries/new", label: "Novo Ministério", component: "NewMinistryPage" },
    { path: "/ministries/[id]", label: "Ministério", component: "MinistryDetailPage" },
  ],
  permissions: [
    { action: "read", minRole: "member" },
    { action: "create", minRole: "pastor" },
    { action: "update", minRole: "leader" },
    { action: "delete", minRole: "pastor" },
    { action: "manage", minRole: "church_admin" },
  ],
  sidebar: [{ label: "Ministérios", href: "/ministries", icon: "Church" }],
  dashboardWidgets: ["ministries-count"],
  minRole: "member",
});
