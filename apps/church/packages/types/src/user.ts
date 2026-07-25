export type UserRole = "super_admin" | "church_admin" | "pastor" | "leader" | "member" | "visitor";
export type Permission = "create" | "read" | "update" | "delete" | "manage";

export interface KairosUser {
  id: string;
  churchId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 100,
  church_admin: 80,
  pastor: 60,
  leader: 40,
  member: 20,
  visitor: 0,
};

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
