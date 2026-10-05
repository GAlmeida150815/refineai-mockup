import type { Metadata } from "next";
import { RunView } from "@/components/runs/RunView";
import { initialRuns } from "@/lib/mock-data";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: initialRuns.find((r) => r.id === id)?.name ?? "Run" };
}

export default async function RunRoute({ params, searchParams }: Props) {
  const { id } = await params;
  const { from } = await searchParams;
  return <RunView runId={id} fromWizard={from === "wizard"} />;
}
