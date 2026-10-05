// src/components/Overview.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, Beaker } from "lucide-react";
import { useApp } from "@/components/shell/AppShell";

const scopes = {
  "Global usage": {
    metrics: [
      ["Runs this month", "48", "+12 vs. last month"],
      ["Best accuracy", "94.8%", "Support ticket triage"],
      ["Tokens used", "4.8M", "48% of plan"],
      ["Spend", "$612", "incl. 10% platform fee"],
    ],
    usageNote: "Daily tokens across every project in this workspace.",
    bars: [34, 48, 42, 63, 56, 78, 68, 88, 72, 92, 84, 76],
  },
  "Project view": {
    metrics: [
      ["Runs in project", "12", "+4 this week"],
      ["Avg. accuracy", "91.0%", "+3.1 pts"],
      ["Tokens used", "1.3M", "27% of workspace"],
      ["Spend", "$164", "incl. 10% platform fee"],
    ],
    usageNote: "Daily tokens for the Support automation project.",
    bars: [22, 30, 28, 41, 38, 52, 47, 60, 55, 66, 58, 62],
  },
};

type Scope = keyof typeof scopes;

export function Overview() {
  const { runs } = useApp();
  const [tab, setTab] = useState<Scope>("Global usage");
  const scope = scopes[tab];
  const recentRuns = [...runs].sort((a, b) => b.order - a.order).slice(0, 4);

  return (
    <div className='main-scroll'>
      <div className='scope-tabs'>
        {(Object.keys(scopes) as Scope[]).map((label) => (
          <button
            key={label}
            className={tab === label ? "active" : ""}
            onClick={() => setTab(label)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className='page-heading'>
        <div>
          <div className='eyebrow'>
            <span className='status-dot' /> WORKSPACE OVERVIEW
          </div>
          <h1>Good morning, Jordan</h1>
          <p>
            A clear view of your evaluation workspace and the experiments that
            matter.
          </p>
        </div>
        <Link className='primary-button' href='/runs/new/prompt'>
          New run
        </Link>
      </div>

      <div className='metrics-grid'>
        {scope.metrics.map(([label, value, change]) => (
          <div className='metric-card' key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small className='positive'>{change}</small>
          </div>
        ))}
      </div>

      <div className='overview-grid'>
        <section className='card table-card'>
          <div className='card-header'>
            <div>
              <h2>Recent runs</h2>
              <p>Latest experiments across this workspace.</p>
            </div>
            <Link className='secondary-button' href='/runs'>
              View all
            </Link>
          </div>
          {recentRuns.map((run) => (
            <Link className='list-row' key={run.id} href={`/runs/${run.id}`}>
              <span className='row-icon'>
                <Beaker />
              </span>
              <span>
                <strong>{run.name}</strong>
                <small>
                  {run.status === "complete"
                    ? run.completedLabel
                    : run.status === "review"
                      ? "Waiting for your decision"
                      : "Running now"}{" "}
                  · {run.models.length} models
                </small>
              </span>
              <span
                className={`status-pill ${run.status === "complete" ? "" : run.status}`}
              >
                {run.status === "complete"
                  ? run.accuracy
                  : run.status === "review"
                    ? "Needs review"
                    : "Running"}
              </span>
            </Link>
          ))}
        </section>

        <section className='card'>
          <div className='card-header'>
            <div>
              <h2>Token usage</h2>
              <p>{scope.usageNote}</p>
            </div>
            <Activity />
          </div>
          <div className='usage-chart'>
            <div className='chart-bars'>
              {scope.bars.map((height, i) => (
                <i style={{ height: `${height}%` }} key={i} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
