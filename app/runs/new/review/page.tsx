// src/app/runs/new/review/page.tsx
import type { Metadata } from "next";
import { ReviewStep } from "@/components/runs/wizard/ReviewStep";

export const metadata: Metadata = { title: "New run · Review" };

export default function ReviewStepRoute() {
  return <ReviewStep />;
}
