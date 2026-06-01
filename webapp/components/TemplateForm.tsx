"use client";

import { useEffect, useState } from "react";
import BalanceCard from "./BalanceCard";
import GenerationStatus from "./GenerationStatus";
import PromptTextarea from "./PromptTextarea";
import UploadBlock from "./UploadBlock";
import { api } from "@/lib/api";
import { initTelegram } from "@/lib/telegram";
import { Generation, Template, User } from "@/lib/types";

export default function TemplateForm({ code }: { code: string }) {
  const [template, setTemplate] = useState<Template>();
  const [user, setUser] = useState<User>();
  const [prompt, setPrompt] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [task, setTask] = useState<Generation>();
  const [error, setError] = useState("");
  useEffect(() => { initTelegram(); void Promise.all([api.template(code), api.me()]).then(([t, u]) => { setTemplate(t as Template); setUser(u as User); }).catch((e) => setError(e.message)); }, [code]);
  useEffect(() => { if (!task || !["queued", "processing", "created"].includes(task.status)) return; const timer = setInterval(() => api.task(task.id).then((next) => setTask(next as Generation)), 2500); return () => clearInterval(timer); }, [task]);
  async function submit() { try { const queued = await api.createGeneration({ template_code: code, prompt, input_file_url: fileUrl || null, params: template?.default_params || {} }) as { task_id: number }; setTask(await api.task(queued.task_id) as Generation); setUser(await api.me() as User); } catch (e) { setError(e instanceof Error ? e.message : "Ошибка"); } }
  if (error) return <div className="rounded-3xl bg-red-500/15 p-4 text-red-200">{error}</div>;
  if (!template || !user) return <p className="text-muted">Загрузка...</p>;
  const fields = template.required_inputs.fields || [];
  return <div className="space-y-4"><BalanceCard balance={user.balance_credits} /><section className="rounded-3xl border border-white/10 bg-card p-4"><h1 className="text-2xl font-bold">{template.title}</h1><p className="mt-2 text-muted">{template.description}</p><p className="mt-3 font-semibold">Цена: {template.price_credits} 🪙</p></section>{fields.includes("prompt") ? <PromptTextarea value={prompt} onChange={setPrompt} /> : null}{fields.some((f) => ["image", "audio", "video"].includes(f)) ? <UploadBlock value={fileUrl} onChange={setFileUrl} /> : null}<button className="w-full rounded-3xl bg-accent py-4 font-bold text-black" onClick={submit}>Запустить шаблон</button><GenerationStatus task={task} /></div>;
}
