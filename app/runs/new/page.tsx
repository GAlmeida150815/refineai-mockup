// src/app/runs/new/page.tsx
import { redirect } from "next/navigation";

export default function NewRunRoute() {
  redirect("/runs/new/prompt");
}
