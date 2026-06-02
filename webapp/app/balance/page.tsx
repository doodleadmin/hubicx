"use client";

import { useEffect, useState } from "react";
import BalanceCard from "@/components/BalanceCard";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { initTelegram } from "@/lib/telegram";
import { User } from "@/lib/types";

const packages = [100, 500, 1000, 3000];

export default function BalancePage() {
  const [user, setUser] = useState<User>();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { let cancelled = false; async function load() { const auth = await initTelegram(); if (cancelled) return; if (!auth.hasTelegramWebApp || !auth.initData) { setError("Откройте WebApp через Telegram-бота"); return; } try { const u = await api.me(); if (!cancelled) setUser(u as User); } catch (e) { if (!cancelled) setError(e instanceof Error ? e.message : "Не удалось загрузить баланс"); } } void load(); return () => { cancelled = true; }; }, []);
  async function pay(credits: number) { try { const payment = await api.createPayment(credits) as { message: string }; setMessage(payment.message); } catch (e) { setError(e instanceof Error ? e.message : "Не удалось создать платёж"); } }
  return <Layout><h1 className="mb-4 text-2xl font-bold">Баланс</h1>{error ? <div className="rounded-3xl bg-red-500/15 p-4 text-red-200">{error}</div> : null}{user ? <BalanceCard balance={user.balance_credits} /> : !error ? <p className="text-muted">Подключаем Telegram WebApp...</p> : null}<div className="mt-5 grid grid-cols-2 gap-3">{packages.map((credits) => <button key={credits} className="rounded-3xl bg-card p-5 text-left" onClick={() => pay(credits)}><b>{credits} 🪙</b><span className="mt-1 block text-sm text-muted">Mock payment</span></button>)}</div>{user ? <p className="mt-4 rounded-2xl bg-card p-4 text-sm text-muted">Реферальный код: {user.ref_code}</p> : null}{message ? <p className="mt-4 rounded-2xl bg-accent/15 p-4 text-accent">{message}</p> : null}</Layout>;
}
