import { Generation } from "@/lib/types";

export default function GenerationStatus({ task }: { task?: Generation }) {
  if (!task) return null;
  const label: Record<string, string> = { queued: "В очереди", processing: "Генерируется", completed: "Готово", refunded: "Ошибка, кредиты возвращены", failed: "Ошибка" };
  return <section className="rounded-3xl border border-white/10 bg-card p-4">
    <div className="flex items-center justify-between"><span className="text-muted">Статус</span><b>{label[task.status] || task.status}</b></div>
    {task.status === "processing" || task.status === "queued" ? <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-2/3 animate-pulse rounded-full bg-accent" /></div> : null}
    {task.output_text ? <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-black/20 p-3 text-sm">{task.output_text}</pre> : null}
    {task.output_file_url ? <a className="mt-4 block rounded-2xl bg-accent py-3 text-center font-semibold text-black" href={task.output_file_url}>Скачать результат</a> : null}
    {task.error_message ? <p className="mt-3 text-sm text-red-300">{task.error_message}</p> : null}
  </section>;
}
