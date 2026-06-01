import { Generation } from "@/lib/types";

export default function HistoryList({ items }: { items: Generation[] }) {
  if (!items.length) return <p className="text-muted">История пуста</p>;
  return <div className="space-y-3">{items.map((item) => <article key={item.id} className="rounded-3xl border border-white/10 bg-card p-4">
    <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{item.title || item.task_type}</h3><p className="text-xs text-muted">#{item.id} · {new Date(item.created_at).toLocaleString("ru-RU")}</p></div><span className="rounded-full bg-white/10 px-3 py-1 text-xs">{item.status}</span></div>
    <p className="mt-2 text-sm text-muted">Стоимость: {item.cost_credits} 🪙</p>
    {item.output_file_url ? <a className="mt-3 block text-accent" href={item.output_file_url}>Открыть результат</a> : null}
  </article>)}</div>;
}
