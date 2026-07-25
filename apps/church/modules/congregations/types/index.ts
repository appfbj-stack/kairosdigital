export type CongregationStatus = "active" | "inactive";

export interface Congregation {
  id: string;
  churchId: string;
  name: string;
  pastorName: string;
  pastorEmail: string | null;
  pastorPhone: string | null;
  patrimonio: string | null;
  memberCount: number;
  address: string | null;
  status: CongregationStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CreateCongregationInput {
  name: string;
  pastorName: string;
  pastorEmail?: string;
  pastorPhone?: string;
  patrimonio?: string;
  address?: string;
}

export interface UpdateCongregationInput extends Partial<CreateCongregationInput> {
  status?: CongregationStatus;
}

export const CONGREGATION_STATUS_LABELS: Record<CongregationStatus, string> = {
  active: "Ativa",
  inactive: "Inativa",
};

export const CONGREGATION_STATUS_COLORS: Record<CongregationStatus, string> = {
  active: "bg-green-500/20 text-green-600 dark:text-green-400",
  inactive: "bg-gray-500/20 text-gray-500",
};
