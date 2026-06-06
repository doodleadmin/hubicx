import { PrototypeRoute } from "@/components/new-ui/PrototypeApp";

export default function AgentPage({ searchParams }: { searchParams?: { code?: string } }) {
  return <PrototypeRoute route="agent" code={searchParams?.code} />;
}
