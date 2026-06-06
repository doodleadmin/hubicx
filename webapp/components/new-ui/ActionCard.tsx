"use client";

import { IC, TASKS, toText, tt } from "./prototypeData";
import { GlossTile, Token } from "./shared";

export default function ActionCard({ task, lang, onOpen, index = 0 }: { task: (typeof TASKS)[number]; lang: string; onOpen: (id: string) => void; index?: number }) {
  return <button className="card fu" style={{ padding: 14, display: "flex", alignItems: "center", gap: 14, textAlign: "left", animationDelay: index * 50 + "ms" }} onClick={() => onOpen(task.id)}>
    <GlossTile icon={task.icon} size={54} style={{ borderRadius: 16, flex: "0 0 auto" }} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="row" style={{ gap: 8 }}><span style={{ fontSize: 15.5, fontWeight: 800, letterSpacing: "-.01em" }}>{toText(task.title, lang)}</span>{task.pro && <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", background: "var(--grad)", padding: "2px 8px", borderRadius: 99 }}>PRO</span>}</div>
      <div className="t2" style={{ fontSize: 13, marginTop: 2, fontWeight: 500 }}>{toText(task.desc, lang)}</div>
      <div style={{ marginTop: 7, fontSize: 12.5, fontWeight: 700, color: "var(--text-2)", display: "flex", alignItems: "center", gap: 5 }}>{tt(lang, "from", "от")} <Token size={14} />{task.cost}</div>
    </div>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
  </button>;
}
