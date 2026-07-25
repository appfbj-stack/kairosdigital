import { registerModule } from "@kairos/types";

export const financeModule = registerModule({
  id: "finance",
  name: "Finanças",
  description: "Gestão financeira da igreja — dízimos, ofertas e despesas",
  icon: "DollarSign",
  routes: [
    { path: "/finance", label: "Finanças", component: "FinancePage" },
    { path: "/finance/new", label: "Nova Transação", component: "NewTransactionPage" },
  ],
  permissions: [
    { action: "read", minRole: "pastor" },
    { action: "create", minRole: "pastor" },
    { action: "update", minRole: "church_admin" },
    { action: "delete", minRole: "church_admin" },
    { action: "manage", minRole: "church_admin" },
  ],
  sidebar: [
    { label: "Finanças", href: "/finance", icon: "DollarSign" },
  ],
  dashboardWidgets: ["finance-summary", "income-chart"],
  minRole: "pastor",
});
