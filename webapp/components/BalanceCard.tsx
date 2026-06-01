export default function BalanceCard({ balance }: { balance: number }) {
  return <div className="rounded-3xl border border-white/10 bg-card p-4 shadow-lg">
    <p className="text-sm text-muted">Текущий баланс</p>
    <p className="mt-1 text-3xl font-bold">{balance} 🪙</p>
  </div>;
}
