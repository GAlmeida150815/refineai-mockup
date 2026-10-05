"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowUpRight, Check, Gavel, Plus } from "lucide-react";
import { useApp } from "@/components/shell/AppShell";
import { models } from "@/lib/mock-data";

export function ModelsStep() {
  const router = useRouter();
  const { draft, updateDraft, openModal } = useApp();
  const selfJudging = draft.judges.filter((name) =>
    draft.selectedModels.includes(name),
  );

  const toggled = (list: string[], name: string) =>
    list.includes(name) ? list.filter((m) => m !== name) : [...list, name];

  return (
    <>
      <h1>Which models should we test?</h1>
      <p className='wizard-description'>
        Pick the models whose prompts get refined, then choose who judges their
        outputs. A model can do both.
      </p>

      <div className='execution-setting card'>
        <div>
          <span className='eyebrow'>EVALUATION SIZE</span>
          <strong>Executions per model</strong>
          <p>Each selected model will run against this many examples.</p>
        </div>
        <label className='execution-input'>
          <input
            type='number'
            min='1'
            max='10000'
            value={draft.executionsPerModel}
            onChange={(e) =>
              updateDraft({
                executionsPerModel: Math.max(1, Number(e.target.value) || 1),
              })
            }
          />
          <span>runs</span>
        </label>
      </div>

      <h2 className='wizard-section-title'>
        Models to test <small>{draft.selectedModels.length} selected</small>
      </h2>
      <div className='wizard-models'>
        {models.map((model) => (
          <button
            className={`wizard-model ${draft.selectedModels.includes(model.name) ? "selected" : ""}`}
            key={model.name}
            onClick={() =>
              updateDraft({
                selectedModels: toggled(draft.selectedModels, model.name),
              })
            }
          >
            <span className='model-orb'>{model.name[0]}</span>
            <span>
              <strong>{model.name}</strong>
              <small>
                {model.provider} · {model.cost} / 1k tokens
              </small>
            </span>
            <Check />
          </button>
        ))}
      </div>

      <button
        className='add-provider-link'
        onClick={() => {
          openModal("Connect model");
          router.push("/settings?tab=providers");
        }}
      >
        <Plus /> Add another model in Settings <ArrowUpRight />
      </button>

      <h2 className='wizard-section-title'>
        Judges <small>Score every output and propose prompt refinements</small>
      </h2>
      <div className='wizard-models'>
        {models.map((model) => (
          <button
            className={`wizard-model ${draft.judges.includes(model.name) ? "selected" : ""}`}
            key={model.name}
            onClick={() =>
              updateDraft({ judges: toggled(draft.judges, model.name) })
            }
          >
            <span className='model-orb'>{model.name[0]}</span>
            <span>
              <strong>
                {model.name}
                {model.kind === "classifier" && (
                  <span className='model-badge'>Default judge</span>
                )}
              </strong>
              <small>
                {model.kind === "classifier"
                  ? `Purpose-built judge · consistent scoring · ${model.cost} / 1k tokens`
                  : `${model.provider} · rubric-based LLM judge`}
              </small>
            </span>
            <Gavel />
          </button>
        ))}
      </div>

      {selfJudging.length > 0 && (
        <p className='judge-hint'>
          <AlertTriangle />
          {selfJudging.join(" and ")} {selfJudging.length > 1 ? "are" : "is"}{" "}
          both tested and judging. Models tend to favour their own outputs, so
          their verdicts are marked during each decision.
        </p>
      )}
    </>
  );
}
