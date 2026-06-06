"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { mapApiTaskToHistoryCard } from "@/lib/hubicxAdapters";
import { initTelegram } from "@/lib/telegram";
import type { Generation, User } from "@/lib/types";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import { COV, IC, tt } from "./prototypeData";
import { ScreenHead } from "./shared";

export default function RealHistory() {
  const [lang, setLang] = useState("ru");
  const [balance, setBalance] = useState(0);
  const [items, setItems] = useState<Generation[]>([]);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        await initTelegram();
        const [user, history] = await Promise.all([api.me(), api.history()]);
        if (cancelled) return;
        const typedUser = user as User;
        setLang(typedUser.language_code || "ru");
        setBalance(typedUser.balance_credits || 0);
        setItems(history as Generation[]);
      } catch (event) {
        if (!cancelled) setError(event instanceof Error ? event.message : "Load error");
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const filters = [{ id: "all", l: tt(lang, "All", "Все") }, { id: "image", l: tt(lang, "Images", "Фото") }, { id: "video", l: tt(lang, "Videos", "Видео") }, { id: "text", l: tt(lang, "Text", "Текст") }, { id: "failed", l: tt(lang, "Failed", "Ошибки") }];
  const cards = items.map(mapApiTaskToHistoryCard).filter((item) => filter === "all" ? true : filter === "failed" ? item.status === "failed" || item.status === "refunded" : item.taskType === filter);

  return <div className="phone"><TopBar balance={balance} lang={lang} onLang={setLang} onBalance={() => location.assign("/balance")} /><div className="scroll"><div className="page"><ScreenHead lang={lang} title={tt(lang, "History", "История")} sub={tt(lang, "Everything you have created.", "Все, что вы создали.")} />{error ? <div className="card" style={{ padding: 14, color: "var(--danger)", fontWeight: 800 }}>{error}</div> : null}<div className="chiprow" style={{ marginBottom: 8 }}>{filters.map((item) => <button key={item.id} className={"chip" + (filter === item.id ? " on" : "")} onClick={() => setFilter(item.id)}>{item.l}</button>)}</div><div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 6 }}>{cards.length ? cards.map((item, index) => <div key={item.id} className="card fu" style={{ padding: 12, animationDelay: index * 45 + "ms" }}><div className="row" style={{ gap: 12, alignItems: "flex-start" }}><div style={{ width: 60, height: 60, borderRadius: 14, overflow: "hidden", flex: "0 0 auto", background: "var(--surface-blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>{item.resultUrl ? <img src={item.resultUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <img src={IC(item.taskType === "video" ? "videocam" : item.taskType === "text" ? "chat_pencil" : "nano_image")} alt="" style={{ width: 38, height: 38 }} />}</div><div style={{ flex: 1, minWidth: 0 }}><div className="row" style={{ justifyContent: "space-between", gap: 8 }}><span style={{ fontSize: 14.5, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</span><span style={{ fontSize: 10.5, fontWeight: 800, color: item.status === "completed" ? "var(--success)" : "var(--warning)", background: item.status === "completed" ? "#E8F8EE" : "#FFF5DE", padding: "3px 8px", borderRadius: 99, flex: "0 0 auto" }}>{item.status}</span></div><div className="t2" style={{ fontSize: 12.5, fontWeight: 500, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.prompt || `#${item.id}`}</div><div className="row" style={{ gap: 10, marginTop: 6 }}><span className="muted" style={{ fontSize: 11.5, fontWeight: 700 }}>{item.taskType}</span><span className="muted" style={{ fontSize: 11.5, fontWeight: 700 }}>{item.cost} cr</span></div></div></div><div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 7, marginTop: 11 }}><a className="btn-white" href={item.resultUrl || `/history?task=${item.id}`} target="_blank" rel="noreferrer" style={{ height: 46, borderRadius: 14, fontSize: 11, fontWeight: 800, color: "var(--text-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>{tt(lang, "Open", "Открыть")}</a><button className="btn-white" onClick={() => api.sendToChat(item.id).catch(() => undefined)} style={{ height: 46, borderRadius: 14, fontSize: 11, fontWeight: 800, color: "var(--text-2)" }}>{tt(lang, "Send", "Отправить")}</button><a className="btn-white" href={`/generate?model=${item.title}`} style={{ height: 46, borderRadius: 14, fontSize: 11, fontWeight: 800, color: "var(--text-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>{tt(lang, "Repeat", "Повтор")}</a><button className="btn-white" onClick={() => item.prompt && navigator.clipboard?.writeText(item.prompt)} style={{ height: 46, borderRadius: 14, fontSize: 11, fontWeight: 800, color: "var(--text-2)" }}>{tt(lang, "Copy", "Промпт")}</button></div></div>) : <div className="card" style={{ padding: 18, textAlign: "center" }}><img src={COV("m3")} alt="" style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 18, marginBottom: 12 }} /><b>{tt(lang, "No generations yet", "Пока нет генераций")}</b><p className="t2">{tt(lang, "Create something and it will appear here.", "Создайте что-нибудь, и оно появится здесь.")}</p></div>}</div></div></div><BottomNav tab="history" lang={lang} go={(next) => location.assign(next === "home" ? "/" : next === "create" ? "/create" : `/${next}`)} /></div>;
}
