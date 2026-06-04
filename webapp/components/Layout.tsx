import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return <main className="page-shell mx-auto min-h-screen w-full max-w-md px-4 text-ink-primary">{children}</main>;
}
