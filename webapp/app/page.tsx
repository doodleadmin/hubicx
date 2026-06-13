import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const h = await headers();
  const ua = h.get("user-agent") ?? "";
  const isMobile = /iPhone|iPad|Android|Mobile/i.test(ua);
  redirect(isMobile ? "/app/index.html" : "/app/desktop.html");
}
