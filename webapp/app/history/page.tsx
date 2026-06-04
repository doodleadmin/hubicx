"use client";

import { useEffect, useState } from "react";
import HistoryList from "@/components/HistoryList";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { getTelegramLanguageCode, initTelegram } from "@/lib/telegram";
import { getLocale, Locale, t, translateError } from "@/lib/i18n";
import { Generation, User } from "@/lib/types";

export default function HistoryPage() {
  const [items, setItems] = useState<Generation[]>([]);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [authReady, setAuthReady] = useState(false);
  const [locale, setLocale] = useState<Locale>("ru");
  useEffect(() => { let cancelled = false; async function load() { const auth = await initTelegram(); if (cancelled) return; const fallbackLocale = getLocale(undefined, getTelegramLanguageCode()); setLocale(fallbackLocale); if (!auth.hasTelegramWebApp || !auth.initData) { setError(t(fallbackLocale, "auth.openViaTelegramBot")); return; } setAuthReady(true); try { const [data, u] = await Promise.all([api.history(), api.me()]); if (!cancelled) { setLocale(getLocale((u as User).language_code, getTelegramLanguageCode())); setItems(data as Generation[]); } } catch (e) { if (!cancelled) setError(translateError(e, fallbackLocale)); } } void load(); return () => { cancelled = true; }; }, []);
  const filtered = filter === "all" ? items : items.filter((item) => item.task_type === filter);
  const labels: Record<string, string> = { all: t(locale, "history.all"), image: t(locale, "history.image"), video: t(locale, "history.video"), text: t(locale, "history.text"), template: t(locale, "history.template") };
  return <Layout><section className="mb-5 rounded-card border border-border-soft bg-white p-5 shadow-soft-sm"><p className="text-sm font-bold text-brand-primary">{t(locale, "history.works")}</p><h1 className="mt-1 text-3xl font-black text-ink-primary">{t(locale, "history.title")}</h1><p className="mt-2 text-sm text-ink-secondary">{t(locale, "history.subtitle")}</p></section>{error ? <div className="rounded-card bg-red-50 p-4 text-red-700">{error}</div> : null}{!authReady && !error ? <div className="space-y-3"><div className="h-24 animate-pulse rounded-card bg-white/70" /><div className="h-32 animate-pulse rounded-card bg-white/70" /></div> : null}{authReady ? <><div className="mb-4 flex gap-2 overflow-x-auto pb-1">{["all", "image", "video", "text", "template"].map((value) => <button key={value} onClick={() => setFilter(value)} className={`shrink-0 rounded-pill px-4 py-2 text-sm font-bold transition ${filter === value ? "bg-brand-primary text-white shadow-soft-sm" : "bg-white text-ink-secondary"}`}>{labels[value]}</button>)}</div><HistoryList items={filtered} locale={locale} /></> : null}</Layout>;
}
