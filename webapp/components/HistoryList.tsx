import { Generation } from "@/lib/types";
import { isImage, isVideo, statusLabels } from "./GenerationStatus";

function preview(item: Generation) {
  if (item.output_text) return <p className="mt-3 line-clamp-4 rounded-2xl bg-black/20 p-3 text-sm text-white/90">{item.output_text}</p>;
  if (item.output_file_url && isImage(item.output_file_url)) return <img className="mt-3 max-h-56 w-full rounded-2xl object-cover" src={item.output_file_url} alt="Превью результата" />;
  if (item.output_file_url && isVideo(item.output_file_url)) return <video className="mt-3 w-full rounded-2xl" src={item.output_file_url} controls playsInline />;
  if (item.output_file_url) return <a className="mt-3 block break-all text-sm text-accent" href={item.output_file_url} target="_blank" rel="noreferrer">Открыть результат</a>;
  return null;
}

export default function HistoryList({ items }: { items: Generation[] }) {
  if (!items.length) return <p className="text-muted">История пуста</p>;
  return <div className="space-y-3">{items.map((item) => <article key={item.id} className="rounded-3xl border border-white/10 bg-card p-4">
    <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{item.title || item.model_code || item.task_type}</h3><p className="text-xs text-muted">#{item.id} · {new Date(item.created_at).toLocaleString("ru-RU")}</p></div><span className="rounded-full bg-white/10 px-3 py-1 text-xs">{statusLabels[item.status] || item.status}</span></div>
    <p className="mt-2 text-sm text-muted">Стоимость: {item.cost_credits} 🪙</p>
    {preview(item)}
    {["refunded", "failed"].includes(item.status) && item.error_message ? <p className="mt-3 rounded-2xl bg-red-500/10 p-3 text-sm text-red-200">{item.error_message}</p> : null}
  </article>)}</div>;
}
