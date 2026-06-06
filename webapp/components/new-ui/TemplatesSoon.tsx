"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { initTelegram } from "@/lib/telegram";
import type { User } from "@/lib/types";
import BottomNav from "./BottomNav";
import TopBar from "./TopBar";
import { IC, PH, TEMPLATES, toText, tt } from "./prototypeData";
import { ScreenHead } from "./shared";

export default function TemplatesSoon({ code }: { code?: string }) {
  const [lang, setLang] = useState("ru");
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("hubicx-locale") || localStorage.getItem("hbx_lang");
      if (stored) setLang(stored);
    } catch {}
    let cancelled = false;
    async function load() {
      try {
        await initTelegram();
        const user = await api.me() as User;
        if (cancelled) return;
        setBalance(user.balance_credits || 0);
        if (!localStorage.getItem("hubicx-locale")) setLang(user.language_code || "ru");
      } catch {}
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const selected = code ? TEMPLATES.find((item) => item.code === code) : undefined;
  const items = selected ? [selected] : TEMPLATES;

  return <div className="phone"><TopBar balance={balance} lang={lang} onLang={setLang} onBalance={() => location.assign("/balance")} /><div className="scroll"><div className="page"><ScreenHead lang={lang} title={selected ? toText(selected.title, lang) : tt(lang, "Templates", "Шаблоны", "Plantillas", "Modelos")} sub={selected ? tt(lang, "This template will be available soon.", "Этот шаблон скоро будет доступен.", "Esta plantilla estará disponible pronto.", "Este modelo estará disponível em breve.") : tt(lang, "Visual catalog. Real template execution is coming soon.", "Визуальный каталог. Реальный запуск шаблонов скоро появится.", "Catálogo visual. La ejecución real llegará pronto.", "Catálogo visual. A execução real chega em breve.")} />
    <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr" : "1fr 1fr", gap: 13, marginTop: 6 }}>
      {items.map((item, index) => <div key={item.id} className="card fu" style={{ padding: 0, overflow: "hidden", textAlign: "left", animationDelay: index * 40 + "ms", opacity: .96 }}>
        <div style={{ position: "relative", aspectRatio: "1/1", background: "var(--surface-blue)" }}><img src={PH(item.ph)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /><div style={{ position: "absolute", left: 8, top: 8, width: 34, height: 34, borderRadius: 11, background: "rgba(255,255,255,.86)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--sh-sm)" }}><img src={IC(item.icon)} style={{ width: 26, height: 26 }} alt="" /></div><div style={{ position: "absolute", right: 8, top: 8, background: "var(--grad)", color: "#fff", padding: "4px 9px", borderRadius: 99, fontSize: 10.5, fontWeight: 800 }}>{tt(lang, "Soon", "Скоро", "Pronto", "Em breve")}</div></div>
        <div style={{ padding: 12 }}><div style={{ fontSize: 14, fontWeight: 800 }}>{toText(item.title, lang)}</div><div className="muted" style={{ marginTop: 5, fontSize: 12, fontWeight: 700 }}>{tt(lang, "No fake submit — real flow will be connected later.", "Без fake submit — реальный запуск будет подключён позже.", "Sin envío falso: el flujo real se conectará después.", "Sem envio falso — o fluxo real será conectado depois.")}</div></div>
      </div>)}
    </div>
  </div></div><BottomNav tab="create" lang={lang} routeLinks go={() => undefined} /></div>;
}
