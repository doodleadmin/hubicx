export default function UploadBlock({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <label className="block">
    <span className="text-sm text-muted">URL входного файла</span>
    <input className="mt-2 w-full rounded-2xl border border-white/10 bg-card p-4 outline-none focus:border-accent" value={value} onChange={(event) => onChange(event.target.value)} placeholder="https://..." />
    <span className="mt-1 block text-xs text-muted">MVP использует URL-заглушку, storage-интерфейс готов к S3/R2.</span>
  </label>;
}
