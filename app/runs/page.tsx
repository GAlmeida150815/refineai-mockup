// src/app/runs/page.tsx
import type { Metadata } from "next";
import { RunsTable } from "@/components/runs/RunsTable";

export const metadata: Metadata = { title: "Runs" };

export default function RunsRoute() {
  return <RunsTable />;
}
