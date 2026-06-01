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
  useEffect(() => { initTelegram(); void api.me().then((u) => setUser(u as User)); }, []);
  async function pay(credits: number) { const payment = await api.createPayment(credits) as { message: string }; setMessage(payment.message); }
  return <Layout><h1 className="mb-4 text-2xl font-bold">Баланс</h1>{user ? <BalanceCard balance={user.balance_credits} /> : <p className="text-muted">Загрузка...</p>}<div className="mt-5 grid grid-cols-2 gap-3">{packages.map((credits) => <button key={credits} className="rounded-3xl bg-card p-5 text-left" onClick={() => pay(credits)}><b>{credits} 🪙</b><span className="mt-1 block text-sm text-muted">Mock payment</span></button>)}</div>{user ? <p className="mt-4 rounded-2xl bg-card p-4 text-sm text-muted">Реферальный код: {user.ref_code}</p> : null}{message ? <p className="mt-4 rounded-2xl bg-accent/15 p-4 text-accent">{message}</p> : null}</Layout>;
}
