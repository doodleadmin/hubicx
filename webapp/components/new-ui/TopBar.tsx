"use client";

import { useEffect, useState } from "react";
import { applyHubicxTheme, getStoredHubicxTheme, toggleHubicxTheme, type HubicxTheme } from "@/lib/hubicxTheme";
import { IC, tt } from "./prototypeData";

const LANGUAGES = ["ru", "en", "es", "pt"] as const;

export default function TopBar({ balance, lang, onLang, onBalance }: { balance: number; lang: string; onLang: (lang: string) => void; onBalance: () => void }) {
  const [theme, setTheme] = useState<HubicxTheme>("signal");

  useEffect(() => {
    setTheme(getStoredHubicxTheme());
  }, []);

  function onThemeToggle() {
    const next = toggleHubicxTheme(theme);
    setTheme(next);
    applyHubicxTheme(next);
  }

  return <div className="topbar">
    <div className="brandmark">
      <img className="logo" src="/hubicx/logo.jpg" alt="Hubicx" />
      <b>Hubicx</b>
    </div>
    <div className="grow" />
    <button className="iconbtn" aria-label={tt(lang, "Theme", "Тема")} aria-pressed={theme === "onyx"} onClick={onThemeToggle}>
      {theme === "onyx" ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a9 9 0 1 0 0 18c1.2 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2 0-.9.7-1.5 1.5-1.5H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8Z" /><circle cx="7.5" cy="11" r="1" fill="var(--text-2)" stroke="none" /><circle cx="11" cy="7" r="1" fill="var(--text-2)" stroke="none" /><circle cx="15.5" cy="8" r="1" fill="var(--text-2)" stroke="none" /></svg>}
    </button>
    <div className="langtoggle">
      {LANGUAGES.map((code) => <button key={code} className={lang === code ? "on" : ""} onClick={() => {
        try {
          localStorage.setItem("hubicx-locale", code);
          localStorage.setItem("hbx_lang", code);
        } catch {}
        onLang(code);
      }}>{code.toUpperCase()}</button>)}
    </div>
    <button className="balpill" onClick={onBalance}>
      <img src={IC("coins")} alt="" /><span className="lbl">{balance.toLocaleString()}</span>
    </button>
  </div>;
}
