export type PrayerStatus = "open" | "answered" | "closed";

export interface PrayerRequest {
  id: string;
  churchId: string;
  memberId: string | null;
  title: string;
  description: string;
  status: PrayerStatus;
  isAnonymous: boolean;
  createdAt: string;
  createdBy: string;
  member?: { name: string; avatarUrl?: string | null } | null;
}

export const PRAYER_STATUS_LABELS: Record<PrayerStatus, string> = {
  open: "Aberto",
  answered: "Respondido",
  closed: "Encerrado",
};

export const PRAYER_STATUS_COLORS: Record<PrayerStatus, string> = {
  open: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
  answered: "bg-green-500/20 text-green-600 dark:text-green-400",
  closed: "bg-gray-500/20 text-gray-500",
};
