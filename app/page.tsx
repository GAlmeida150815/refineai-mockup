// src/app/page.tsx
import type { Metadata } from "next";
import { Overview } from "@/components/Overview";

export const metadata: Metadata = { title: "Overview" };

export default function OverviewRoute() {
  return <Overview />;
}
