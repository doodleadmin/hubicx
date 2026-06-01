import Layout from "@/components/Layout";
import TemplateForm from "@/components/TemplateForm";

export default async function TemplatePage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const params = await searchParams;
  return <Layout>{params.code ? <TemplateForm code={params.code} /> : <p>Шаблон не выбран</p>}</Layout>;
}
