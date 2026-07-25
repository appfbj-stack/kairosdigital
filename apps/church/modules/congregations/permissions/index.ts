export const CONGREGATION_PERMISSIONS = {
  "congregations:read": { label: "Ver congregações", roles: ["super_admin", "church_admin", "pastor", "leader"] },
  "congregations:write": { label: "Criar/Editar congregações", roles: ["super_admin", "church_admin"] },
  "congregations:delete": { label: "Excluir congregações", roles: ["super_admin"] },
} as const;
