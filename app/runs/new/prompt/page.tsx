// src/app/runs/new/prompt/page.tsx
import type { Metadata } from "next";
import { PromptStep } from "@/components/runs/wizard/PromptStep";

export const metadata: Metadata = { title: "New run · Prompt" };

export default function PromptStepRoute() {
  return <PromptStep />;
}
