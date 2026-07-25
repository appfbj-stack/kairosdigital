export interface Member {
  id: string;
  churchId: string;
  userId: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  birthdate: string | null;
  baptismDate: string | null;
  status: "active" | "inactive" | "visitor";
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CreateMemberInput {
  name: string;
  email?: string;
  phone?: string;
  birthdate?: string;
  baptismDate?: string;
  status?: Member["status"];
}

export interface UpdateMemberInput extends Partial<CreateMemberInput> {}
