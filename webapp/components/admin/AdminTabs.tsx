"use client";

const TABS = [
  { key: "dashboard", label: "Дашборд" },
  { key: "users", label: "Юзеры" },
  { key: "generations", label: "Генерации" },
  { key: "models", label: "Модели" },
  { key: "pricing", label: "Цены и пакеты" },
  { key: "transactions", label: "Транзакции" },
  { key: "files", label: "Файлы" },
] as const;

export type TabKey = (typeof TABS)[number]["key"];

export default function AdminTabs({ active, onChange }: { active: TabKey; onChange: (t: TabKey) => void }) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
      {TABS.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition ${
            active === t.key ? "bg-accent text-black" : "bg-card text-muted hover:text-white"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
