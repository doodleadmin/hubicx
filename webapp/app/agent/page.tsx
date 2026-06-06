import Link from "next/link";
import Layout from "@/components/Layout";
import { AGENTS, iconPath } from "@/lib/hubicxCatalog";

export default async function AgentPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const params = await searchParams;
  const agent = AGENTS.find((item) => item.code === params.code) || AGENTS[0];
  return <Layout><section className="hbx-card p-6 text-center"><img src={iconPath(agent.icon)} alt="" className="mx-auto h-16 w-16 rounded-[24px] bg-brand-soft p-3" /><h1 className="mt-4 text-3xl font-black text-ink-primary">{agent.title.ru}</h1><p className="mt-3 text-sm leading-6 text-ink-secondary">Агенты будут подключены как отдельные сценарии. Сейчас доступны основные генераторы и шаблоны.</p><Link href="/create" className="hubicx-primary-button mt-5 inline-block">Открыть генераторы</Link></section></Layout>;
}
