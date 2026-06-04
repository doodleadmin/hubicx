import { Generation } from "@/lib/types";
import { Locale, t, translateError } from "@/lib/i18n";
import { getStatusLabel, isImage, isVideo } from "./GenerationStatus";

function preview(item: Generation, locale: Locale) {
  if (item.output_text) return <p className="mt-3 line-clamp-4 rounded-2xl bg-surface-soft p-3 text-sm leading-6 text-ink-primary">{item.output_text}</p>;
  if (item.output_file_url && isImage(item.output_file_url)) return <img className="mt-3 max-h-56 w-full rounded-2xl object-cover" src={item.output_file_url} alt={t(locale, "result.title")} />;
  if (item.output_file_url && isVideo(item.output_file_url)) return <video className="mt-3 w-full rounded-2xl" src={item.output_file_url} controls playsInline />;
  if (item.output_file_url) return <a className="mt-3 block break-all rounded-2xl bg-brand-soft p-3 text-sm font-semibold text-brand-primary" href={item.output_file_url} target="_blank" rel="noreferrer">{t(locale, "history.openResult")}</a>;
  return null;
}

function statusClass(status: string) {
  if (status === "completed") return "bg-green-50 text-green-700";
  if (status === "failed") return "bg-red-50 text-red-700";
  if (status === "refunded") return "bg-amber-50 text-amber-700";
  return "bg-brand-soft text-brand-primary";
}

export default function HistoryList({ items, locale = "ru" }: { items: Generation[]; locale?: Locale }) {
  const dateLocale = locale === "ru" ? "ru-RU" : locale;
  if (!items.length) return <div className="rounded-card border border-border-soft bg-white p-8 text-center shadow-soft-sm"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-brand-soft text-2xl text-brand-primary">◇</div><h3 className="mt-4 text-lg font-black text-ink-primary">{t(locale, "history.emptyTitle")}</h3><p className="mt-2 text-sm text-ink-secondary">{t(locale, "history.emptySubtitle")}</p></div>;
  return <div className="space-y-3">{items.map((item) => <article key={item.id} className="rounded-card border border-border-soft bg-white p-4 shadow-soft-sm">
    <div className="flex items-start justify-between gap-3"><div><h3 className="font-extrabold text-ink-primary">{item.title || item.model_code || item.task_type}</h3><p className="mt-1 text-xs text-ink-muted">#{item.id} · {new Date(item.created_at).toLocaleString(dateLocale)}</p></div><span className={`rounded-pill px-3 py-1 text-xs font-bold ${statusClass(item.status)}`}>{getStatusLabel(item.status, locale)}</span></div>
    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-ink-secondary"><span className="rounded-pill bg-surface-blue px-3 py-1">{item.task_type}</span><span className="rounded-pill bg-surface-blue px-3 py-1">{item.cost_credits} 🪙</span></div>
    {preview(item, locale)}
    {["refunded", "failed"].includes(item.status) && item.error_message ? <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{translateError({ message: item.error_message }, locale)}</p> : null}
  </article>)}</div>;
}
