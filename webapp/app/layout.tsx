import "./globals.css";
import "./hubicx-prototype.css";
import ShellBehavior from "@/components/new-ui/ShellBehavior";
import type { Metadata, Viewport } from "next";
import Script from "next/script";

export const metadata: Metadata = { title: "Hubicx", description: "AI-платформа для фото, видео и текста" };

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ru" data-theme="signal"><body><Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" /><ShellBehavior />{children}</body></html>;
}
