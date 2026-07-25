const ASAAS_BASE_URL = process.env.ASAAS_BASE_URL || 'https://sandbox.asaas.com/api/v3';
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || '';

async function asaasRequest(path: string, options: RequestInit = {}) {
  const res = await fetch(`${ASAAS_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'access_token': ASAAS_API_KEY,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Asaas API error ${res.status}: ${JSON.stringify(err)}`);
  }
  return res.json();
}

export interface AsaasCustomer {
  id?: string;
  name: string;
  email: string;
  cpfCnpj?: string;
  phone?: string;
  externalReference?: string;
}

export interface AsaasSubscription {
  customer: string;
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX';
  value: number;
  nextDueDate: string;
  cycle: 'MONTHLY';
  description?: string;
  externalReference?: string;
}

export interface AsaasCharge {
  customer: string;
  billingType: 'BOLETO' | 'PIX' | 'CREDIT_CARD';
  value: number;
  dueDate: string;
  description?: string;
  externalReference?: string;
}

// Clientes
export async function createAsaasCustomer(data: AsaasCustomer) {
  return asaasRequest('/customers', { method: 'POST', body: JSON.stringify(data) });
}

export async function findAsaasCustomerByEmail(email: string) {
  const res = await asaasRequest(`/customers?email=${encodeURIComponent(email)}`);
  return res.data?.[0] ?? null;
}

// Assinaturas
export async function createAsaasSubscription(data: AsaasSubscription) {
  return asaasRequest('/subscriptions', { method: 'POST', body: JSON.stringify(data) });
}

export async function cancelAsaasSubscription(id: string) {
  return asaasRequest(`/subscriptions/${id}`, { method: 'DELETE' });
}

// Cobranças avulsas
export async function createAsaasCharge(data: AsaasCharge) {
  return asaasRequest('/payments', { method: 'POST', body: JSON.stringify(data) });
}

export async function getAsaasCharge(id: string) {
  return asaasRequest(`/payments/${id}`);
}

// Pix QR Code
export async function getPixQrCode(paymentId: string) {
  return asaasRequest(`/payments/${paymentId}/pixQrCode`);
}
