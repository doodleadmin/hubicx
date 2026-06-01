import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "AI Aggregator", description: "Telegram AI Aggregator WebApp" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ru"><body>{children}</body></html>;
}
