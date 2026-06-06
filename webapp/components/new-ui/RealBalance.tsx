"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { mapApiBalanceToBalanceView } from "@/lib/hubicxAdapters";
import { initTelegram } from "@/lib/telegram";
import type { User } from "@/lib/types";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import { DOCS, IC, PACKAGES, TX, toText, tt } from "./prototypeData";
import { ScreenHead } from "./shared";

export default function RealBalance() {
  const [lang, setLang] = useState("ru");
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        await initTelegram();
        const view = mapApiBalanceToBalanceView(await api.me() as User);
        if (cancelled) return;
        setLang(view.languageCode);
        setBalance(view.credits);
      } catch (event) {
        if (!cancelled) setError(event instanceof Error ? event.message : "Load error");
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  return <div className="phone"><TopBar balance={balance} lang={lang} onLang={setLang} onBalance={() => undefined} /><div className="scroll"><div className="page"><ScreenHead lang={lang} title={tt(lang, "Balance", "Баланс")} />{error ? <div className="card" style={{ padding: 14, color: "var(--danger)", fontWeight: 800 }}>{error}</div> : null}<div className="card" style={{ background: "var(--grad)", border: "none", padding: "22px 22px 20px", color: "#fff", position: "relative", overflow: "hidden", boxShadow: "var(--sh-blue)" }}><img src={IC("coins")} alt="" style={{ position: "absolute", right: -10, top: -6, width: 108, height: 108, opacity: .9, filter: "drop-shadow(0 10px 18px rgba(0,40,90,.3))" }} /><div style={{ fontSize: 13, fontWeight: 700, opacity: .9 }}>{tt(lang, "Current balance", "Текущий баланс")}</div><div style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-.03em", lineHeight: 1.05, margin: "4px 0 2px" }}>{balance.toLocaleString()}</div><div style={{ fontSize: 13.5, fontWeight: 700, opacity: .92 }}>{tt(lang, "credits available", "доступно кредитов")}</div></div><div className="section-h"><h3>{tt(lang, "Top up credits", "Пополнить баланс")}</h3></div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{PACKAGES.map((pack, index) => <button key={pack.id} className="card fu" disabled title={tt(lang, "Payments are connected through the existing billing flow.", "Оплата подключается через существующий биллинг.")} style={{ padding: "16px 14px", textAlign: "left", position: "relative", animationDelay: index * 45 + "ms", border: pack.popular || pack.best ? "1.5px solid var(--blue)" : "1px solid var(--border)", opacity: .92 }}><img src={IC("coins")} alt="" style={{ width: 40, height: 40, marginBottom: 8 }} /><div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em" }}>{pack.credits.toLocaleString()}</div><div className="muted" style={{ fontSize: 12, fontWeight: 700, marginTop: 2 }}>{pack.bonus ? `+${pack.bonus} ${tt(lang, "bonus", "бонус")}` : tt(lang, "credits", "кредитов")}</div><div style={{ marginTop: 10, fontSize: 15, fontWeight: 800, color: "var(--blue)" }}>{pack.price}</div></button>)}</div><div className="section-h"><h3>{tt(lang, "Transactions", "Транзакции")}</h3></div><div className="card" style={{ padding: "4px 0" }}>{TX.map((tx) => <div key={tx.id} className="row" style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)" }}><img src={IC(tx.icon)} alt="" style={{ width: 32, height: 32 }} /><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13.5, fontWeight: 800 }}>{toText(tx.label, lang)}</div><div className="muted" style={{ fontSize: 11.5, fontWeight: 700 }}>{toText(tx.date, lang)}</div></div><div style={{ fontWeight: 800, color: tx.kind === "topup" ? "var(--success)" : "var(--text)" }}>{tx.amount}</div></div>)}</div><div className="section-h"><h3>{tt(lang, "Documents", "Документы")}</h3></div><div style={{ display: "grid", gap: 10 }}>{DOCS.map((doc) => <a key={doc.id} href="/docs" className="card row" style={{ padding: 14, gap: 12, textDecoration: "none" }}><img src={IC(doc.icon)} alt="" style={{ width: 30, height: 30 }} /><span style={{ fontWeight: 800, color: "var(--text)" }}>{toText(doc.title, lang)}</span></a>)}</div></div></div><BottomNav tab="balance" lang={lang} go={(next) => location.assign(next === "home" ? "/" : next === "create" ? "/create" : `/${next}`)} /></div>;
}
