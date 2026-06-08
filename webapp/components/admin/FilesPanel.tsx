"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AdminFile, PaginatedResponse } from "@/lib/types";

function formatSize(bytes?: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FilesPanel() {
  const [data, setData] = useState<PaginatedResponse<AdminFile> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.adminFiles(p) as PaginatedResponse<AdminFile>;
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(page); }, [page, load]);

  if (loading && !data) return <p className="text-muted text-sm">Загрузка...</p>;
  if (error && !data) return <p className="text-red-400 text-sm">{error}</p>;
  if (!data) return null;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-xs">
          <thead>
            <tr className="border-b border-white/10 text-left text-muted">
              <th className="pb-2 pr-2">#</th>
              <th className="pb-2 pr-2">User</th>
              <th className="pb-2 pr-2">Type</th>
              <th className="pb-2 pr-2">Purpose</th>
              <th className="pb-2 pr-2">MIME</th>
              <th className="pb-2 pr-2 text-right">Size</th>
              <th className="pb-2 pr-2">Created</th>
              <th className="pb-2">Действия</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((f) => (
              <tr key={f.id} className="border-b border-white/5">
                <td className="py-2 pr-2 font-mono">{f.id}</td>
                <td className="py-2 pr-2">{f.user_id}</td>
                <td className="py-2 pr-2">{f.file_type}</td>
                <td className="py-2 pr-2">
                  <span className={`rounded-lg px-1.5 py-0.5 text-[10px] font-semibold ${f.purpose === "output" ? "bg-accent/20 text-accent" : "bg-blue-500/20 text-blue-400"}`}>{f.purpose}</span>
                </td>
                <td className="py-2 pr-2 text-muted">{f.mime_type || "—"}</td>
                <td className="py-2 pr-2 text-right font-mono">{formatSize(f.size_bytes)}</td>
                <td className="py-2 pr-2 text-muted">{f.created_at ? new Date(f.created_at).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                <td className="py-2">
                  <div className="flex gap-1">
                    <a href={f.storage_url} target="_blank" rel="noreferrer" className="rounded-lg bg-white/10 px-2 py-0.5 text-muted hover:text-white">Открыть</a>
                    <button onClick={() => { void navigator.clipboard.writeText(f.storage_url); }} className="rounded-lg bg-white/10 px-2 py-0.5 text-muted hover:text-white">Копировать</button>
                  </div>
                </td>
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
    </div>
  );
}
