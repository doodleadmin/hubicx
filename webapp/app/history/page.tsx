"use client";

import { useEffect, useState } from "react";
import HistoryList from "@/components/HistoryList";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { initTelegram } from "@/lib/telegram";
import { Generation } from "@/lib/types";

export default function HistoryPage() {
  const [items, setItems] = useState<Generation[]>([]);
  const [filter, setFilter] = useState("all");
  useEffect(() => { initTelegram(); void api.history().then((data) => setItems(data as Generation[])); }, []);
  const filtered = filter === "all" ? items : items.filter((item) => item.task_type === filter);
  return <Layout><h1 className="mb-4 text-2xl font-bold">История</h1><div className="mb-4 flex gap-2 overflow-x-auto">{["all", "image", "video", "text", "template"].map((value) => <button key={value} onClick={() => setFilter(value)} className={`rounded-full px-4 py-2 text-sm ${filter === value ? "bg-accent text-black" : "bg-card"}`}>{value}</button>)}</div><HistoryList items={filtered} /></Layout>;
}
