import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = { title: "Hubicx", description: "AI-платформа для фото, видео и текста" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ru"><body><Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />{children}</body></html>;
}
