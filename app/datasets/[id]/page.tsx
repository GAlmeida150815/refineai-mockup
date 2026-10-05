// src/app/datasets/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DatasetDetail } from "@/components/DatasetDetail";
import { datasets } from "@/lib/mock-data";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return datasets.map((d) => ({ id: d.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: datasets.find((d) => d.id === id)?.name ?? "Dataset" };
}

export default async function DatasetRoute({ params }: Props) {
  const { id } = await params;
  const dataset = datasets.find((d) => d.id === id);
  if (!dataset) notFound();
  return <DatasetDetail dataset={dataset} />;
}
