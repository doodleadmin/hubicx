"use client";

import { useEffect, useState } from "react";
import HistoryList from "@/components/HistoryList";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { initTelegram } from "@/lib/telegram";
import { Generation } from "@/lib/types";

export default function HistoryPage() {
  const [items, setItems] = useState<Generation[]>([]);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [authReady, setAuthReady] = useState(false);
  useEffect(() => { let cancelled = false; async function load() { const auth = await initTelegram(); if (cancelled) return; if (!auth.hasTelegramWebApp || !auth.initData) { setError("Откройте WebApp через Telegram-бота"); return; } setAuthReady(true); try { const data = await api.history(); if (!cancelled) setItems(data as Generation[]); } catch (e) { if (!cancelled) setError(e instanceof Error ? e.message : "Не удалось загрузить историю"); } } void load(); return () => { cancelled = true; }; }, []);
  const filtered = filter === "all" ? items : items.filter((item) => item.task_type === filter);
  return <Layout><h1 className="mb-4 text-2xl font-bold">История</h1>{error ? <div className="rounded-3xl bg-red-500/15 p-4 text-red-200">{error}</div> : null}{!authReady && !error ? <p className="text-muted">Подключаем Telegram WebApp...</p> : null}{authReady ? <><div className="mb-4 flex gap-2 overflow-x-auto">{["all", "image", "video", "text", "template"].map((value) => <button key={value} onClick={() => setFilter(value)} className={`rounded-full px-4 py-2 text-sm ${filter === value ? "bg-accent text-black" : "bg-card"}`}>{value}</button>)}</div><HistoryList items={filtered} /></> : null}</Layout>;
}
