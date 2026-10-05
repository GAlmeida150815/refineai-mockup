"use client";

import { useState } from "react";
import Link from "next/link";
import { Beaker, Search, ChevronDown, Sparkles } from "lucide-react";
import { useApp } from "@/components/shell/AppShell";

const statusLabels = {
  running: "Running",
  review: "Needs review",
  complete: "Complete",
};

export function RunsTable() {
  const { runs } = useApp();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sortNewest, setSortNewest] = useState(true);

  const waiting = runs.filter((run) => run.status === "review");

  const visibleRows = runs
    .filter(
      (run) =>
        (status === "all" || run.status === status) &&
        `${run.name} ${run.dataset}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) => {
      if ((a.status === "review") !== (b.status === "review")) {
        return a.status === "review" ? -1 : 1;
      }
      return sortNewest ? b.order - a.order : a.order - b.order;
    });

  return (
    <div className='main-scroll'>
      <div className='page-heading'>
        <div>
          <div className='eyebrow'>
            <span className='status-dot' /> EXPERIMENTS
          </div>
          <h1>Runs</h1>
          <p>
            Run controlled comparisons and find the best model for every task.
          </p>
        </div>
        <Link className='primary-button' href='/runs/new/prompt'>
          New run
        </Link>
      </div>

      <div className='filter-bar'>
        <div className='search-field'>
          <Search />
          <input
            placeholder='Search experiments'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className='secondary-button'
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label='Filter runs by status'
        >
          <option value='all'>All statuses</option>
          <option value='review'>Needs review</option>
          <option value='running'>Running</option>
          <option value='complete'>Completed</option>
        </select>
        <button
          className='secondary-button'
          onClick={() => setSortNewest((val) => !val)}
        >
          {sortNewest ? "Newest first" : "Oldest first"} <ChevronDown />
        </button>
      </div>

      {waiting.length > 0 && (
        <div className='review-banner'>
          <Sparkles />
          <span>
            <strong>
              {waiting.length === 1
                ? `${waiting[0].name} is`
                : `${waiting.length} runs are`}{" "}
              waiting for your decision.
            </strong>{" "}
            The judge has prompt candidates ready.
          </span>
          <Link className='primary-button' href={`/runs/${waiting[0].id}`}>
            Review now
          </Link>
        </div>
      )}

      <section className='card table-card'>
        <div className='runs-table-head'>
          <span>Experiment</span>
          <span>Status</span>
          <span>Accuracy</span>
          <span>Cost</span>
          <span>Latency</span>
        </div>
        {visibleRows.length ? (
          visibleRows.map((run) => (
            <Link
              className='list-row runs-row'
              key={run.id}
              href={`/runs/${run.id}`}
            >
              <span className='row-icon'>
                <Beaker />
              </span>
              <span>
                <strong>{run.name}</strong>
                <small>
                  {run.status === "running"
                    ? `Running pass ${run.decisions.length + 1} of ${run.humanReview ? run.loops + 1 : 1}`
                    : run.status === "review"
                      ? `Waiting for your decision · iteration ${run.decisions.length + 1} of ${run.loops}`
                      : run.completedLabel}{" "}
                  · {run.dataset}
                </small>
              </span>
              <span
                className={`status-pill ${run.status === "complete" ? "" : run.status}`}
              >
                {statusLabels[run.status]}
              </span>
              <span className='run-metric'>{run.accuracy}</span>
              <span className='run-metric'>{run.cost}</span>
              <span className='run-metric'>{run.latency}</span>
            </Link>
          ))
        ) : (
          <div className='empty-state'>No runs match these filters.</div>
        )}
      </section>
    </div>
  );
}
