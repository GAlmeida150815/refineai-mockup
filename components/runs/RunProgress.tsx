"use client";

import { useState } from "react";
import Link from "next/link";
import type { Run } from "@/lib/mock-data";

export function RunProgress({
  run,
  fromWizard,
}: {
  run: Run;
  fromWizard: boolean;
}) {
  const [elapsed] = useState(() =>
    Math.max(0, Date.now() - run.phaseStartedAt),
  );
  const pass = run.decisions.length + 1;
  const passes = run.humanReview ? run.loops + 1 : 1;
  const pausesAfter = run.humanReview && run.decisions.length < run.loops;

  const timeline = Array.from({ length: passes }, (_, i) => {
    const items = [
      {
        label: `Pass ${i + 1}`,
        state: i < pass - 1 ? "done" : i === pass - 1 ? "current" : "",
      },
    ];
    if (run.humanReview && i < run.loops) {
      items.push({
        label: `Decision ${i + 1}`,
        state: i < run.decisions.length ? "done" : "",
      });
    }
    return items;
  }).flat();

  return (
    <div className='main-scroll results-page'>
      <div className='results-top'>
        <Link
          className='back-link'
          href={fromWizard ? "/runs/new/review" : "/runs"}
        >
          ← {fromWizard ? "Back to review" : "Back to Runs"}
        </Link>
        <span className='status-pill running'>Running</span>
      </div>

      <section className='card neural-card run-progress'>
        <div className='run-progress-head'>
          <span className='eyebrow'>
            PASS {pass} OF {passes}
          </span>
          <h2>{run.name}</h2>
          <p>
            {pausesAfter
              ? "When this pass finishes, the judge proposes prompt refinements and the run pauses in Runs until you choose one per model. You can leave this page."
              : "This is the final pass. Results open here automatically when it finishes."}
          </p>
        </div>

        <div className='run-progress-bar'>
          <i
            style={{
              animationDuration: `${run.phaseEndsAt - run.phaseStartedAt}ms`,
              animationDelay: `-${elapsed}ms`,
            }}
          />
        </div>

        <ol className='run-timeline'>
          {timeline.map((item) => (
            <li key={item.label} className={item.state}>
              {item.label}
            </li>
          ))}
        </ol>

        <div className='review-chips'>
          {run.models.map((model) => (
            <span key={model}>{model}</span>
          ))}
          <span>{run.dataset}</span>
          <span>
            {(run.examples * run.models.length).toLocaleString("en-US")}{" "}
            executions / pass
          </span>
          <span>Judged by {run.judges.join(" + ")}</span>
        </div>
      </section>
    </div>
  );
}
