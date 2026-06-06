"use client";

import Link from "next/link";
import { CREATE_TASKS, iconPath, text } from "@/lib/hubicxCatalog";
import type { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
  category?: "image" | "video" | "text" | "prompts";
};

export default function CreateTaskGrid({ locale, category }: Props) {
  const tasks = category ? CREATE_TASKS.filter((task) => task.category === category) : CREATE_TASKS;
  return (
    <div className="grid grid-cols-1 gap-3">
      {tasks.map((task) => {
        const modelCode = task.modelCodes[0];
        return (
          <Link key={task.id} href={`/generate?model=${modelCode}`} className="hbx-task-card flex items-center gap-4">
            <span className="hbx-task-icon shrink-0"><img src={iconPath(task.icon)} alt="" className="h-full w-full object-contain" /></span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <b className="text-base text-ink-primary">{text(task.title, locale)}</b>
                {task.badge ? <span className="hubicx-badge">{task.badge}</span> : null}
              </span>
              <span className="mt-1 block text-sm leading-5 text-ink-secondary">{text(task.description, locale)}</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
