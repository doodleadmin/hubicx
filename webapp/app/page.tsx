"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { getLocale, Locale, t } from "@/lib/i18n";
import { getTelegramLanguageCode } from "@/lib/telegram";
import type { User } from "@/lib/types";

const cards = [
  ["home.images", "home.imagesDesc", "/generate?model=nano_banana", "✦"],
  ["home.video", "home.videoDesc", "/generate?model=seedance_2_t2v", "◌"],
  ["home.text", "home.textDesc", "/generate?model=ai_chat", "✎"],
  ["home.templates", "home.templatesDesc", "/template?code=enhance_4k", "◇"]
];

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [locale, setLocale] = useState<Locale>("ru");
  useEffect(() => {
    setLocale(getLocale(undefined, getTelegramLanguageCode()));
    api.me().then((u) => { const user = u as User; setLocale(getLocale(user.language_code, getTelegramLanguageCode())); if (user.is_admin) setIsAdmin(true); }).catch(() => {});
  }, []);
  return (
    <Layout>
      <section className="relative overflow-hidden rounded-[2rem] border border-white bg-[linear-gradient(135deg,#F8FBFF_0%,#EAF4FF_55%,#D9ECFF_100%)] p-6 shadow-soft-md">
        <div className="absolute -right-12 -top-10 h-40 w-40 rounded-full bg-brand-primary/20 blur-3xl" />
        <div className="absolute -bottom-16 right-10 h-36 w-36 rounded-full bg-white/70 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary text-lg font-black text-white shadow-soft-sm">h</div>
            <span className="text-sm font-extrabold text-ink-primary">Hubicx</span>
          </div>
          <p className="mt-8 text-sm font-bold text-brand-primary">{t(locale, "home.platform")}</p>
          <h1 className="mt-2 text-4xl font-black leading-[1.05] tracking-tight text-ink-primary">{t(locale, "home.title")}</h1>
          <p className="mt-4 max-w-[20rem] text-sm leading-6 text-ink-secondary">{t(locale, "home.subtitle")}</p>
          <div className="mt-6 flex gap-2">
            <Link href="/generate?model=nano_banana" className="hubicx-primary-button text-sm">{t(locale, "home.start")}</Link>
            <Link href="/history" className="hubicx-secondary-button text-sm">{t(locale, "home.history")}</Link>
          </div>
        </div>
      </section>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {cards.map(([titleKey, descriptionKey, href, icon]) => (
          <Link key={href} href={href} className="group rounded-card border border-border-soft bg-white p-4 shadow-soft-sm transition active:scale-[0.98]">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-xl font-black text-brand-primary transition group-hover:bg-brand-primary group-hover:text-white">{icon}</span>
            <b className="mt-4 block text-base text-ink-primary">{t(locale, titleKey)}</b>
            <span className="mt-1 block text-xs leading-5 text-ink-secondary">{t(locale, descriptionKey)}</span>
          </Link>
        ))}
      </div>
      <section className="mt-4 rounded-card border border-border-soft bg-white/80 p-4 shadow-soft-sm backdrop-blur">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">{t(locale, "home.quickActions")}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link href="/balance" className="rounded-2xl bg-surface-blue px-4 py-3 text-sm font-bold text-brand-primary">{t(locale, "home.balance")}</Link>
          <Link href="/history" className="rounded-2xl bg-surface-blue px-4 py-3 text-sm font-bold text-brand-primary">{t(locale, "home.myWorks")}</Link>
        </div>
      </section>
      {isAdmin && (
        <Link href="/admin" className="mt-4 block rounded-card border border-brand-primary/20 bg-white p-5 text-lg font-extrabold text-brand-primary shadow-soft-sm">
          {t(locale, "home.admin")}
        </Link>
      )}
    </Layout>
  );
}
