"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, Check, Play, Sparkles, X, Zap } from "lucide-react";
import { useApp } from "@/components/shell/AppShell";
import { MOCK_PASS_MS } from "@/lib/mock-data";

const steps = [
  { slug: "prompt", label: "Prompt" },
  { slug: "models", label: "Models" },
  { slug: "dataset", label: "Datasets" },
  { slug: "configuration", label: "Configuration" },
  { slug: "review", label: "Review" },
];

export function WizardFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { draft, notify, runs, addRun, prompts, upsertPrompt } = useApp();

  const index = Math.max(
    0,
    steps.findIndex((s) => pathname.endsWith(`/${s.slug}`)),
  );
  const isLast = index === steps.length - 1;
  const modelCount = draft.selectedModels.length;
  const goTo = (i: number) => router.push(`/runs/new/${steps[i].slug}`);

  const startRun = () => {
    const name = draft.name.trim() || "Untitled run";
    const base =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "run";
    let id = base;
    for (let n = 2; runs.some((r) => r.id === id); n++) id = `${base}-${n}`;

    const now = Date.now();
    addRun({
      id,
      name,
      status: "running",
      accuracy: "—",
      cost: "—",
      latency: "—",
      completedLabel: "",
      order: Math.max(0, ...runs.map((r) => r.order)) + 1,
      dataset: draft.dataset,
      promptVersion: "Prompt v1",
      judges: draft.judges,
      models: draft.selectedModels,
      examples: draft.sourceExamples,
      humanReview: draft.humanReview,
      loops: draft.reviewLoops,
      basePrompt: draft.prompt,
      modelPrompts: Object.fromEntries(
        draft.selectedModels.map((m) => [m, draft.prompt]),
      ),
      decisions: [],
      phaseStartedAt: now,
      phaseEndsAt: now + MOCK_PASS_MS,
    });
    const sourcePrompt = prompts.find((p) => p.id === draft.promptId);
    if (sourcePrompt) {
      upsertPrompt({ ...sourcePrompt, runIds: [...sourcePrompt.runIds, id] });
    }
    notify(
      draft.humanReview
        ? "Run started. It will pause in Runs when the judge needs you."
        : "Run started",
    );
    router.push(`/runs/${id}?from=wizard`);
  };

  const next = () => {
    if (index === 1 && modelCount < 2) {
      notify("Select at least two models to compare", "error");
      return;
    }
    if (index === 1 && draft.judges.length === 0) {
      notify("Choose at least one judge model", "error");
      return;
    }
    if (isLast) startRun();
    else goTo(index + 1);
  };

  return (
    <div className='main-scroll wizard-page'>
      <div className='wizard-top'>
        <Link className='back-link' href='/runs'>
          <X /> Exit run
        </Link>
        <span className='token-pill'>
          <Zap /> Est.{" "}
          {((modelCount * draft.executionsPerModel * 2.55) / 1000).toFixed(1)}k
          tokens · ${(modelCount * draft.sourceExamples * 0.0001).toFixed(2)}
        </span>
      </div>

      <div className='wizard-breadcrumbs'>
        {[...steps.map((s) => s.label), "Results"].map((label, i) => (
          <button
            key={label}
            className={i === index ? "current" : i < index ? "done" : ""}
            disabled={i === steps.length}
            title={
              i === steps.length ? "Start the run to see results" : undefined
            }
            onClick={() => i < steps.length && goTo(i)}
          >
            <span>{i < index ? <Check /> : i + 1}</span>
            {label}
          </button>
        ))}
      </div>

      <div className='wizard-layout'>
        <section className='wizard-content'>
          <div className='eyebrow'>
            <span className='status-dot' /> STEP {index + 1} OF 6
          </div>
          {children}
        </section>

        <aside className='wizard-summary card neural-card'>
          <div className='eyebrow'>
            <span className='status-dot' /> RUN ESTIMATE
          </div>
          <h2>Before you run</h2>
          <div className='estimate-row'>
            <span>Model executions</span>
            <strong>{modelCount * draft.sourceExamples}</strong>
          </div>
          <div className='estimate-row'>
            <span>Input tokens</span>
            <strong>
              {((modelCount * draft.sourceExamples * 1.8) / 1000).toFixed(1)}k
            </strong>
          </div>
          <div className='estimate-row'>
            <span>Output allowance</span>
            <strong>
              {((modelCount * draft.sourceExamples * 0.75) / 1000).toFixed(1)}k
            </strong>
          </div>
          <div className='estimate-total'>
            <span>Estimated total</span>
            <strong>
              {((modelCount * draft.executionsPerModel * 2.55) / 1000).toFixed(
                1,
              )}
              k tokens
            </strong>
            <small>≈ $0.65 model cost + 10% platform fee</small>
          </div>
          <p className='summary-note'>
            <Sparkles /> You will be charged only for completed executions.
          </p>
        </aside>
      </div>

      <div className='wizard-footer'>
        <button
          className='secondary-button'
          onClick={() => (index === 0 ? router.push("/runs") : goTo(index - 1))}
        >
          {index === 0 ? "Cancel" : "Back"}
        </button>
        <button className='primary-button' onClick={next}>
          {isLast ? (
            <>
              <Play /> Start experiment
            </>
          ) : (
            <>
              Continue <ArrowUpRight />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
