import { ReactNode } from "react";
import BottomNav from "./BottomNav";

export default function Layout({ children }: { children: ReactNode }) {
  return <main className="mx-auto min-h-screen max-w-md bg-app px-4 pb-24 pt-4 text-white">{children}<BottomNav /></main>;
}
