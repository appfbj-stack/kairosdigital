import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = document.cookie.split("; ").find((r) => r.startsWith("token="))?.split("=")[1];
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string) => api.post("/auth/login", { email, password }),
  register: (data: any) => api.post("/auth/register", data),
  me: () => api.get("/auth/me"),
  validateSlug: (slug: string) => api.get(`/auth/validate/${slug}`),
};

export const tenantApi = {
  get: (id: string) => api.get(`/tenants/${id}`),
  update: (id: string, data: any) => api.put(`/tenants/${id}`, data),
  updateWhatsApp: (id: string, data: any) => api.put(`/tenants/${id}/whatsapp`, data),
};

export const whatsAppApi = {
  connect: () => api.post("/whatsapp/connect"),
  getQR: () => api.post("/whatsapp/qr"),
  getStatus: () => api.get("/whatsapp/status"),
  disconnect: () => api.post("/whatsapp/disconnect"),
  sendTest: (number: string, text: string) => api.post("/whatsapp/send", { number, text }),
};

export const leadsApi = {
  list: (params?: any) => api.get("/leads", { params }),
  get: (id: string) => api.get(`/leads/${id}`),
  getByPhone: (phone: string) => api.get(`/leads/phone/${encodeURIComponent(phone)}`),
  create: (data: any) => api.post("/leads", data),
  update: (id: string, data: any) => api.put(`/leads/${id}`, data),
  qualify: (id: string, score: number, notes: string) => api.put(`/leads/${id}/qualify`, { score, notes }),
  stats: () => api.get("/leads/stats"),
};

export const dealsApi = {
  list: (params?: any) => api.get("/deals", { params }),
  get: (id: string) => api.get(`/deals/${id}`),
  create: (data: any) => api.post("/deals", data),
  update: (id: string, data: any) => api.put(`/deals/${id}`, data),
  moveStage: (id: string, stage: string) => api.put(`/deals/${id}/stage`, { stage }),
  pipeline: () => api.get("/deals/pipeline"),
};

export const tasksApi = {
  list: (params?: any) => api.get("/tasks", { params }),
  get: (id: string) => api.get(`/tasks/${id}`),
  create: (data: any) => api.post("/tasks", data),
  update: (id: string, data: any) => api.put(`/tasks/${id}`, data),
  complete: (id: string) => api.put(`/tasks/${id}/complete`),
  upcoming: (days = 7) => api.get(`/tasks/upcoming`, { params: { days } }),
};

export const conversationsApi = {
  getByLead: (leadId: string, limit = 50) => api.get(`/conversations/${leadId}`, { params: { limit } }),
};

export const knowledgeApi = {
  search: (query: string, limit = 5) => api.get("/knowledge/search", { params: { q: query, limit } }),
};

export const templatesApi = {
  render: (name: string, variables: Record<string, string>) => api.get("/templates/render", { params: { name, ...variables } }),
};