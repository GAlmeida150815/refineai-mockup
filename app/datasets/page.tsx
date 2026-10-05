// src/app/datasets/page.tsx
import type { Metadata } from "next";
import { Datasets } from "@/components/Datasets";

export const metadata: Metadata = { title: "Datasets" };

export default function DatasetsRoute() {
  return <Datasets />;
}
