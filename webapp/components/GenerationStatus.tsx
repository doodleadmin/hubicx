"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Generation } from "@/lib/types";

const statusLabels: Record<string, string> = {
  created: "Задача создана",
  queued: "В очереди",
  processing: "Генерация...",
  completed: "Готово",
  refunded: "Ошибка, кредиты возвращены",
  failed: "Ошибка генерации"
};

function isImage(url: string) {
  return /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(url);
}

function isVideo(url: string) {
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
}

export default function GenerationStatus({ task, onGenerateAgain }: { task?: Generation; onGenerateAgain?: () => void }) {
  const [sendState, setSendState] = useState<"idle" | "sending" | "success" | "error">("idle");

  if (!task) return null;

  async function sendToChat() {
    if (!task) return;
    setSendState("sending");
    try {
      await api.sendToChat(task.id);
      setSendState("success");
    } catch {
      setSendState("error");
    }
  }

  const fileUrl = task.output_file_url || "";
  const canSend = task.status === "completed" && (task.output_file_url || task.output_text);
  const textResult = !!task.output_text && !task.output_file_url;

  return <section className="rounded-3xl border border-white/10 bg-card p-4">
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted">Статус</span>
      <b>{statusLabels[task.status] || task.status}</b>
    </div>
    {task.status === "created" || task.status === "processing" || task.status === "queued" ? <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-2/3 animate-pulse rounded-full bg-accent" /></div> : null}
    {task.output_text ? <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4"><p className="mb-2 text-xs uppercase tracking-wide text-muted">Текстовый результат</p><pre className="whitespace-pre-wrap text-sm leading-relaxed text-white">{task.output_text}</pre></div> : null}
    {fileUrl && isImage(fileUrl) ? <img className="mt-4 max-h-[520px] w-full rounded-2xl object-contain" src={fileUrl} alt="Результат генерации" /> : null}
    {fileUrl && isVideo(fileUrl) ? <video className="mt-4 w-full rounded-2xl" src={fileUrl} controls playsInline /> : null}
    {fileUrl && !isImage(fileUrl) && !isVideo(fileUrl) ? <a className="mt-4 block break-all rounded-2xl bg-black/20 p-3 text-sm text-accent" href={fileUrl} target="_blank" rel="noreferrer">Открыть оригинал</a> : null}
    {task.error_message ? <p className="mt-3 rounded-2xl bg-red-500/10 p-3 text-sm text-red-200">{task.error_message}</p> : null}
    {canSend ? <div className="mt-4 grid gap-3">
      <button className="rounded-2xl bg-accent py-3 font-semibold text-black disabled:opacity-60" onClick={sendToChat} disabled={sendState === "sending"}>{task.output_text ? "📩 Отправить текст в чат" : "📩 Отправить файлом в чат"}</button>
      {fileUrl ? <a className="rounded-2xl bg-white/10 py-3 text-center font-semibold" href={fileUrl} target="_blank" rel="noreferrer">Открыть оригинал</a> : null}
      {sendState === "sending" ? <p className="text-sm text-muted">{textResult ? "Отправляем текст..." : "Отправляем файл..."}</p> : null}
      {sendState === "success" ? <p className="text-sm text-accent">{textResult ? "✅ Текст отправлен в чат" : "✅ Файл отправлен в чат"}</p> : null}
      {sendState === "error" ? <p className="text-sm text-red-300">{textResult ? "❌ Не удалось отправить текст" : "❌ Не удалось отправить файл"}</p> : null}
    </div> : null}
    {task.status === "completed" || task.status === "refunded" || task.status === "failed" ? <button className="mt-3 w-full rounded-2xl bg-white/10 py-3 font-semibold" onClick={onGenerateAgain}>Сгенерировать ещё раз</button> : null}
  </section>;
}

export { statusLabels, isImage, isVideo };
