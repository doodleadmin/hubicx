"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { initTelegram } from "@/lib/telegram";
import type { User } from "@/lib/types";
import BottomNav from "@/components/new-ui/BottomNav";
import TopBar from "@/components/new-ui/TopBar";
import { IC, tt } from "@/components/new-ui/prototypeData";
import { ScreenHead } from "@/components/new-ui/shared";

const DOC_ITEMS = [
  { icon: "document", en: "Top-up rules", ru: "Правила пополнения баланса", es: "Reglas de recarga", pt: "Regras de recarga" },
  { icon: "wallet", en: "Payment information", ru: "Информация о платежах", es: "Información de pagos", pt: "Informações de pagamento" },
  { icon: "shield", en: "Privacy policy", ru: "Политика конфиденциальности", es: "Política de privacidad", pt: "Política de privacidade" },
  { icon: "document", en: "Terms of use", ru: "Условия использования", es: "Términos de uso", pt: "Termos de uso" },
  { icon: "send", en: "Support", ru: "Поддержка", es: "Soporte", pt: "Suporte" },
];

export default function DocsPage() {
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

  return <div className="phone"><TopBar balance={balance} lang={lang} onLang={setLang} onBalance={() => location.assign("/balance")} /><div className="scroll"><div className="page"><ScreenHead lang={lang} title={tt(lang, "Documentation", "Документация", "Documentación", "Documentação")} sub={tt(lang, "Short reference for Hubicx models, balance and support.", "Краткая справка по моделям Hubicx, балансу и поддержке.", "Referencia breve sobre modelos, saldo y soporte de Hubicx.", "Referência rápida sobre modelos, saldo e suporte do Hubicx.")} />
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {DOC_ITEMS.map((item, index) => <section key={item.ru} className="card fu" style={{ padding: 16, animationDelay: index * 45 + "ms" }}><div className="row" style={{ gap: 13, alignItems: "center" }}><div style={{ width: 48, height: 48, borderRadius: 16, background: "var(--surface-blue)", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}><img src={IC(item.icon)} alt="" style={{ width: 30, height: 30 }} /></div><div><h2 style={{ fontSize: 15.5, fontWeight: 800, margin: 0 }}>{tt(lang, item.en, item.ru, item.es, item.pt)}</h2><p className="t2" style={{ marginTop: 4, fontSize: 12.5, fontWeight: 500 }}>{tt(lang, "This section is informational and does not start payments or generations.", "Информационный раздел: платежи и генерации отсюда не запускаются.", "Sección informativa: no inicia pagos ni generaciones.", "Seção informativa: não inicia pagamentos nem gerações.")}</p></div></div></section>)}
    </div>
  </div></div><BottomNav tab="home" lang={lang} routeLinks go={() => undefined} /></div>;
}
