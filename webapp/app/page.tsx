"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CreateTaskGrid from "@/components/CreateTaskGrid";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { coverPath, CREATE_TASKS, iconPath, text } from "@/lib/hubicxCatalog";
import { getLocale, Locale, t } from "@/lib/i18n";
import { getTelegramLanguageCode } from "@/lib/telegram";
import type { Generation, User } from "@/lib/types";

export default function Home() {
  const [locale, setLocale] = useState<Locale>("ru");
  const [history, setHistory] = useState<Generation[]>([]);

  useEffect(() => {
    const fallback = getLocale(undefined, getTelegramLanguageCode());
    setLocale(fallback);
    Promise.allSettled([api.me(), api.history()]).then(([me, items]) => {
      if (me.status === "fulfilled") setLocale(getLocale((me.value as User).language_code, getTelegramLanguageCode()));
      if (items.status === "fulfilled") setHistory((items.value as Generation[]).slice(0, 3));
    });
  }, []);

  const quick = CREATE_TASKS.slice(0, 4);

  return (
    <Layout>
      <section className="hbx-hero">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand-primary/20 blur-3xl" />
        <div className="relative max-w-[19rem]">
          <p className="text-sm font-black text-brand-primary">{t(locale, "home.platform")}</p>
          <h1 className="mt-2 text-4xl font-black leading-[1.05] tracking-tight text-ink-primary">{t(locale, "home.title")}</h1>
          <p className="mt-4 text-sm leading-6 text-ink-secondary">{t(locale, "home.subtitle")}</p>
          <div className="mt-6 flex gap-2">
            <Link href="/create" className="hubicx-primary-button text-sm">{t(locale, "home.start")}</Link>
            <Link href="/history" className="hubicx-secondary-button text-sm">{t(locale, "home.history")}</Link>
          </div>
        </div>
      </section>

      <section className="mt-5">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div><h2 className="hbx-section-title">{t(locale, "home.quickActions")}</h2><p className="hbx-section-subtitle">{t(locale, "create.subtitle")}</p></div>
          <Link href="/create" className="text-sm font-black text-brand-primary">{t(locale, "common.openOriginal")}</Link>
        </div>
        <div className="hbx-rail">
          {quick.map((task, index) => (
            <Link key={task.id} href={`/generate?model=${task.modelCodes[0]}`} className="hbx-card min-w-[172px] snap-start overflow-hidden p-3 active:scale-[0.98]">
              <img src={coverPath(`hero${(index % 3) + 1}`)} alt="" className="h-24 w-full rounded-[20px] object-cover" />
              <span className="mt-3 flex items-center gap-2"><img src={iconPath(task.icon)} alt="" className="h-7 w-7" /><b className="text-sm text-ink-primary">{text(task.title, locale)}</b></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <h2 className="hbx-section-title">{t(locale, "create.title")}</h2>
        <div className="mt-3"><CreateTaskGrid locale={locale} /></div>
      </section>

      <section className="mt-5 rounded-card border border-border-soft bg-white p-5 shadow-soft-sm">
        <div className="flex items-center justify-between gap-3">
          <div><h2 className="hbx-section-title">{t(locale, "history.title")}</h2><p className="hbx-section-subtitle">{t(locale, "history.subtitle")}</p></div>
          <Link href="/history" className="hubicx-badge">{t(locale, "nav.history")}</Link>
        </div>
        <div className="mt-4 space-y-2">
          {history.length ? history.map((item) => <Link key={item.id} href={`/history?task=${item.id}`} className="block rounded-2xl bg-surface-blue px-4 py-3 text-sm font-bold text-ink-primary">#{item.id} · {item.title || item.model_code || item.task_type}</Link>) : <p className="text-sm text-ink-secondary">{t(locale, "history.emptySubtitle")}</p>}
        </div>
      </section>
    </Layout>
  );
}
