"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AdminTask, AdminUser, BalanceLedgerItem, PaginatedResponse } from "@/lib/types";

export default function UsersPanel() {
  const [data, setData] = useState<PaginatedResponse<AdminUser> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [topUpTarget, setTopUpTarget] = useState<AdminUser | null>(null);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [detail, setDetail] = useState<{ user: AdminUser; ledger: BalanceLedgerItem[]; tasks: AdminTask[] } | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("Admin adjustment");

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.adminUsers(p) as PaginatedResponse<AdminUser>;
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(page); }, [page, load]);

  async function doTopUp() {
    if (!topUpTarget || !topUpAmount) return;
    const amount = Number(topUpAmount);
    if (!amount || amount <= 0) return;
    setTopUpLoading(true);
    try {
      await api.adminTopUp(topUpTarget.telegram_id, amount);
      setTopUpTarget(null);
      setTopUpAmount("");
      setToast(`Баланс пополнен на ${amount} 🪙`);
      setTimeout(() => setToast(""), 3000);
      void load(page);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка пополнения");
    } finally {
      setTopUpLoading(false);
    }
  }

  async function openUser(u: AdminUser) {
    try {
      const [user, ledger, tasks] = await Promise.all([
        api.adminUser(u.id),
        api.adminUserLedger(u.id, 1, 20),
        api.adminGenerationTasks(1, 10, undefined, u.id),
      ]);
      setDetail({ user: user as AdminUser, ledger: (ledger as PaginatedResponse<BalanceLedgerItem>).items, tasks: (tasks as PaginatedResponse<AdminTask>).items });
      setAdjustAmount("");
      setAdjustReason("Admin adjustment");
    } catch (e) { setError(e instanceof Error ? e.message : "Ошибка загрузки пользователя"); }
  }

  async function doAdjust() {
    if (!detail || !adjustAmount) return;
    try {
      await api.adminBalanceAdjust(detail.user.id, Number(adjustAmount), adjustReason || "Admin adjustment");
      setToast("Баланс изменён, ledger обновлён");
      setTimeout(() => setToast(""), 3000);
      await openUser(detail.user);
      void load(page);
    } catch (e) { setError(e instanceof Error ? e.message : "Ошибка изменения баланса"); }
  }

  if (loading && !data) return <p className="text-muted text-sm">Загрузка...</p>;
  if (error && !data) return <p className="text-red-400 text-sm">{error}</p>;
  if (!data) return null;

  return (
    <div>
      {toast && <div className="mb-3 rounded-xl bg-accent/15 px-4 py-2 text-sm text-accent">{toast}</div>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-xs">
          <thead>
            <tr className="border-b border-white/10 text-left text-muted">
              <th className="pb-2 pr-2">ID</th>
              <th className="pb-2 pr-2">TG ID</th>
              <th className="pb-2 pr-2">Username</th>
              <th className="pb-2 pr-2">Имя</th>
              <th className="pb-2 pr-2">Язык</th>
              <th className="pb-2 pr-2 text-right">Баланс</th>
              <th className="pb-2">Действия</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((u) => (
              <tr key={u.id} className="border-b border-white/5">
                <td className="py-2 pr-2">{u.id}</td>
                <td className="py-2 pr-2">{u.telegram_id}</td>
                <td className="py-2 pr-2">{u.username || "—"}</td>
                <td className="py-2 pr-2">{u.first_name || "—"}</td>
                <td className="py-2 pr-2">{u.language_code || "—"}</td>
                <td className="py-2 pr-2 text-right font-mono">{u.balance_credits} 🪙</td>
                <td className="py-2">
                  <div className="flex gap-1">
                    <button onClick={() => openUser(u)} className="rounded-lg bg-white/10 px-2 py-1 text-muted hover:text-white">Открыть</button>
                    <button onClick={() => setTopUpTarget(u)} className="rounded-lg bg-accent/20 px-2 py-1 text-accent hover:bg-accent/30">Пополнить</button>
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
      {topUpTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setTopUpTarget(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-card p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold">Пополнить баланс</h3>
            <p className="mt-1 text-sm text-muted">{topUpTarget.first_name || topUpTarget.username || `ID ${topUpTarget.telegram_id}`}</p>
            <input type="number" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} placeholder="Количество кредитов" className="mt-3 w-full rounded-xl border border-white/10 bg-app px-4 py-2 text-sm outline-none focus:border-accent" />
            <div className="mt-3 flex gap-2">
              <button onClick={() => setTopUpTarget(null)} className="flex-1 rounded-xl bg-white/5 py-2 text-sm">Отмена</button>
              <button onClick={doTopUp} disabled={topUpLoading || !topUpAmount} className="flex-1 rounded-xl bg-accent py-2 text-sm font-semibold text-black disabled:opacity-50">{topUpLoading ? "..." : "Пополнить"}</button>
            </div>
            {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
          </div>
        </div>
      )}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setDetail(null)}>
          <div className="w-full max-w-3xl max-h-[86vh] overflow-y-auto rounded-2xl bg-card p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-bold">Пользователь #{detail.user.id}</h3><p className="text-xs text-muted">TG {detail.user.telegram_id} · @{detail.user.username || "—"} · {detail.user.language_code || "—"}</p></div><button onClick={()=>setDetail(null)} className="rounded-lg bg-white/10 px-3 py-1 text-xs">Закрыть</button></div>
            <div className="mt-4 grid gap-3 md:grid-cols-3"><Card label="Баланс" value={`${detail.user.balance_credits} 🪙`} /><Card label="Создан" value={detail.user.created_at ? new Date(detail.user.created_at).toLocaleDateString("ru-RU") : "—"} /><Card label="Last active" value={detail.user.last_active_at || "—"} /></div>
            <div className="mt-4 rounded-2xl bg-app p-4"><h4 className="font-semibold">Начислить/списать токены</h4><div className="mt-2 grid gap-2 md:grid-cols-4"><input className="rounded-lg bg-card px-3 py-2 text-sm" placeholder="amount, можно -" value={adjustAmount} onChange={(e)=>setAdjustAmount(e.target.value)}/><input className="rounded-lg bg-card px-3 py-2 text-sm md:col-span-2" placeholder="reason" value={adjustReason} onChange={(e)=>setAdjustReason(e.target.value)}/><button onClick={doAdjust} className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-black">Сохранить</button></div></div>
            <div className="mt-4 grid gap-4 md:grid-cols-2"><div><h4 className="mb-2 font-semibold">Ledger</h4><div className="space-y-2 text-xs">{detail.ledger.map((x)=><div key={x.id} className="rounded-xl bg-app p-3"><div className="flex justify-between"><b>{x.operation_type}</b><span className={x.amount>=0?"text-accent":"text-red-300"}>{x.amount>0?"+":""}{x.amount}</span></div><div className="text-muted">{x.balance_before} → {x.balance_after}</div><div className="text-muted">{x.reason || "—"}</div></div>)}</div></div><div><h4 className="mb-2 font-semibold">Генерации</h4><div className="space-y-2 text-xs">{detail.tasks.map((x)=><div key={x.id} className="rounded-xl bg-app p-3"><div className="flex justify-between"><b>#{x.id} {x.model_code || x.task_type}</b><span>{x.status}</span></div><div className="text-muted">cost {x.cost_credits} · {x.created_at ? new Date(x.created_at).toLocaleString("ru-RU") : "—"}</div><div className="truncate text-muted">{x.prompt || x.error_message || "—"}</div></div>)}</div></div></div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-app p-3"><div className="text-xs text-muted">{label}</div><div className="mt-1 font-mono text-sm">{value}</div></div>; }
