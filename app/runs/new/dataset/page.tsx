// src/app/runs/new/dataset/page.tsx
import type { Metadata } from "next";
import { DatasetStep } from "@/components/runs/wizard/DatasetStep";

export const metadata: Metadata = { title: "New run · Dataset" };

export default function DatasetStepRoute() {
  return <DatasetStep />;
}
