import { PrototypeRoute } from "@/components/new-ui/PrototypeApp";

export default function TemplatePage({ searchParams }: { searchParams?: { code?: string } }) {
  return <PrototypeRoute route="template" code={searchParams?.code} />;
}
