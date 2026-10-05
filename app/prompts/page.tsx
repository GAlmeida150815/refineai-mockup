// src/app/prompts/page.tsx
import type { Metadata } from "next";
import { Prompts } from "@/components/Prompts";

export const metadata: Metadata = { title: "Prompts" };

export default function PromptsRoute() {
  return <Prompts />;
}
