"use client";

import { useEffect, useState } from "react";
import CreateTaskGrid from "@/components/CreateTaskGrid";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { getLocale, Locale, t } from "@/lib/i18n";
import { getTelegramLanguageCode } from "@/lib/telegram";
import type { User } from "@/lib/types";

export default function CreatePage() {
  const [locale, setLocale] = useState<Locale>("ru");
  useEffect(() => { setLocale(getLocale(undefined, getTelegramLanguageCode())); api.me().then((u) => setLocale(getLocale((u as User).language_code, getTelegramLanguageCode()))).catch(() => undefined); }, []);
  return <Layout><section className="hbx-hero"><p className="text-sm font-black text-brand-primary">Hubicx Studio</p><h1 className="mt-2 text-4xl font-black text-ink-primary">{t(locale, "create.title")}</h1><p className="mt-3 text-sm leading-6 text-ink-secondary">{t(locale, "create.subtitle")}</p></section><div className="mt-5"><CreateTaskGrid locale={locale} /></div></Layout>;
}
