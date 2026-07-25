export interface Cell {
  id: string;
  churchId: string;
  name: string;
  leaderId: string;
  meetingDay: string;
  meetingTime: string;
  address: string | null;
  active: boolean;
  createdAt: string;
  createdBy: string;
  leader?: { name: string };
}

export interface CreateCellInput {
  name: string;
  leaderId: string;
  meetingDay: string;
  meetingTime: string;
  address?: string;
}

export const MEETING_DAYS = [
  "Segunda-feira", "Terça-feira", "Quarta-feira",
  "Quinta-feira", "Sexta-feira", "Sábado", "Domingo",
] as const;
