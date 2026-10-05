// src/app/runs/new/models/page.tsx
import type { Metadata } from "next";
import { ModelsStep } from "@/components/runs/wizard/ModelsStep";

export const metadata: Metadata = { title: "New run · Models" };

export default function ModelsStepRoute() {
  return <ModelsStep />;
}
