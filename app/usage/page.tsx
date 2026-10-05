// src/app/usage/page.tsx
import type { Metadata } from "next";
import { Usage } from "@/components/Usage";

export const metadata: Metadata = { title: "Usage" };

export default function UsageRoute() {
  return <Usage />;
}
