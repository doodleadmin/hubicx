import Link from "next/link";
import Layout from "@/components/Layout";

const cards = [
  ["📷 Фото", "/generate?model=nano_banana"],
  ["🎥 Видео", "/generate?model=seedance"],
  ["🧩 Шаблоны", "/template?code=enhance_4k"],
  ["📄 Текст", "/generate?model=ai_chat"]
];

export default function Home() {
  return <Layout><section className="rounded-[2rem] bg-gradient-to-br from-card to-[#10294a] p-5"><p className="text-sm text-accent">Telegram Mini App</p><h1 className="mt-2 text-3xl font-black">AI Aggregator</h1><p className="mt-2 text-muted">Генерация текста, изображений, видео и шаблонов внутри WebApp.</p></section><div className="mt-5 grid grid-cols-2 gap-3">{cards.map(([title, href]) => <Link key={href} href={href} className="rounded-3xl border border-white/10 bg-card p-5 text-lg font-semibold">{title}</Link>)}</div></Layout>;
}
