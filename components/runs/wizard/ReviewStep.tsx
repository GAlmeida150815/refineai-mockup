"use client";

import Link from "next/link";
import { useApp } from "@/components/shell/AppShell";
import { models } from "@/lib/mock-data";

export function ReviewStep() {
  const { draft } = useApp();
  const modelCount = draft.selectedModels.length;
  const passes = draft.humanReview ? draft.reviewLoops + 1 : 1;

  return (
    <>
      <div className='review-intro'>
        <span className='eyebrow'>FINAL CHECK</span>
        <h1>Review</h1>
        <p className='wizard-description'>
          Confirm every part of this run before evaluating.{" "}
          {draft.humanReview
            ? "The run will pause in Runs after each pass for your decision."
            : "Results appear when the run finishes."}
        </p>

        <div className='review-summary-grid'>
          <section className='review-panel card'>
            <div className='review-panel-heading'>
              <span className='review-index'>01</span>
              <div>
                <span className='eyebrow'>TASK</span>
                <h2>{draft.name || "Untitled run"}</h2>
              </div>
              <Link className='text-button' href='/runs/new/prompt'>
                Edit
              </Link>
            </div>
            <p>{draft.prompt}</p>
            <code>Base prompt · refined per model during the run</code>
          </section>

          <section className='review-panel card'>
            <div className='review-panel-heading'>
              <span className='review-index'>02</span>
              <div>
                <span className='eyebrow'>MODELS</span>
                <h2>
                  {modelCount} models · {draft.judges.length}{" "}
                  {draft.judges.length === 1 ? "judge" : "judges"}
                </h2>
              </div>
              <Link className='text-button' href='/runs/new/models'>
                Edit
              </Link>
            </div>
            <div className='review-model-list'>
              {Array.from(
                new Set([...draft.selectedModels, ...draft.judges]),
              ).map((name) => {
                const tested = draft.selectedModels.includes(name);
                const judging = draft.judges.includes(name);
                return (
                  <div className='review-model-row' key={name}>
                    <span className='model-orb'>{name[0]}</span>
                    <span>
                      <strong>{name}</strong>
                      <small>
                        {models.find((m) => m.name === name)?.provider ??
                          "Connected provider"}{" "}
                        ·{" "}
                        {tested
                          ? `${draft.executionsPerModel.toLocaleString("en-US")} executions`
                          : "judge only"}
                      </small>
                    </span>
                    <span className={`status-pill ${judging ? "review" : ""}`}>
                      {tested && judging
                        ? "Tested + judge"
                        : judging
                          ? "Judge"
                          : "Tested"}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className='review-panel card'>
            <div className='review-panel-heading'>
              <span className='review-index'>03</span>
              <div>
                <span className='eyebrow'>DATASET</span>
                <h2>{draft.dataset}</h2>
              </div>
              <Link className='text-button' href='/runs/new/dataset'>
                Edit
              </Link>
            </div>
            <div className='review-detail-grid'>
              <span>
                <strong>{draft.sourceExamples.toLocaleString("en-US")}</strong>
                <small>Rows</small>
              </span>
              <span>
                <strong>CSV</strong>
                <small>Format</small>
              </span>
              <span>
                <strong>{draft.datasetColumns}</strong>
                <small>Columns</small>
              </span>
              <span>
                <strong>Ready</strong>
                <small>Validation</small>
              </span>
            </div>
          </section>

          <section className='review-panel card review-run-plan'>
            <div className='review-panel-heading'>
              <span className='review-index'>04</span>
              <div>
                <span className='eyebrow'>RUN PLAN</span>
                <h2>Ready to evaluate</h2>
              </div>
              <Link className='text-button' href='/runs/new/configuration'>
                Edit
              </Link>
            </div>
            <div className='review-detail-grid'>
              <span>
                <strong>
                  {(modelCount * draft.executionsPerModel).toLocaleString(
                    "en-US",
                  )}
                </strong>
                <small>Executions / pass</small>
              </span>
              <span>
                <strong>{passes}</strong>
                <small>Passes</small>
              </span>
              <span>
                <strong>{draft.humanReview ? draft.reviewLoops : "Off"}</strong>
                <small>Human decisions</small>
              </span>
            </div>
          </section>
        </div>
      </div>

      <section className='card config-review'>
        <div className='config-review-header'>
          <div>
            <span className='eyebrow'>RUN CONFIGURATION</span>
            <h2>{draft.name || "Untitled run"}</h2>
          </div>
          <span className='status-pill'>Ready to run</span>
        </div>
        <div className='config-review-grid'>
          <div>
            <span>Prompt</span>
            <strong>{draft.prompt.split(" ").slice(0, 4).join(" ")}</strong>
          </div>
          <div>
            <span>Models</span>
            <strong>{modelCount} selected</strong>
          </div>
          <div>
            <span>Dataset</span>
            <strong>{draft.dataset}</strong>
          </div>
          <div>
            <span>Examples</span>
            <strong>{draft.sourceExamples.toLocaleString("en-US")}</strong>
          </div>
        </div>
      </section>

      <div className='summary-visual'>
        <div>
          <span>Expected quality</span>
          <strong>94.8%</strong>
        </div>
        <div className='summary-sparkline'>
          {[42, 62, 54, 78, 70, 92, 84].map((h, i) => (
            <i key={i} style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className='summary-legend'>
          <span>
            <b className='legend-dot purple' />
            Accuracy trend
          </span>
          <span>
            <b className='legend-dot teal' />
            {modelCount} models selected
          </span>
        </div>
      </div>
    </>
  );
}
