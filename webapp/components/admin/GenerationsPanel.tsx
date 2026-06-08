"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AdminTask, PaginatedResponse } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  completed: "text-accent",
  created: "text-muted",
  processing: "text-yellow-400",
  failed: "text-red-400",
  cancelled: "text-red-400",
  refunded: "text-orange-400",
};

export default function GenerationsPanel() {
  const [data, setData] = useState<PaginatedResponse<AdminTask> | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailTask, setDetailTask] = useState<AdminTask | null>(null);

  const load = useCallback(async (p: number, s: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.adminGenerationTasks(p, 50, s || undefined) as PaginatedResponse<AdminTask>;
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(page, statusFilter); }, [page, statusFilter, load]);

  if (loading && !data) return <p className="text-muted text-sm">Загрузка...</p>;
  if (error && !data) return <p className="text-red-400 text-sm">{error}</p>;
  if (!data) return null;

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-xl border border-white/10 bg-card px-3 py-1.5 text-xs outline-none">
          <option value="">Все статусы</option>
          <option value="created">Created</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-xs">
          <thead>
            <tr className="border-b border-white/10 text-left text-muted">
              <th className="pb-2 pr-2">#</th>
              <th className="pb-2 pr-2">User</th>
              <th className="pb-2 pr-2">Model</th>
              <th className="pb-2 pr-2">Status</th>
              <th className="pb-2 pr-2 text-right">Cost</th>
              <th className="pb-2 pr-2">Prompt</th>
              <th className="pb-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((t) => (
              <tr key={t.id} className="cursor-pointer border-b border-white/5 hover:bg-white/5" onClick={() => setDetailTask(t)}>
                <td className="py-2 pr-2 font-mono">{t.id}</td>
                <td className="py-2 pr-2">{t.telegram_id || t.user_id}</td>
                <td className="py-2 pr-2">{t.model_code || t.task_type}</td>
                <td className={`py-2 pr-2 font-semibold ${STATUS_COLORS[t.status] || "text-white"}`}>{t.status}</td>
                <td className="py-2 pr-2 text-right font-mono">{t.cost_credits}</td>
                <td className="max-w-[160px] truncate py-2 pr-2 text-muted">{t.prompt || "—"}</td>
                <td className="py-2 text-muted">{t.created_at ? new Date(t.created_at).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span>Всего: {data.total}</span>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg bg-card px-3 py-1 disabled:opacity-40">Назад</button>
          <span className="py-1">Стр. {page}</span>
          <button disabled={data.items.length < data.limit} onClick={() => setPage((p) => p + 1)} className="rounded-lg bg-card px-3 py-1 disabled:opacity-40">Вперёд</button>
        </div>
      </div>
      {detailTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setDetailTask(null)}>
          <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl bg-card p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold">Задача #{detailTask.id}</h3>
            <div className="mt-3 space-y-2 text-sm">
              <Row label="User ID" value={String(detailTask.user_id)} />
              <Row label="Model" value={detailTask.model_code || (detailTask.model_id != null ? String(detailTask.model_id) : "—")} />
              <Row label="Type" value={detailTask.task_type} />
              <Row label="Status" value={detailTask.status} />
              <Row label="Cost" value={`${detailTask.cost_credits} 🪙`} />
              <Row label="Created" value={detailTask.created_at || "—"} />
              <Row label="Completed" value={detailTask.completed_at || "—"} />
              {detailTask.prompt && <div><span className="text-muted">Prompt:</span><p className="mt-1 whitespace-pre-wrap text-white/80">{detailTask.prompt}</p></div>}
              {detailTask.error_message && <div><span className="text-red-400">Error:</span><p className="mt-1 whitespace-pre-wrap text-red-300">{detailTask.error_message}</p></div>}
              {detailTask.output_file_url && (
                <div>
                  <span className="text-muted">Output:</span>
                  {detailTask.output_file_url.match(/\.(mp4|webm)$/i) ? (
                    <video src={detailTask.output_file_url} controls playsInline className="mt-2 w-full rounded-xl" />
                  ) : detailTask.output_file_url.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                    <img src={detailTask.output_file_url} alt="output" className="mt-2 w-full rounded-xl" />
                  ) : (
                    <a href={detailTask.output_file_url} target="_blank" rel="noreferrer" className="mt-1 block break-all text-accent underline">{detailTask.output_file_url}</a>
                  )}
                </div>
              )}
            </div>
            <button onClick={() => setDetailTask(null)} className="mt-4 w-full rounded-xl bg-white/5 py-2 text-sm">Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-2"><span className="shrink-0 text-muted">{label}:</span><span className="text-right font-mono">{value}</span></div>;
}
