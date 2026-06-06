"use client";

import { CSSProperties } from "react";
import { IC, tt } from "./prototypeData";

export function Token({ size = 18 }: { size?: number }) {
  return <img src={IC("coins")} alt="" style={{ width: size, height: size, verticalAlign: "-3px" }} />;
}

export function Cost({ n }: { n: number }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 800, color: "var(--text)" }}><Token size={16} />{n}</span>;
}

export function GlossTile({ icon, size = 56, pad = 0.14, bg = true, style }: { icon: string; size?: number; pad?: number; bg?: boolean; style?: CSSProperties }) {
  return <div className={bg ? "gloss-tile" : ""} style={{ width: size, height: size, ...style }}><img src={IC(icon)} alt="" style={{ width: `${100 - pad * 200}%`, height: `${100 - pad * 200}%`, objectFit: "contain", filter: "drop-shadow(0 6px 10px rgba(0,90,180,.16))" }} /></div>;
}

export function ScreenHead({ title, sub, onBack, lang }: { title: string; sub?: string; onBack?: () => void; lang: string }) {
  return <div>{onBack && <button className="backbtn" onClick={onBack}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>{tt(lang, "Back", "Назад")}</button>}<h1 className="ptitle">{title}</h1>{sub && <p className="psub">{sub}</p>}</div>;
}

export function Badge({ kind, lang }: { kind?: string | null; lang: string }) {
  if (!kind) return null;
  return <span className={"badge " + kind}><svg className="spark" viewBox="0 0 24 24" fill="#fff"><path d="M12 2l2.2 6.2L20 10l-5.8 1.8L12 18l-2.2-6.2L4 10z" /></svg>{kind === "new" ? tt(lang, "New", "New") : tt(lang, "Hot", "Hot")}</span>;
}

export function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return <div className="row" style={{ justifyContent: "space-between", margin: "18px 2px 9px" }}><span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-.01em" }}>{children}</span>{hint && <span className="muted" style={{ fontSize: 12, fontWeight: 700 }}>{hint}</span>}</div>;
}

export function PillGroup({ options, value, onChange, col }: { options: Array<string | number | { v: string | number; l: string; lock?: boolean }>; value: string | number | boolean; onChange: (value: string | number) => void; col?: boolean }) {
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>{options.map((option) => {
    const val = typeof option === "object" ? option.v : option;
    const label = typeof option === "object" ? option.l : option;
    const lock = typeof option === "object" && option.lock;
    const on = val === value;
    return <button key={String(val)} disabled={Boolean(lock)} onClick={() => !lock && onChange(val)} className="chip" style={{ flex: col ? 1 : "0 0 auto", justifyContent: "center", opacity: lock ? .5 : 1, ...(on ? { background: "var(--grad)", color: "#fff", borderColor: "transparent", boxShadow: "0 6px 14px rgba(0,132,240,.28)" } : {}) }}>{label}{lock && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" style={{ marginLeft: 4 }}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>}</button>;
  })}</div>;
}

export function PlaceholderSlot({ id, src, placeholder }: { id: string; src?: string; placeholder: string }) {
  return <div className="card" style={{ padding: 0, overflow: "hidden", border: "1.5px dashed var(--border)", background: "var(--surface-blue)", boxShadow: "none" }}><label htmlFor={id} style={{ display: "block", width: "100%", height: 140, cursor: "pointer" }}>{src ? <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, color: "var(--text-2)", textAlign: "center", padding: 12 }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg><span style={{ fontSize: 13, fontWeight: 600 }}>{placeholder}</span></div>}</label></div>;
}
