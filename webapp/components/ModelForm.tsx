"use client";

import { useEffect, useState } from "react";
import BalanceCard from "./BalanceCard";
import GenerationStatus from "./GenerationStatus";
import PromptTextarea from "./PromptTextarea";
import UploadBlock from "./UploadBlock";
import { api } from "@/lib/api";
import { initTelegram } from "@/lib/telegram";
import { AIModel, Generation, User } from "@/lib/types";

export default function ModelForm({ modelCode }: { modelCode: string }) {
  const [model, setModel] = useState<AIModel>();
  const [user, setUser] = useState<User>();
  const [prompt, setPrompt] = useState("");
  const [inputFileUrl, setInputFileUrl] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [duration, setDuration] = useState("5s");
  const [quality, setQuality] = useState("standard");
  const [task, setTask] = useState<Generation>();
  const [error, setError] = useState("");

  useEffect(() => { initTelegram(); void Promise.all([api.model(modelCode), api.me()]).then(([m, u]) => { setModel(m as AIModel); setUser(u as User); }).catch((e) => setError(e.message)); }, [modelCode]);
  useEffect(() => {
    if (!task || !["queued", "processing", "created"].includes(task.status)) return;
    const timer = setInterval(() => api.task(task.id).then((next) => setTask(next as Generation)).catch(() => undefined), 2500);
    return () => clearInterval(timer);
  }, [task]);

  async function submit() {
    setError("");
    try {
      const queued = await api.createGeneration({ model_code: modelCode, prompt, input_file_url: inputFileUrl || null, params: { aspect_ratio: aspectRatio, duration, quality } }) as { task_id: number };
      setTask(await api.task(queued.task_id) as Generation);
      setUser(await api.me() as User);
    } catch (e) { setError(e instanceof Error ? e.message : "Ошибка"); }
  }

  if (error) return <div className="rounded-3xl bg-red-500/15 p-4 text-red-200">{error}</div>;
  if (!model || !user) return <p className="text-muted">Загрузка...</p>;
  const needsFile = model.input_type.includes("image") || model.input_type === "audio";
  return <div className="space-y-4">
    <BalanceCard balance={user.balance_credits} />
    <section className="rounded-3xl border border-white/10 bg-card p-4"><h1 className="text-2xl font-bold">{model.title}</h1><p className="mt-2 text-muted">{model.description}</p><p className="mt-3 font-semibold">Стоимость: {model.price_credits} 🪙</p></section>
    <PromptTextarea value={prompt} onChange={setPrompt} />
    {needsFile ? <UploadBlock value={inputFileUrl} onChange={setInputFileUrl} /> : null}
    <div className="grid grid-cols-2 gap-3">
      <select className="rounded-2xl bg-card p-3" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}><option>1:1</option><option>9:16</option><option>16:9</option><option>4:5</option></select>
      {model.task_type === "video" ? <select className="rounded-2xl bg-card p-3" value={duration} onChange={(e) => setDuration(e.target.value)}><option>5s</option><option>10s</option></select> : <select className="rounded-2xl bg-card p-3" value={quality} onChange={(e) => setQuality(e.target.value)}><option>fast</option><option>standard</option><option>premium</option></select>}
    </div>
    <button className="w-full rounded-3xl bg-accent py-4 font-bold text-black" onClick={submit}>Сгенерировать</button>
    <GenerationStatus task={task} />
  </div>;
}
