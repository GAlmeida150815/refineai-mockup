"use client";

import Link from "next/link";
import { useApp } from "@/components/shell/AppShell";
import { EnhancedResultsPage } from "./EnhancedResultsPage";
import { RunDecision } from "./RunDecision";
import { RunProgress } from "./RunProgress";

export function RunView({
  runId,
  fromWizard,
}: {
  runId: string;
  fromWizard: boolean;
}) {
  const { runs } = useApp();
  const run = runs.find((r) => r.id === runId);

  if (!run) {
    return (
      <div className='main-scroll results-page'>
        <div className='results-top'>
          <Link className='back-link' href='/runs'>
            ← Back to Runs
          </Link>
        </div>
        <div className='empty-state'>
          This run doesn&apos;t exist. Runs created in the wizard only live
          until the page is refreshed.
        </div>
      </div>
    );
  }

  if (run.status === "review") {
    return <RunDecision key={run.decisions.length} run={run} />;
  }
  if (run.status === "running") {
    return (
      <RunProgress key={run.phaseStartedAt} run={run} fromWizard={fromWizard} />
    );
  }
  return <EnhancedResultsPage run={run} fromWizard={fromWizard} />;
}
