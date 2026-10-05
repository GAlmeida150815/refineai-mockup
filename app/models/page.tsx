// src/app/models/page.tsx
import type { Metadata } from "next";
import { Models } from "@/components/Models";

export const metadata: Metadata = { title: "Models" };

export default function ModelsRoute() {
  return <Models />;
}
