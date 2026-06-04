"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { getLocale, Locale, t } from "@/lib/i18n";
import { api } from "@/lib/api";
import { getTelegramLanguageCode } from "@/lib/telegram";
import type { User } from "@/lib/types";

export default function DocsPage() {
  const [locale, setLocale] = useState<Locale>("ru");

  useEffect(() => {
    setLocale(getLocale(undefined, getTelegramLanguageCode()));
    api.me()
      .then((u) => setLocale(getLocale((u as User).language_code, getTelegramLanguageCode())))
      .catch(() => {});
  }, []);

  const cards = [
    ["docs.modelsTitle", "docs.modelsText"],
    ["docs.pricingTitle", "docs.pricingText"],
    ["docs.resultsTitle", "docs.resultsText"],
  ];

  return (
    <Layout>
      <section className="mb-5 rounded-card border border-border-soft bg-white p-5 shadow-soft-sm">
        <p className="text-sm font-bold text-brand-primary">Hubicx</p>
        <h1 className="mt-1 text-3xl font-black text-ink-primary">{t(locale, "docs.title")}</h1>
        <p className="mt-2 text-sm leading-6 text-ink-secondary">{t(locale, "docs.description")}</p>
      </section>
      <div className="space-y-3">
        {cards.map(([titleKey, textKey]) => (
          <section key={titleKey} className="rounded-card border border-border-soft bg-white p-5 shadow-soft-sm">
            <h2 className="text-lg font-black text-ink-primary">{t(locale, titleKey)}</h2>
            <p className="mt-2 text-sm leading-6 text-ink-secondary">{t(locale, textKey)}</p>
          </section>
        ))}
      </div>
    </Layout>
  );
}
