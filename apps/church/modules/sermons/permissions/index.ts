import { registerModule } from "@kairos/types";

export const sermonsModule = registerModule({
  id: "sermons", name: "Sermões", description: "Pregações, séries e esboços",
  icon: "Mic2",
  routes: [
    { path: "/sermons", label: "Sermões", component: "SermonsPage" },
    { path: "/sermons/new", label: "Novo Sermão", component: "NewSermonPage" },
    { path: "/sermons/[id]", label: "Sermão", component: "SermonDetailPage" },
  ],
  permissions: [
    { action: "read", minRole: "member" },
    { action: "create", minRole: "pastor" },
    { action: "update", minRole: "pastor" },
    { action: "delete", minRole: "church_admin" },
    { action: "manage", minRole: "church_admin" },
  ],
  sidebar: [{ label: "Sermões", href: "/sermons", icon: "Mic2" }],
  dashboardWidgets: ["latest-sermon"],
  minRole: "member",
});
