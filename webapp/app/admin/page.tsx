"use client";

import { useCallback, useEffect, useState } from "react";
import Layout from "@/components/Layout";
import AdminTabs, { type TabKey } from "@/components/admin/AdminTabs";
import UsersPanel from "@/components/admin/UsersPanel";
import GenerationsPanel from "@/components/admin/GenerationsPanel";
import ModelsPanel from "@/components/admin/ModelsPanel";
import PricingPanel from "@/components/admin/PricingPanel";
import TransactionsPanel from "@/components/admin/TransactionsPanel";
import FilesPanel from "@/components/admin/FilesPanel";
import { api } from "@/lib/api";
import { initTelegram } from "@/lib/telegram";
import type { User } from "@/lib/types";

export default function AdminPage() {
  const [tab, setTab] = useState<TabKey>("dashboard");
  const [user, setUser] = useState<User | null>(null);
  const [authState, setAuthState] = useState<"loading" | "ok" | "forbidden" | "no_telegram">("loading");

  const checkAuth = useCallback(async () => {
    setAuthState("loading");
    try {
      const auth = await initTelegram();
      if (!auth.hasTelegramWebApp || !auth.initData) {
        setAuthState("no_telegram");
        return;
      }
      const me = await api.me() as User;
      setUser(me);
      if (!me.is_admin) {
        setAuthState("forbidden");
        return;
      }
      setAuthState("ok");
    } catch {
      setAuthState("forbidden");
    }
  }, []);

  useEffect(() => { void checkAuth(); }, [checkAuth]);

  if (authState === "loading") {
    return <Layout><p className="text-center text-muted">Проверка доступа...</p></Layout>;
  }
  if (authState === "no_telegram") {
    return <Layout><p className="text-center text-muted">Откройте админку через Telegram-бота</p></Layout>;
  }
  if (authState === "forbidden") {
    return <Layout><p className="text-center text-lg text-red-400">Доступ запрещён</p></Layout>;
  }

  return (
    <Layout>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-black">Админка</h1>
        <a href="/" className="rounded-xl bg-card px-3 py-1.5 text-xs text-muted hover:text-white">← Назад</a>
      </div>
      <AdminTabs active={tab} onChange={setTab} />
      <div className="mt-4">
        {tab === "dashboard" && <DashboardPanel />}
        {tab === "users" && <UsersPanel />}
        {tab === "generations" && <GenerationsPanel />}
        {tab === "models" && <ModelsPanel />}
        {tab === "pricing" && <PricingPanel />}
        {tab === "transactions" && <TransactionsPanel />}
        {tab === "files" && <FilesPanel />}
      </div>
    </Layout>
  );
}

function DashboardPanel() {
  const [stats, setStats] = useState<{ users: number; tasks: number; errors: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [users, tasks, errors] = await Promise.all([
          api.adminUsers(1, 1) as Promise<{ total: number }>,
          api.adminTasks(1, 1) as Promise<{ total: number }>,
          api.adminErrors(1, 1) as Promise<{ total: number }>,
        ]);
        if (!cancelled) setStats({ users: users.total, tasks: tasks.total, errors: errors.total });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Ошибка");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <p className="text-muted text-sm">Загрузка...</p>;
  if (error) return <p className="text-red-400 text-sm">{error}</p>;
  if (!stats) return null;

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card label="Пользователи" value={stats.users} />
      <Card label="Генерации" value={stats.tasks} />
      <Card label="Ошибки" value={stats.errors} accent />
    </div>
  );
}

function Card({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-2xl bg-card p-4 text-center">
      <p className={`text-2xl font-black ${accent ? "text-red-400" : "text-accent"}`}>{value}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}
