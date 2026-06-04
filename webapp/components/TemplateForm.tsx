"use client";

import { useEffect, useState } from "react";
import BalanceCard from "./BalanceCard";
import GenerationStatus from "./GenerationStatus";
import PromptTextarea from "./PromptTextarea";
import UploadBlock from "./UploadBlock";
import { api } from "@/lib/api";
import { getTelegramDebugState, getTelegramLanguageCode, initTelegram, TelegramDebugState } from "@/lib/telegram";
import { getLocale, Locale, t, translateError } from "@/lib/i18n";
import { Generation, Template, User } from "@/lib/types";

const showDebug = process.env.NEXT_PUBLIC_DEBUG === "true";

function TelegramDebugBlock({ debug }: { debug: TelegramDebugState }) {
  return <div className="rounded-2xl border border-border-soft bg-white p-3 text-xs text-ink-secondary">
    <p className="font-semibold text-ink-primary">Debug</p>
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
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const [locale, setLocale] = useState<Locale>("ru");
  useEffect(() => { let cancelled = false; setLoadingTimedOut(false); async function load() { try { const auth = await initTelegram(); if (cancelled) return; if (!auth.hasTelegramWebApp || !auth.initData) { const nextLocale = getLocale(undefined, getTelegramLanguageCode()); setLocale(nextLocale); if (showDebug) setDebug(getTelegramDebugState()); setError(t(nextLocale, "auth.openViaTelegramBot")); return; } setAuthReady(true); const [templateData, u] = await Promise.all([api.template(code), api.me()]); if (!cancelled) { setLocale(getLocale((u as User).language_code, getTelegramLanguageCode())); setTemplate(templateData as Template); setUser(u as User); } } catch (e) { if (!cancelled) setError(translateError(e, getLocale(undefined, getTelegramLanguageCode()))); } } void load(); return () => { cancelled = true; }; }, [code]);
  useEffect(() => { if (error || (authReady && template && user)) return; const timer = setTimeout(() => setLoadingTimedOut(true), 5000); return () => clearTimeout(timer); }, [authReady, error, template, user]);
  useEffect(() => { if (!authReady || !task || !["queued", "processing", "created"].includes(task.status)) return; const timer = setInterval(() => api.task(task.id).then((next) => setTask(next as Generation)).catch(() => undefined), 2500); return () => clearInterval(timer); }, [authReady, task]);
  useEffect(() => { if (!authReady || !task || refreshedTaskId === task.id || !["completed", "refunded", "failed"].includes(task.status)) return; setRefreshedTaskId(task.id); api.me().then((nextUser) => setUser(nextUser as User)).catch(() => undefined); }, [authReady, refreshedTaskId, task]);
  async function submit() { setSubmitting(true); setError(""); try { const queued = await api.createGeneration({ template_code: code, prompt, input_file_url: fileUrl || null, params: template?.default_params || {} }) as { task_id: number }; setTask(await api.task(queued.task_id) as Generation); setUser(await api.me() as User); } catch (e) { setError(translateError(e, locale)); } finally { setSubmitting(false); } }
  if (error) return <div className="space-y-3"><div className="rounded-card bg-red-50 p-4 text-red-700 shadow-soft-sm">{error}</div>{debug ? <TelegramDebugBlock debug={debug} /> : null}</div>;
  if (loadingTimedOut) return <div className="space-y-3"><div className="rounded-card bg-red-50 p-4 text-red-700 shadow-soft-sm">{t(locale, "auth.connectionError")}</div><button className="hubicx-secondary-button" onClick={() => window.location.reload()}>{t(locale, "common.retry")}</button>{showDebug ? <TelegramDebugBlock debug={getTelegramDebugState()} /> : null}</div>;
  if (!authReady || !template || !user) return <div className="space-y-3"><div className="h-32 animate-pulse rounded-card bg-white/80" /><div className="h-56 animate-pulse rounded-card bg-white/80" /></div>;
  const fields = template.required_inputs.fields || [];
  const isProcessing = !!task && ["created", "queued", "processing"].includes(task.status);
  const promptMissing = fields.includes("prompt") && !prompt.trim();
  const notEnoughBalance = user.balance_credits < template.price_credits;
  const disabled = submitting || isProcessing || promptMissing || notEnoughBalance;
  return <div className="space-y-4"><BalanceCard balance={user.balance_credits} locale={locale} /><section className="rounded-[2rem] border border-white bg-[linear-gradient(135deg,#F8FBFF_0%,#EAF4FF_55%,#D9ECFF_100%)] p-5 shadow-soft-md"><p className="text-sm font-bold text-brand-primary">{t(locale, "home.templates")}</p><h1 className="mt-2 text-3xl font-black text-ink-primary">{template.title}</h1><p className="mt-3 text-sm leading-6 text-ink-secondary">{template.description}</p><p className="mt-4 inline-flex rounded-pill bg-white px-3 py-1 text-sm font-bold text-brand-primary shadow-soft-sm">{template.price_credits} 🪙</p></section><section className="rounded-card border border-border-soft bg-white p-5 shadow-soft-sm">{fields.includes("prompt") ? <PromptTextarea value={prompt} onChange={setPrompt} locale={locale} /> : null}{fields.some((f) => ["image", "audio", "video"].includes(f)) ? <div className="mt-4"><UploadBlock value={fileUrl} onChange={setFileUrl} locale={locale} /></div> : null}</section>{notEnoughBalance ? <p className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-700">{t(locale, "error.not_enough_balance")}</p> : null}{promptMissing ? <p className="rounded-2xl bg-brand-soft p-3 text-sm text-brand-primary">{t(locale, "generate.describeWhatCreate")}</p> : null}<button className="hubicx-primary-button w-full py-4 text-base" onClick={submit} disabled={disabled}>{submitting ? t(locale, "generate.creatingTask") : isProcessing ? t(locale, "generate.generating") : t(locale, "generate.generate")}</button><GenerationStatus task={task} locale={locale} onGenerateAgain={() => { setTask(undefined); setRefreshedTaskId(undefined); }} /></div>;
}
