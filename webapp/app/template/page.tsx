import TemplatesSoon from "@/components/new-ui/TemplatesSoon";

export default function TemplatePage({ searchParams }: { searchParams?: { code?: string } }) {
  return <TemplatesSoon code={searchParams?.code} />;
}
