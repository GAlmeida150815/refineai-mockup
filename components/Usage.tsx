// src/components/Usage.tsx
"use client";

import { Activity } from "lucide-react";
import { useApp } from "@/components/shell/AppShell";

const bars = [34, 48, 42, 63, 56, 78, 68, 88, 72, 92, 84, 76];

export function Usage() {
  const { openModal } = useApp();

  return (
    <div className='main-scroll'>
      <div className='page-heading'>
        <div>
          <div className='eyebrow'>
            <span className='status-dot' /> BILLING & USAGE
          </div>
          <h1>Usage</h1>
          <p>
            Stay ahead of token consumption and understand the cost of every
            run.
          </p>
        </div>
        <button
          className='primary-button'
          onClick={() => openModal("Manage plan")}
        >
          Manage plan
        </button>
      </div>

      <section className='card'>
        <div className='card-header'>
          <div>
            <h2>Token usage</h2>
            <p>Daily usage across prompts, completions, and evaluations.</p>
          </div>
          <Activity />
        </div>
        <div className='usage-chart'>
          <div className='chart-bars'>
            {bars.map((height, i) => (
              <i style={{ height: `${height}%` }} key={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
