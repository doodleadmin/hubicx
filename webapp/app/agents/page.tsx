"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { AGENTS, iconPath, text } from "@/lib/hubicxCatalog";
import { api } from "@/lib/api";
import { getLocale, Locale, t } from "@/lib/i18n";
import { getTelegramLanguageCode } from "@/lib/telegram";
import type { User } from "@/lib/types";

export default function AgentsPage() {
  const [locale, setLocale] = useState<Locale>("ru");
  useEffect(() => { setLocale(getLocale(undefined, getTelegramLanguageCode())); api.me().then((u) => setLocale(getLocale((u as User).language_code, getTelegramLanguageCode()))).catch(() => undefined); }, []);
  return <Layout><section className="hbx-hero"><p className="text-sm font-black text-brand-primary">Hubicx</p><h1 className="mt-2 text-4xl font-black text-ink-primary">{t(locale, "agents.title")}</h1><p className="mt-3 text-sm leading-6 text-ink-secondary">{t(locale, "agents.subtitle")}</p></section><div className="mt-5 grid gap-3">{AGENTS.map((agent) => <Link key={agent.code} href={`/agent?code=${agent.code}`} className="hbx-task-card flex items-center gap-4"><span className="hbx-task-icon"><img src={iconPath(agent.icon)} alt="" className="h-full w-full object-contain" /></span><span><b className="text-ink-primary">{text(agent.title, locale)}</b><span className="mt-1 block text-sm text-ink-secondary">{t(locale, "agents.soon")}</span></span></Link>)}</div></Layout>;
}
