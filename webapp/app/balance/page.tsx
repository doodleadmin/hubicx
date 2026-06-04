"use client";

import { useEffect, useState } from "react";
import BalanceCard from "@/components/BalanceCard";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { getTelegramLanguageCode, initTelegram } from "@/lib/telegram";
import { getLocale, Locale, t, translateError } from "@/lib/i18n";
import { User } from "@/lib/types";

const packages = [100, 500, 1000, 3000];

export default function BalancePage() {
  const [user, setUser] = useState<User>();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [locale, setLocale] = useState<Locale>("ru");
  useEffect(() => { let cancelled = false; async function load() { const auth = await initTelegram(); if (cancelled) return; const fallbackLocale = getLocale(undefined, getTelegramLanguageCode()); setLocale(fallbackLocale); if (!auth.hasTelegramWebApp || !auth.initData) { setError(t(fallbackLocale, "auth.openViaTelegramBot")); return; } try { const u = await api.me(); if (!cancelled) { setLocale(getLocale((u as User).language_code, getTelegramLanguageCode())); setUser(u as User); } } catch (e) { if (!cancelled) setError(translateError(e, fallbackLocale)); } } void load(); return () => { cancelled = true; }; }, []);
  async function pay(credits: number) { try { const payment = await api.createPayment(credits) as { message: string }; setMessage(payment.message); } catch (e) { setError(translateError(e, locale)); } }
  return <Layout><section className="mb-5 rounded-card border border-border-soft bg-white p-5 shadow-soft-sm"><p className="text-sm font-bold text-brand-primary">{t(locale, "balance.kicker")}</p><h1 className="mt-1 text-3xl font-black text-ink-primary">{t(locale, "balance.title")}</h1><p className="mt-2 text-sm text-ink-secondary">{t(locale, "balance.description")}</p></section>{error ? <div className="rounded-card bg-red-50 p-4 text-red-700 shadow-soft-sm">{error}</div> : null}{user ? <BalanceCard balance={user.balance_credits} locale={locale} /> : !error ? <div className="h-32 animate-pulse rounded-card bg-white/80" /> : null}<section className="mt-5 rounded-card border border-border-soft bg-white p-5 shadow-soft-sm"><h2 className="text-lg font-black text-ink-primary">{t(locale, "balance.topUp")}</h2><p className="mt-2 text-sm text-ink-secondary">{t(locale, "balance.topUpSoon")}</p><div className="mt-4 grid grid-cols-2 gap-3">{packages.map((credits) => <button key={credits} className="rounded-card border border-border-soft bg-surface-blue p-4 text-left transition active:scale-[0.98]" onClick={() => pay(credits)}><b className="text-xl text-ink-primary">{credits} 🪙</b><span className="mt-1 block text-sm text-ink-secondary">{t(locale, "balance.testPackage")}</span></button>)}</div></section>{user ? <p className="mt-4 rounded-2xl border border-border-soft bg-white p-4 text-sm text-ink-secondary shadow-soft-sm">{t(locale, "balance.refCode")}: <b className="text-brand-primary">{user.ref_code}</b></p> : null}{message ? <p className="mt-4 rounded-2xl bg-green-50 p-4 text-green-700">{message}</p> : null}</Layout>;
}
