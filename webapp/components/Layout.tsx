"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { iconPath, HUBICX_ASSET } from "@/lib/hubicxCatalog";
import { getLocale, Locale, t } from "@/lib/i18n";
import { getTelegramLanguageCode } from "@/lib/telegram";
import type { User } from "@/lib/types";

const navItems = [
  { href: "/", label: "nav.home", icon: "home" },
  { href: "/create", label: "nav.create", icon: "camera", fab: true },
  { href: "/agents", label: "nav.agents", icon: "users" },
  { href: "/history", label: "nav.history", icon: "history" },
  { href: "/balance", label: "nav.balance", icon: "wallet" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const [locale, setLocale] = useState<Locale>("ru");
  const [balance, setBalance] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fallback = getLocale(undefined, getTelegramLanguageCode());
    setLocale(fallback);
    api.me()
      .then((u) => {
        const user = u as User;
        setLocale(getLocale(user.language_code, getTelegramLanguageCode()));
        setBalance(user.balance_credits);
        setIsAdmin(Boolean(user.is_admin));
      })
      .catch(() => undefined);
  }, []);

  const nav = useMemo(() => navItems, []);

  return (
    <main className="hbx-phone">
      <header className="hbx-topbar">
        <Link href="/" className="hbx-brandmark" aria-label="Hubicx">
          <img src={`${HUBICX_ASSET}/logo.jpg`} alt="" />
          <span>Hubicx</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/balance" className="hbx-balpill">{balance ?? "..."} cr</Link>
          {isAdmin ? <Link href="/admin" className="hbx-iconbtn text-xs font-black text-brand-primary">ADM</Link> : null}
          <Link href="/docs" className="hbx-iconbtn" aria-label={t(locale, "docs.title")}>
            <img src={iconPath("document")} alt="" className="h-5 w-5" />
          </Link>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <nav className="hbx-tabbar" aria-label="Hubicx navigation">
        {nav.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link key={item.href} href={item.href} className={`hbx-tab ${active ? "hbx-tab-active" : ""}`}>
              <span className={item.fab ? "hbx-tab-fab" : "flex h-7 w-7 items-center justify-center rounded-xl bg-surface-blue p-1.5"}>
                <img src={iconPath(item.icon)} alt="" className="h-full w-full object-contain" />
              </span>
              <span>{t(locale, item.label)}</span>
            </Link>
          );
        })}
      </nav>
    </main>
  );
}
