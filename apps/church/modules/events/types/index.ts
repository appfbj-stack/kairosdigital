export type EventType = "service" | "event" | "meeting" | "retreat" | "other";

export interface ChurchEvent {
  id: string;
  churchId: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string | null;
  location: string | null;
  type: EventType;
  createdAt: string;
  createdBy: string;
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  service: "Culto",
  event: "Evento",
  meeting: "Reunião",
  retreat: "Retiro",
  other: "Outro",
};

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  service: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
  event: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
  meeting: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
  retreat: "bg-green-500/20 text-green-600 dark:text-green-400",
  other: "bg-gray-500/20 text-gray-500",
};
