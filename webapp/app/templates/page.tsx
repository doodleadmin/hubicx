"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { iconPath, phPath, TEMPLATE_LIST, TEMPLATE_META, text } from "@/lib/hubicxCatalog";
import { getLocale, Locale, t } from "@/lib/i18n";
import { getTelegramLanguageCode } from "@/lib/telegram";
import type { User } from "@/lib/types";

export default function TemplatesPage() {
  const [locale, setLocale] = useState<Locale>("ru");
  useEffect(() => { setLocale(getLocale(undefined, getTelegramLanguageCode())); api.me().then((u) => setLocale(getLocale((u as User).language_code, getTelegramLanguageCode()))).catch(() => undefined); }, []);
  return <Layout><section className="hbx-hero"><p className="text-sm font-black text-brand-primary">Hubicx</p><h1 className="mt-2 text-4xl font-black text-ink-primary">{t(locale, "templates.title")}</h1><p className="mt-3 text-sm leading-6 text-ink-secondary">{t(locale, "templates.subtitle")}</p></section><div className="mt-5 grid grid-cols-2 gap-3">{TEMPLATE_LIST.map((item) => { const meta = TEMPLATE_META[item.code] || { icon: "puzzle", cover: "sq1" }; return <Link key={item.code} href={`/template?code=${item.code}`} className="hbx-card overflow-hidden active:scale-[0.98]"><img src={phPath(meta.cover)} alt="" className="h-28 w-full object-cover" /><div className="p-3"><img src={iconPath(meta.icon)} alt="" className="mb-2 h-8 w-8" /><b className="block text-sm text-ink-primary">{text(item.title, locale)}</b><span className="mt-1 line-clamp-2 block text-xs leading-5 text-ink-secondary">{text(item.description, locale)}</span></div></Link>; })}</div></Layout>;
}
