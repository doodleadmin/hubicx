import Layout from "@/components/Layout";
import ModelForm from "@/components/ModelForm";

export default async function GeneratePage({ searchParams }: { searchParams: Promise<{ model?: string }> }) {
  const params = await searchParams;
  return <Layout>{params.model ? <ModelForm modelCode={params.model} /> : <p>Модель не выбрана</p>}</Layout>;
}
