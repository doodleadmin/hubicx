export default function PromptTextarea({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <label className="block">
    <span className="text-sm text-muted">Промпт</span>
    <textarea className="mt-2 min-h-32 w-full rounded-3xl border border-white/10 bg-card p-4 outline-none focus:border-accent" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Опишите, что нужно сгенерировать" />
  </label>;
}
