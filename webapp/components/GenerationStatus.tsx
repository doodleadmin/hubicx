"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Locale, t, translateError } from "@/lib/i18n";
import { Generation } from "@/lib/types";

const statusLabels: Record<string, string> = {
  created: "Задача создана",
  queued: "В очереди",
  processing: "Создаём результат",
  completed: "Готово",
  refunded: "Ошибка, кредиты возвращены",
  failed: "Ошибка генерации"
};

const statusStyles: Record<string, string> = {
  created: "bg-brand-soft text-brand-primary",
  queued: "bg-brand-soft text-brand-primary",
  processing: "bg-brand-soft text-brand-primary",
  completed: "bg-green-50 text-green-700",
  refunded: "bg-amber-50 text-amber-700",
  failed: "bg-red-50 text-red-700"
};

function getStatusLabel(status: string, locale: Locale = "ru") {
  return t(locale, `status.${status}`) || statusLabels[status] || status;
}

function isImage(url: string) {
  return /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(url);
}

function isVideo(url: string) {
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
}

export default function GenerationStatus({ task, onGenerateAgain, locale = "ru" }: { task?: Generation; onGenerateAgain?: () => void; locale?: Locale }) {
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

  return <section className="rounded-card border border-border-soft bg-white p-5 shadow-soft-sm">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-ink-secondary">{t(locale, "result.title")}</p>
        <h2 className="mt-1 text-xl font-black text-ink-primary">{getStatusLabel(task.status, locale)}</h2>
      </div>
      <span className={`rounded-pill px-3 py-1 text-xs font-bold ${statusStyles[task.status] || "bg-surface-blue text-ink-secondary"}`}>#{task.id}</span>
    </div>
    {task.status === "created" || task.status === "processing" || task.status === "queued" ? <div className="mt-5 h-2 overflow-hidden rounded-full bg-brand-soft"><div className="h-full w-2/3 animate-pulse rounded-full bg-[linear-gradient(135deg,#0084F0_0%,#33A0FF_100%)]" /></div> : null}
    {task.output_text ? <div className="mt-5 rounded-card border border-border-soft bg-surface-soft p-4"><p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">{t(locale, "result.text")}</p><pre className="whitespace-pre-wrap text-sm leading-relaxed text-ink-primary">{task.output_text}</pre></div> : null}
    {fileUrl && isImage(fileUrl) ? <div className="mt-5 overflow-hidden rounded-card border border-border-soft bg-surface-soft p-2"><img className="max-h-[520px] w-full rounded-[20px] object-contain" src={fileUrl} alt={t(locale, "result.title")} /></div> : null}
    {fileUrl && isVideo(fileUrl) ? <div className="mt-5 overflow-hidden rounded-card border border-border-soft bg-surface-soft p-2"><video className="w-full rounded-[20px]" src={fileUrl} controls playsInline /></div> : null}
    {fileUrl && !isImage(fileUrl) && !isVideo(fileUrl) ? <a className="mt-5 block break-all rounded-2xl bg-brand-soft p-3 text-sm font-semibold text-brand-primary" href={fileUrl} target="_blank" rel="noreferrer">{t(locale, "common.openOriginal")}</a> : null}
    {task.error_message ? <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{translateError({ message: task.error_message }, locale)}</p> : null}
    {canSend ? <div className="mt-4 grid gap-3">
      <button className="hubicx-primary-button w-full disabled:opacity-60" onClick={sendToChat} disabled={sendState === "sending"}>{task.output_text ? t(locale, "result.sendText") : t(locale, "result.sendFile")}</button>
      {fileUrl ? <a className="hubicx-secondary-button text-center" href={fileUrl} target="_blank" rel="noreferrer">{t(locale, "common.openOriginal")}</a> : null}
      {sendState === "sending" ? <p className="text-sm text-ink-secondary">{textResult ? t(locale, "result.sendingText") : t(locale, "result.sendingFile")}</p> : null}
      {sendState === "success" ? <p className="text-sm font-semibold text-green-600">{textResult ? t(locale, "result.textSent") : t(locale, "result.fileSent")}</p> : null}
      {sendState === "error" ? <p className="text-sm font-semibold text-red-600">{textResult ? t(locale, "result.textSendError") : t(locale, "result.fileSendError")}</p> : null}
    </div> : null}
    {task.status === "completed" || task.status === "refunded" || task.status === "failed" ? <button className="hubicx-secondary-button mt-3 w-full" onClick={onGenerateAgain}>{t(locale, "result.generateAgain")}</button> : null}
  </section>;
}

export { statusLabels, getStatusLabel, isImage, isVideo };
