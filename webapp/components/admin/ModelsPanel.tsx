"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AdminModelItem } from "@/lib/types";

export default function ModelsPanel() {
  const [models, setModels] = useState<AdminModelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingPrice, setEditingPrice] = useState<{ code: string; value: string } | null>(null);
  const [schemaModel, setSchemaModel] = useState<{ code: string; title: string; form_schema: unknown } | null>(null);
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.adminModels() as AdminModelItem[];
      setModels(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function toggleModel(code: string, current: boolean) {
    try {
      await api.adminToggleModel(code, !current);
      setToast(`Модель ${code}: ${!current ? "включена" : "выключена"}`);
      setTimeout(() => setToast(""), 3000);
      void load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  }

  async function savePrice() {
    if (!editingPrice) return;
    const price = Number(editingPrice.value);
    if (isNaN(price) || price < 0) return;
    try {
      await api.adminUpdatePrice(editingPrice.code, price);
      setEditingPrice(null);
      setToast("Цена обновлена");
      setTimeout(() => setToast(""), 3000);
      void load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  }

  async function viewSchema(code: string) {
    try {
      const res = await api.adminModelSchema(code) as { code: string; title: string; form_schema: unknown };
      setSchemaModel(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  }

  if (loading) return <p className="text-muted text-sm">Загрузка...</p>;
  if (error && models.length === 0) return <p className="text-red-400 text-sm">{error}</p>;

  return (
    <div>
      {toast && <div className="mb-3 rounded-xl bg-accent/15 px-4 py-2 text-sm text-accent">{toast}</div>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-xs">
          <thead>
            <tr className="border-b border-white/10 text-left text-muted">
              <th className="pb-2 pr-2">Code</th>
              <th className="pb-2 pr-2">Title</th>
              <th className="pb-2 pr-2">Cat</th>
              <th className="pb-2 pr-2">Type</th>
              <th className="pb-2 pr-2 text-right">Price</th>
              <th className="pb-2 pr-2">Active</th>
              <th className="pb-2">Действия</th>
            </tr>
          </thead>
          <tbody>
            {models.map((m) => (
              <tr key={m.id} className="border-b border-white/5">
                <td className="py-2 pr-2 font-mono">{m.code}</td>
                <td className="py-2 pr-2">{m.title}</td>
                <td className="py-2 pr-2">{m.category}</td>
                <td className="py-2 pr-2">{m.task_type}</td>
                <td className="py-2 pr-2 text-right font-mono">
                  {editingPrice?.code === m.code ? (
                    <div className="flex items-center justify-end gap-1">
                      <input type="number" value={editingPrice.value} onChange={(e) => setEditingPrice({ ...editingPrice, value: e.target.value })} className="w-16 rounded border border-white/20 bg-app px-1 py-0.5 text-right text-xs outline-none" autoFocus />
                      <button onClick={savePrice} className="rounded bg-accent/20 px-1 py-0.5 text-accent">OK</button>
                      <button onClick={() => setEditingPrice(null)} className="rounded bg-white/10 px-1 py-0.5 text-muted">✕</button>
                    </div>
                  ) : (
                    <span>{m.price_credits} 🪙</span>
                  )}
                </td>
                <td className="py-2 pr-2">
                  <button onClick={() => toggleModel(m.code, m.is_active)} className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${m.is_active ? "bg-accent/20 text-accent" : "bg-red-500/20 text-red-400"}`}>
                    {m.is_active ? "ON" : "OFF"}
                  </button>
                </td>
                <td className="py-2">
                  <div className="flex gap-1">
                    <button onClick={() => setEditingPrice({ code: m.code, value: String(m.price_credits) })} className="rounded-lg bg-white/10 px-2 py-0.5 text-muted hover:text-white">Цена</button>
                    <button onClick={() => viewSchema(m.code)} className="rounded-lg bg-white/10 px-2 py-0.5 text-muted hover:text-white">Schema</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {schemaModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSchemaModel(null)}>
          <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl bg-card p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold">Schema: {schemaModel.title}</h3>
            <p className="text-xs text-muted font-mono">{schemaModel.code}</p>
            <pre className="mt-3 overflow-x-auto rounded-xl bg-app p-3 text-xs text-white/80">{JSON.stringify(schemaModel.form_schema, null, 2)}</pre>
            <button onClick={() => setSchemaModel(null)} className="mt-4 w-full rounded-xl bg-white/5 py-2 text-sm">Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
}
