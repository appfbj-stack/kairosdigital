import { registerModule } from "@kairos/types";

export const membersModule = registerModule({
  id: "members",
  name: "Membros",
  description: "Gestão completa de membros da igreja",
  icon: "Users",
  routes: [
    { path: "/members", label: "Lista de Membros", component: "MembersPage" },
    { path: "/members/[id]", label: "Perfil do Membro", component: "MemberProfilePage" },
    { path: "/members/new", label: "Novo Membro", component: "NewMemberPage" },
  ],
  permissions: [
    { action: "read", minRole: "member" },
    { action: "create", minRole: "leader" },
    { action: "update", minRole: "leader" },
    { action: "delete", minRole: "pastor" },
    { action: "manage", minRole: "church_admin" },
  ],
  sidebar: [
    { label: "Todos os Membros", href: "/members", icon: "Users" },
    { label: "Batizados", href: "/members?filter=baptized", icon: "Droplets" },
    { label: "Visitantes", href: "/members?filter=visitor", icon: "UserPlus" },
  ],
  dashboardWidgets: ["members-count", "new-members-chart", "birthday-widget"],
  minRole: "member",
});
