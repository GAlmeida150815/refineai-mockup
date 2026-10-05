"use client";

import { useApp } from "@/components/shell/AppShell";

export function ConfigurationStep() {
  const { draft, updateDraft } = useApp();

  return (
    <>
      <h1>Configure human review</h1>
      <p>
        After each pass, {draft.judges.join(" + ") || "the judge"}{" "}
        {draft.judges.length > 1 ? "propose" : "proposes"} three refinements per
        model. The run waits in Runs until you choose.
      </p>

      <section className='human-review-setting card'>
        <div>
          <span className='eyebrow'>HUMAN DECISION GATE</span>
          <strong>Review prompts between passes</strong>
          <p>
            After each pass the judge proposes three refinements per model. The
            run waits in Runs until you choose.
          </p>
        </div>
        <label className='switch-control'>
          <input
            type='checkbox'
            checked={draft.humanReview}
            onChange={(e) => updateDraft({ humanReview: e.target.checked })}
          />
          <span />
        </label>
      </section>

      <section className='loop-setting card'>
        <div>
          <span className='eyebrow'>ITERATIONS</span>
          <strong>Prompt refinement loops</strong>
          <p>
            {draft.humanReview
              ? `${draft.reviewLoops} decision${draft.reviewLoops > 1 ? "s" : ""}, ${draft.reviewLoops + 1} passes in total.`
              : "Turn on human review to refine prompts between passes."}
          </p>
        </div>
        <label className='execution-input'>
          <input
            type='number'
            min='1'
            max='5'
            disabled={!draft.humanReview}
            value={draft.reviewLoops}
            onChange={(e) =>
              updateDraft({
                reviewLoops: Math.min(
                  5,
                  Math.max(1, Number(e.target.value) || 1),
                ),
              })
            }
          />
          <span>loops</span>
        </label>
      </section>
    </>
  );
}
