// src/app/team/page.tsx
import type { Metadata } from "next";
import { Team } from "@/components/Team";

export const metadata: Metadata = { title: "Team" };

export default function TeamRoute() {
  return <Team />;
}
