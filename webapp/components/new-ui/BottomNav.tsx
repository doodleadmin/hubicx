"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { tt } from "./prototypeData";

function NavIcon({ name, active }: { name: string; active?: boolean }) {
  const s = active ? "var(--blue)" : "var(--text-3)";
  const common = { fill: "none", stroke: s, strokeWidth: 2.1, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  if (name === "home") return <svg viewBox="0 0 24 24"><path {...common} d="M4 11.5 12 4l8 7.5" /><path {...common} d="M6 10.5V20h12v-9.5" /><path {...common} d="M10 20v-5h4v5" /></svg>;
  if (name === "agents") return <svg viewBox="0 0 24 24"><rect {...common} x="4" y="6" width="16" height="13" rx="4" /><path {...common} d="M12 6V3.4" /><circle cx="12" cy="3" r="1.2" fill={s} stroke="none" /><circle cx="9" cy="12" r="1.3" fill={s} stroke="none" /><circle cx="15" cy="12" r="1.3" fill={s} stroke="none" /><path {...common} d="M9.5 15.5c1.5 1.1 3.5 1.1 5 0" /></svg>;
  if (name === "history") return <svg viewBox="0 0 24 24"><circle {...common} cx="12" cy="12" r="8.2" /><path {...common} d="M12 7.5V12l3 2" /></svg>;
  return <svg viewBox="0 0 24 24"><path {...common} d="M4 8.5C4 7 5 6 6.5 6H17c1.6 0 3 1.3 3 3v8c0 1.6-1.4 3-3 3H7c-1.6 0-3-1.4-3-3z" /><path {...common} d="M4 9h13.5" /><circle cx="16.5" cy="13.5" r="1.4" fill={s} stroke="none" /></svg>;
}

const ROUTES: Record<string, string> = { home: "/", create: "/create", agents: "/agents", history: "/history", balance: "/balance" };

function activeFromPath(pathname: string) {
  if (pathname.startsWith("/create") || pathname.startsWith("/generate") || pathname.startsWith("/templates") || pathname.startsWith("/template")) return "create";
  if (pathname.startsWith("/agents") || pathname.startsWith("/agent")) return "agents";
  if (pathname.startsWith("/history")) return "history";
  if (pathname.startsWith("/balance")) return "balance";
  return "home";
}

export default function BottomNav({ tab, lang, go, routeLinks = true }: { tab: string; lang: string; go: (tab: string) => void; routeLinks?: boolean }) {
  const pathname = usePathname() || "/";
  const activeTab = routeLinks ? activeFromPath(pathname) : tab;
  const label = (id: string) => ({ home: tt(lang, "Home", "Главная"), agents: tt(lang, "Agents", "Агенты"), history: tt(lang, "History", "История"), balance: tt(lang, "Balance", "Баланс") } as Record<string, string>)[id];
  const Tab = ({ id, target }: { id: string; target: string }) => routeLinks
    ? <Link className={"tab" + (activeTab === target ? " on" : "")} href={ROUTES[target]}><NavIcon name={id} active={activeTab === target} /><span>{label(id)}</span></Link>
    : <button className={"tab" + (activeTab === target ? " on" : "")} onClick={() => go(target)}><NavIcon name={id} active={activeTab === target} /><span>{label(id)}</span></button>;
  return <div className="tabbar-wrap"><div className="tabbar">
    <Tab id="home" target="home" />
    <Tab id="agents" target="agents" />
    <div className="tab spacer"><NavIcon name="home" /><span>·</span></div>
    <Tab id="history" target="history" />
    <Tab id="balance" target="balance" />
    {routeLinks ? <Link className="fab" href="/create" aria-label="Create">
      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
      <span className="flabel">{tt(lang, "Create", "Создать")}</span>
    </Link> : <button className="fab" onClick={() => go("create")} aria-label="Create">
      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
      <span className="flabel">{tt(lang, "Create", "Создать")}</span>
    </button>}
  </div></div>;
}

export { NavIcon };
