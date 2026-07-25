import type { UserRole, Permission } from "./user";

export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  routes: ModuleRoute[];
  permissions: ModulePermission[];
  sidebar: SidebarItem[];
  dashboardWidgets: string[];
  minRole: UserRole;
}

export interface ModuleRoute {
  path: string;
  label: string;
  component: string;
}

export interface ModulePermission {
  action: Permission;
  minRole: UserRole;
}

export interface SidebarItem {
  label: string;
  href: string;
  icon: string;
}

export function registerModule(definition: ModuleDefinition): ModuleDefinition {
  return definition;
}
