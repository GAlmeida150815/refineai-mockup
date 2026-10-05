// src/app/runs/new/configuration/page.tsx
import type { Metadata } from "next";
import { ConfigurationStep } from "@/components/runs/wizard/ConfigurationStep";

export const metadata: Metadata = { title: "New run · Configuration" };

export default function ConfigurationStepRoute() {
  return <ConfigurationStep />;
}
