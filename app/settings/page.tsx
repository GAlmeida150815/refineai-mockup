// src/app/settings/page.tsx
import type { Metadata } from "next";
import { Settings } from "@/components/Settings";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsRoute({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  return <Settings tab={tab ?? "general"} />;
}
