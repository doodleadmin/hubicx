"use client";

import { useEffect, useState } from "react";
import CreateTaskGrid from "@/components/CreateTaskGrid";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { getLocale, Locale, t } from "@/lib/i18n";
import { getTelegramLanguageCode } from "@/lib/telegram";
import type { User } from "@/lib/types";

export default function CreateImagePage() { const [locale, setLocale] = useState<Locale>("ru"); useEffect(() => { setLocale(getLocale(undefined, getTelegramLanguageCode())); api.me().then((u) => setLocale(getLocale((u as User).language_code, getTelegramLanguageCode()))).catch(() => undefined); }, []); return <Layout><h1 className="hbx-section-title">{t(locale, "create.image")}</h1><p className="hbx-section-subtitle">{t(locale, "create.imageDesc")}</p><div className="mt-4"><CreateTaskGrid locale={locale} category="image" /></div></Layout>; }
