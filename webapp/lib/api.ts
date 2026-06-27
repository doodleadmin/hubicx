import { getInitData } from "./telegram";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
const TELEGRAM_OPEN_ERROR = "Откройте WebApp через Telegram-бота";
const REQUEST_TIMEOUT_MS = 10000;

export class ApiError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    window.clearTimeout(timer);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const initData = getInitData();
  if (!initData) throw new ApiError(TELEGRAM_OPEN_ERROR, "unauthorized");
  let response: Response;
  try {
    response = await fetchWithTimeout(`${API_URL}/api${path}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        "Content-Type": "application/json",
        "X-Telegram-Init-Data": initData,
      },
      cache: "no-store"
    });
  } catch {
    throw new ApiError("Не удалось подключиться к API. Попробуйте ещё раз.");
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const detail = String(error.detail || "");
    if (response.status === 401 || detail.includes("Telegram initData")) {
      throw new ApiError(TELEGRAM_OPEN_ERROR, "unauthorized");
    }
    throw new ApiError(detail || "Не удалось выполнить запрос. Попробуйте ещё раз.", String(error.code || ""))
  }
  return response.json();
}

async function uploadFile(file: globalThis.File): Promise<{ file_id: number; url: string }> {
  const initData = getInitData();
  if (!initData) throw new ApiError(TELEGRAM_OPEN_ERROR, "unauthorized");
  const formData = new FormData();
  formData.append("file", file);
  let response: Response;
  try {
    response = await fetchWithTimeout(`${API_URL}/api/files/upload`, {
      method: "POST",
      headers: { "X-Telegram-Init-Data": initData },
      body: formData,
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Не удалось загрузить файл. Проверьте соединение и попробуйте ещё раз.");
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(String(error.detail || "Ошибка загрузки файла"), String(error.code || ""));
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
  adminUsers: (page = 1, limit = 50) => request(`/admin/users?page=${page}&limit=${limit}`),
  adminTopUp: (telegramId: number, amount: number) => request(`/admin/balance/${telegramId}?amount=${amount}`, { method: "POST" }),
  adminUser: (id: number) => request(`/admin/users/${id}`),
  adminSetUserBan: (id: number, isBanned: boolean, reason: string) => request(`/admin/users/${id}/ban`, { method: "PATCH", body: JSON.stringify({ is_banned: isBanned, reason }) }),
  adminUserLedger: (id: number, page = 1, limit = 50) => request(`/admin/users/${id}/balance-ledger?page=${page}&limit=${limit}`),
  adminBalanceAdjust: (id: number, amount: number, reason: string) => request(`/admin/users/${id}/balance-adjust`, { method: "POST", body: JSON.stringify({ amount, reason }) }),
  adminTasks: (page = 1, limit = 50, status?: string) => request(`/admin/tasks?page=${page}&limit=${limit}${status ? `&status=${status}` : ""}`),
  adminGenerationTasks: (page = 1, limit = 50, status?: string, userId?: number) => request(`/admin/generation-tasks?page=${page}&limit=${limit}${status ? `&status=${status}` : ""}${userId != null ? `&user_id=${userId}` : ""}`),
  adminGenerationTask: (id: number) => request(`/admin/generation-tasks/${id}`),
  adminErrors: (page = 1, limit = 50) => request(`/admin/errors?page=${page}&limit=${limit}`),
  adminModels: () => request("/admin/models"),
  adminModelPricing: () => request("/admin/model-pricing"),
  adminUpdateModelPricing: (code: string, body: unknown) => request(`/admin/model-pricing/${code}`, { method: "PATCH", body: JSON.stringify(body) }),
  adminToggleModel: (code: string, isActive: boolean) => request(`/admin/models/${code}/toggle?is_active=${isActive}`, { method: "POST" }),
  adminUpdatePrice: (code: string, priceCredits: number) => request(`/admin/models/${code}/price?price_credits=${priceCredits}`, { method: "POST" }),
  adminModelSchema: (code: string) => request(`/admin/models/${code}/schema`),
  adminTokenPackages: () => request("/admin/token-packages"),
  adminCreateTokenPackage: (body: unknown) => request("/admin/token-packages", { method: "POST", body: JSON.stringify(body) }),
  adminUpdateTokenPackage: (id: number, body: unknown) => request(`/admin/token-packages/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  adminDeleteTokenPackage: (id: number) => request(`/admin/token-packages/${id}`, { method: "DELETE" }),
  adminTransactions: (page = 1, limit = 50, userId?: number) => request(`/admin/transactions?page=${page}&limit=${limit}${userId != null ? `&user_id=${userId}` : ""}`),
  adminFiles: (page = 1, limit = 50, userId?: number) => request(`/admin/files?page=${page}&limit=${limit}${userId != null ? `&user_id=${userId}` : ""}`),
};
