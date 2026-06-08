"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AdminTransaction, PaginatedResponse } from "@/lib/types";

const TYPE_COLORS: Record<string, string> = {
  generation_charge: "text-red-400",
  refund: "text-orange-400",
  admin_bonus: "text-accent",
  payment: "text-accent",
  referral_bonus: "text-blue-400",
};

export default function TransactionsPanel() {
  const [data, setData] = useState<PaginatedResponse<AdminTransaction> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.adminTransactions(p) as PaginatedResponse<AdminTransaction>;
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
        <table className="w-full min-w-[650px] text-xs">
          <thead>
            <tr className="border-b border-white/10 text-left text-muted">
              <th className="pb-2 pr-2">#</th>
              <th className="pb-2 pr-2">User</th>
              <th className="pb-2 pr-2">Type</th>
              <th className="pb-2 pr-2 text-right">Amount</th>
              <th className="pb-2 pr-2">Status</th>
              <th className="pb-2 pr-2">Comment</th>
              <th className="pb-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((t) => (
              <tr key={t.id} className="border-b border-white/5">
                <td className="py-2 pr-2 font-mono">{t.id}</td>
                <td className="py-2 pr-2">{t.user_id}</td>
                <td className={`py-2 pr-2 font-semibold ${TYPE_COLORS[t.type] || "text-white"}`}>{t.type}</td>
                <td className="py-2 pr-2 text-right font-mono">{t.amount_credits > 0 ? "+" : ""}{t.amount_credits}</td>
                <td className="py-2 pr-2">{t.status}</td>
                <td className="max-w-[140px] truncate py-2 pr-2 text-muted">{t.comment || "—"}</td>
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
    </div>
  );
}
