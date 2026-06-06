"use client";

import { useEffect } from "react";
import { applyHubicxTheme, getStoredHubicxTheme } from "@/lib/hubicxTheme";
import { initTelegramWebApp } from "@/lib/telegram";

export default function ShellBehavior() {
  useEffect(() => {
    applyHubicxTheme(getStoredHubicxTheme());
    void initTelegramWebApp();
  }, []);

  return null;
}
