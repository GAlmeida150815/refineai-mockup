// src/app/runs/new/layout.tsx
import type { ReactNode } from "react";
import { WizardFrame } from "@/components/runs/wizard/WizardFrame";

export default function NewRunLayout({ children }: { children: ReactNode }) {
  return <WizardFrame>{children}</WizardFrame>;
}
