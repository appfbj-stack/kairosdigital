import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Tenant {
  id: string;
  slug: string;
  name: string;
  tradeName?: string;
  vertical: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  welcomeMsg?: string;
  verticalConfig: any;
  whatsappNumber?: string;
  whatsappStatus?: string;
}

interface AuthState {
  token: string | null;
  tenant: Tenant | null;
  setAuth: (token: string, tenant: Tenant) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      tenant: null,
      setAuth: (token, tenant) => set({ token, tenant }),
      logout: () => set({ token: null, tenant: null }),
    }),
    { name: "auth-storage" }
  )
);