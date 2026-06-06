import GenerationForm from "@/components/new-ui/GenerationForm";

export default function GeneratePage({ searchParams }: { searchParams?: { model?: string } }) {
  return <GenerationForm modelCode={searchParams?.model || "nano_banana_2"} />;
}
