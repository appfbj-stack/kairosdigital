export interface Ministry {
  id: string;
  churchId: string;
  name: string;
  description: string | null;
  leaderId: string | null;
  active: boolean;
  color: string;
  icon: string;
  createdAt: string;
  createdBy: string;
  leader?: { name: string };
  memberCount?: number;
}

export const MINISTRY_COLORS = [
  "#6366f1","#8b5cf6","#ec4899","#f43f5e","#f97316",
  "#eab308","#22c55e","#14b8a6","#0ea5e9","#3b82f6",
] as const;

export const MINISTRY_ICONS = [
  "Music","Mic2","BookOpen","HeartHandshake","Users",
  "Star","Cross","Church","Globe","Megaphone",
] as const;
