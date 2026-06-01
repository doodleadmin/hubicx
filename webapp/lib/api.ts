import { getInitData } from "./telegram";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const initData = getInitData();
  const response = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(initData ? { Authorization: `tma ${initData}` } : {}),
      ...(options.headers || {})
    },
    cache: "no-store"
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Ошибка запроса")
  }
  return response.json();
}

export const api = {
  me: () => request("/auth/me"),
  model: (code: string) => request(`/models/${code}`),
  template: (code: string) => request(`/templates/${code}`),
  history: () => request("/generations/history"),
  task: (id: number) => request(`/generations/${id}`),
  createGeneration: (body: unknown) => request("/generations", { method: "POST", body: JSON.stringify(body) }),
  createPayment: (credits: number) => request("/payments/create", { method: "POST", body: JSON.stringify({ credits }) })
};
