import { getInitData } from "./telegram";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
const TELEGRAM_OPEN_ERROR = "Откройте WebApp через Telegram-бота";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const initData = getInitData();
  if (!initData) throw new Error(TELEGRAM_OPEN_ERROR);
  const response = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "Content-Type": "application/json",
      "X-Telegram-Init-Data": initData,
    },
    cache: "no-store"
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const detail = String(error.detail || "");
    if (response.status === 401 || detail.includes("Telegram initData")) {
      throw new Error(TELEGRAM_OPEN_ERROR);
    }
    throw new Error(detail || "Не удалось выполнить запрос. Попробуйте ещё раз.")
  }
  return response.json();
}

async function uploadFile(file: globalThis.File): Promise<{ file_id: number; url: string }> {
  const initData = getInitData();
  if (!initData) throw new Error(TELEGRAM_OPEN_ERROR);
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_URL}/api/files/upload`, {
    method: "POST",
    headers: { "X-Telegram-Init-Data": initData },
    body: formData,
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(String(error.detail || "Ошибка загрузки файла"));
  }
  return response.json();
}

export const api = {
  me: () => request("/auth/me"),
  model: (code: string) => request(`/models/${code}`),
  modelPricePreview: (code: string, inputs: Record<string, unknown>) => request(`/models/${code}/price-preview`, { method: "POST", body: JSON.stringify({ inputs }) }),
  template: (code: string) => request(`/templates/${code}`),
  history: () => request("/generations/history"),
  task: (id: number) => request(`/generations/${id}`),
  sendToChat: (id: number) => request(`/generations/${id}/send-to-chat`, { method: "POST", body: JSON.stringify({}) }),
  createGeneration: (body: unknown) => request("/generations", { method: "POST", body: JSON.stringify(body) }),
  createPayment: (credits: number) => request("/payments/create", { method: "POST", body: JSON.stringify({ credits }) }),
  uploadFile,
};
