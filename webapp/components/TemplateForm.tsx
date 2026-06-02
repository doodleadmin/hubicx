"use client";

import { useEffect, useState } from "react";
import BalanceCard from "./BalanceCard";
import GenerationStatus from "./GenerationStatus";
import PromptTextarea from "./PromptTextarea";
import UploadBlock from "./UploadBlock";
import { api } from "@/lib/api";
import { getTelegramDebugState, initTelegram, TelegramDebugState } from "@/lib/telegram";
import { Generation, Template, User } from "@/lib/types";

const showDebug = process.env.NEXT_PUBLIC_DEBUG === "true";

function TelegramDebugBlock({ debug }: { debug: TelegramDebugState }) {
  return <div className="rounded-2xl border border-white/10 bg-card p-3 text-xs text-muted">
    <p className="font-semibold text-white">Debug</p>
    <p>hasWindowTelegram: {String(debug.hasWindowTelegram)}</p>
    <p>hasTelegramWebApp: {String(debug.hasTelegramWebApp)}</p>
    <p>initDataLength: {debug.initDataLength}</p>
    <p>initDataUnsafeUserId: {debug.initDataUnsafeUserId}</p>
    <p>backendUrl: {debug.backendUrl}</p>
    <p className="break-all">currentUrl: {debug.currentUrl}</p>
  </div>;
}

export default function TemplateForm({ code }: { code: string }) {
  const [template, setTemplate] = useState<Template>();
  const [user, setUser] = useState<User>();
  const [prompt, setPrompt] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [task, setTask] = useState<Generation>();
  const [error, setError] = useState("");
  const [authReady, setAuthReady] = useState(false);
  const [debug, setDebug] = useState<TelegramDebugState>();
  const [submitting, setSubmitting] = useState(false);
  const [refreshedTaskId, setRefreshedTaskId] = useState<number>();
  useEffect(() => { let cancelled = false; async function load() { const auth = await initTelegram(); if (cancelled) return; if (!auth.hasTelegramWebApp || !auth.initData) { if (showDebug) setDebug(getTelegramDebugState()); setError("Откройте WebApp через Telegram-бота"); return; } setAuthReady(true); try { const [t, u] = await Promise.all([api.template(code), api.me()]); if (!cancelled) { setTemplate(t as Template); setUser(u as User); } } catch (e) { if (!cancelled) setError(e instanceof Error ? e.message : "Не удалось загрузить шаблон"); } } void load(); return () => { cancelled = true; }; }, [code]);
  useEffect(() => { if (!authReady || !task || !["queued", "processing", "created"].includes(task.status)) return; const timer = setInterval(() => api.task(task.id).then((next) => setTask(next as Generation)).catch(() => undefined), 2500); return () => clearInterval(timer); }, [authReady, task]);
  useEffect(() => { if (!authReady || !task || refreshedTaskId === task.id || !["completed", "refunded", "failed"].includes(task.status)) return; setRefreshedTaskId(task.id); api.me().then((nextUser) => setUser(nextUser as User)).catch(() => undefined); }, [authReady, refreshedTaskId, task]);
  async function submit() { setSubmitting(true); setError(""); try { const queued = await api.createGeneration({ template_code: code, prompt, input_file_url: fileUrl || null, params: template?.default_params || {} }) as { task_id: number }; setTask(await api.task(queued.task_id) as Generation); setUser(await api.me() as User); } catch (e) { setError(e instanceof Error ? e.message : "Не удалось создать задачу"); } finally { setSubmitting(false); } }
  if (error) return <div className="space-y-3"><div className="rounded-3xl bg-red-500/15 p-4 text-red-200">{error}</div>{debug ? <TelegramDebugBlock debug={debug} /> : null}</div>;
  if (!authReady || !template || !user) return <p className="text-muted">Подключаем Telegram WebApp...</p>;
  const fields = template.required_inputs.fields || [];
  const isProcessing = !!task && ["created", "queued", "processing"].includes(task.status);
  const promptMissing = fields.includes("prompt") && !prompt.trim();
  const notEnoughBalance = user.balance_credits < template.price_credits;
  const disabled = submitting || isProcessing || promptMissing || notEnoughBalance;
  return <div className="space-y-4"><BalanceCard balance={user.balance_credits} /><section className="rounded-3xl border border-white/10 bg-card p-4"><h1 className="text-2xl font-bold">{template.title}</h1><p className="mt-2 text-muted">{template.description}</p><p className="mt-3 font-semibold">Цена: {template.price_credits} 🪙</p></section>{fields.includes("prompt") ? <PromptTextarea value={prompt} onChange={setPrompt} /> : null}{fields.some((f) => ["image", "audio", "video"].includes(f)) ? <UploadBlock value={fileUrl} onChange={setFileUrl} /> : null}{notEnoughBalance ? <p className="rounded-2xl bg-red-500/10 p-3 text-sm text-red-200">Недостаточно кредитов на балансе</p> : null}{promptMissing ? <p className="rounded-2xl bg-white/5 p-3 text-sm text-muted">Введите prompt для генерации</p> : null}<button className="w-full rounded-3xl bg-accent py-4 font-bold text-black disabled:opacity-50" onClick={submit} disabled={disabled}>{submitting ? "Создаём задачу..." : isProcessing ? "Генерация..." : "Запустить шаблон"}</button><GenerationStatus task={task} onGenerateAgain={() => { setTask(undefined); setRefreshedTaskId(undefined); }} /></div>;
}
