import { registerModule } from "@kairos/types";

export const cellsModule = registerModule({
  id: "cells",
  name: "Células",
  description: "Gestão de grupos e células da igreja",
  icon: "CircleDot",
  routes: [
    { path: "/cells", label: "Células", component: "CellsPage" },
    { path: "/cells/new", label: "Nova Célula", component: "NewCellPage" },
    { path: "/cells/[id]", label: "Célula", component: "CellDetailPage" },
  ],
  permissions: [
    { action: "read", minRole: "member" },
    { action: "create", minRole: "pastor" },
    { action: "update", minRole: "leader" },
    { action: "delete", minRole: "pastor" },
    { action: "manage", minRole: "church_admin" },
  ],
  sidebar: [
    { label: "Células", href: "/cells", icon: "CircleDot" },
  ],
  dashboardWidgets: ["cells-count", "attendance-chart"],
  minRole: "member",
});
