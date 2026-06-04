import { Locale, t } from "@/lib/i18n";

export default function BalanceCard({ balance, locale = "ru" }: { balance: number; locale?: Locale }) {
  return <div className="relative overflow-hidden rounded-card border border-border-soft bg-white p-5 shadow-soft-sm">
    <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-brand-primary/10 blur-2xl" />
    <p className="text-sm font-semibold text-ink-secondary">{t(locale, "balance.current")}</p>
    <p className="mt-1 text-4xl font-black tracking-tight text-ink-primary">{balance} <span className="text-2xl">🪙</span></p>
    <p className="mt-2 text-xs text-ink-muted">{t(locale, "balance.onlyAfterStart")}</p>
  </div>;
}
