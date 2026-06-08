"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AdminModelPricing, TokenPackage } from "@/lib/types";

export default function PricingPanel() {
  const [models, setModels] = useState<AdminModelPricing[]>([]);
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [newPkg, setNewPkg] = useState({ code: "", title: "", tokens: "", price_rub: "", bonus_tokens: "0", sort_order: "50" });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [mp, pk] = await Promise.all([api.adminModelPricing(), api.adminTokenPackages()]);
      setModels(mp as AdminModelPricing[]);
      setPackages(pk as TokenPackage[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function saveModel(m: AdminModelPricing, patch: Partial<AdminModelPricing>) {
    try {
      await api.adminUpdateModelPricing(m.model_code, patch);
      setToast(`Цена ${m.model_code} сохранена`);
      setTimeout(() => setToast(""), 2500);
      void load();
    } catch (e) { setError(e instanceof Error ? e.message : "Ошибка сохранения"); }
  }

  async function savePackage(p: TokenPackage, patch: Partial<TokenPackage>) {
    try {
      await api.adminUpdateTokenPackage(p.id, patch);
      setToast(`Пакет ${p.code} сохранён`);
      setTimeout(() => setToast(""), 2500);
      void load();
    } catch (e) { setError(e instanceof Error ? e.message : "Ошибка сохранения"); }
  }

  async function addPackage() {
    try {
      await api.adminCreateTokenPackage({
        code: newPkg.code,
        title: newPkg.title,
        tokens: Number(newPkg.tokens),
        price_rub: Number(newPkg.price_rub),
        bonus_tokens: Number(newPkg.bonus_tokens || 0),
        sort_order: Number(newPkg.sort_order || 0),
        is_active: true,
      });
      setNewPkg({ code: "", title: "", tokens: "", price_rub: "", bonus_tokens: "0", sort_order: "50" });
      setToast("Пакет добавлен");
      setTimeout(() => setToast(""), 2500);
      void load();
    } catch (e) { setError(e instanceof Error ? e.message : "Ошибка добавления"); }
  }

  if (loading) return <p className="text-muted text-sm">Загрузка...</p>;
  if (error && !models.length && !packages.length) return <p className="text-red-400 text-sm">{error}</p>;

  return <div className="space-y-6">
    {toast && <div className="rounded-xl bg-accent/15 px-4 py-2 text-sm text-accent">{toast}</div>}
    {error && <div className="rounded-xl bg-red-500/15 px-4 py-2 text-sm text-red-300">{error}</div>}

    <section>
      <h2 className="mb-3 text-lg font-bold">Цены моделей</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-xs">
          <thead><tr className="border-b border-white/10 text-left text-muted"><th className="pb-2">Model</th><th className="pb-2">Category</th><th className="pb-2 text-right">Price</th><th className="pb-2">Enabled</th><th className="pb-2">Featured</th><th className="pb-2">Note</th></tr></thead>
          <tbody>{models.map((m) => <ModelRow key={m.model_code} model={m} onSave={saveModel} />)}</tbody>
        </table>
      </div>
    </section>

    <section>
      <h2 className="mb-3 text-lg font-bold">Пакеты токенов</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-xs">
          <thead><tr className="border-b border-white/10 text-left text-muted"><th className="pb-2">Code</th><th className="pb-2">Title</th><th className="pb-2 text-right">Tokens</th><th className="pb-2 text-right">₽</th><th className="pb-2 text-right">Bonus</th><th className="pb-2">Active</th><th className="pb-2">Sort</th></tr></thead>
          <tbody>{packages.map((p) => <PackageRow key={p.id} pkg={p} onSave={savePackage} />)}</tbody>
        </table>
      </div>
      <div className="mt-4 grid gap-2 rounded-2xl bg-card p-4 text-xs md:grid-cols-6">
        <input className="rounded-lg bg-app px-2 py-2" placeholder="code" value={newPkg.code} onChange={(e)=>setNewPkg({...newPkg, code:e.target.value})}/>
        <input className="rounded-lg bg-app px-2 py-2 md:col-span-2" placeholder="title" value={newPkg.title} onChange={(e)=>setNewPkg({...newPkg, title:e.target.value})}/>
        <input className="rounded-lg bg-app px-2 py-2" placeholder="tokens" value={newPkg.tokens} onChange={(e)=>setNewPkg({...newPkg, tokens:e.target.value})}/>
        <input className="rounded-lg bg-app px-2 py-2" placeholder="price_rub" value={newPkg.price_rub} onChange={(e)=>setNewPkg({...newPkg, price_rub:e.target.value})}/>
        <button onClick={addPackage} className="rounded-lg bg-accent px-3 py-2 font-semibold text-black">Добавить пакет</button>
      </div>
    </section>
  </div>;
}

function ModelRow({ model, onSave }: { model: AdminModelPricing; onSave: (m: AdminModelPricing, patch: Partial<AdminModelPricing>) => void }) {
  const [price, setPrice] = useState(String(model.price_tokens));
  const [note, setNote] = useState(model.admin_note || "");
  return <tr className="border-b border-white/5"><td className="py-2 pr-2"><div className="font-mono">{model.model_code}</div><div className="text-muted">{model.display_name}</div></td><td>{model.category}</td><td className="text-right"><input className="w-20 rounded bg-app px-2 py-1 text-right" value={price} onChange={(e)=>setPrice(e.target.value)} onBlur={()=>Number(price)!==model.price_tokens && onSave(model,{price_tokens:Number(price)})}/></td><td><button className={`rounded px-2 py-1 ${model.is_enabled?'bg-accent/20 text-accent':'bg-red-500/20 text-red-300'}`} onClick={()=>onSave(model,{is_enabled:!model.is_enabled})}>{model.is_enabled?'ON':'OFF'}</button></td><td><button className={`rounded px-2 py-1 ${model.is_featured?'bg-blue-500/20 text-blue-300':'bg-white/10 text-muted'}`} onClick={()=>onSave(model,{is_featured:!model.is_featured})}>{model.is_featured?'YES':'NO'}</button></td><td><input className="w-full rounded bg-app px-2 py-1" value={note} onChange={(e)=>setNote(e.target.value)} onBlur={()=>note!==model.admin_note && onSave(model,{admin_note:note})}/></td></tr>;
}

function PackageRow({ pkg, onSave }: { pkg: TokenPackage; onSave: (p: TokenPackage, patch: Partial<TokenPackage>) => void }) {
  const [tokens, setTokens] = useState(String(pkg.tokens));
  const [price, setPrice] = useState(String(pkg.price_rub));
  const [sort, setSort] = useState(String(pkg.sort_order));
  return <tr className="border-b border-white/5"><td className="py-2 pr-2 font-mono">{pkg.code}</td><td>{pkg.title}</td><td className="text-right"><input className="w-20 rounded bg-app px-2 py-1 text-right" value={tokens} onChange={(e)=>setTokens(e.target.value)} onBlur={()=>Number(tokens)!==pkg.tokens && onSave(pkg,{tokens:Number(tokens)})}/></td><td className="text-right"><input className="w-20 rounded bg-app px-2 py-1 text-right" value={price} onChange={(e)=>setPrice(e.target.value)} onBlur={()=>Number(price)!==pkg.price_rub && onSave(pkg,{price_rub:Number(price)})}/></td><td className="text-right">{pkg.bonus_tokens}</td><td><button className={`rounded px-2 py-1 ${pkg.is_active?'bg-accent/20 text-accent':'bg-red-500/20 text-red-300'}`} onClick={()=>onSave(pkg,{is_active:!pkg.is_active})}>{pkg.is_active?'ON':'OFF'}</button></td><td><input className="w-16 rounded bg-app px-2 py-1" value={sort} onChange={(e)=>setSort(e.target.value)} onBlur={()=>Number(sort)!==pkg.sort_order && onSave(pkg,{sort_order:Number(sort)})}/></td></tr>;
}
