import type { Metadata } from "next";
import { PromptDetail } from "@/components/PromptDetail";
import { initialPrompts } from "@/lib/mock-data";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: initialPrompts.find((p) => p.id === id)?.name ?? "Prompt" };
}

export default async function PromptRoute({ params }: Props) {
  const { id } = await params;
  return <PromptDetail promptId={id} />;
}
