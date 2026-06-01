import Link from "next/link";

export default function BottomNav() {
  return <nav className="fixed bottom-0 left-1/2 grid w-full max-w-md -translate-x-1/2 grid-cols-3 gap-2 border-t border-white/10 bg-card/95 p-3 backdrop-blur">
    <Link className="rounded-2xl bg-white/5 py-3 text-center text-sm" href="/">Главная</Link>
    <Link className="rounded-2xl bg-white/5 py-3 text-center text-sm" href="/balance">Баланс</Link>
    <Link className="rounded-2xl bg-white/5 py-3 text-center text-sm" href="/history">История</Link>
  </nav>;
}
