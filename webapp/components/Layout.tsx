import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return <main className="mx-auto min-h-screen max-w-md bg-app px-4 py-4 text-white">{children}</main>;
}
