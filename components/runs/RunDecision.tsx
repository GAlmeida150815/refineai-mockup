"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { useApp } from "@/components/shell/AppShell";
import {
  MOCK_PASS_MS,
  models,
  type PromptChoice,
  type Run,
} from "@/lib/mock-data";

const strategies = [
  {
    id: "evidence",
    label: "Require evidence",
    addition: "Quote the exact part of the input that supports each field.",
    rationale: "Answers cited facts that are not in the input.",
    lift: 2.4,
  },
  {
    id: "schema",
    label: "Strict JSON only",
    addition:
      "Return only valid JSON with the requested keys, with no text before or after it.",
    rationale: "Some outputs wrapped the JSON in prose and failed parsing.",
    lift: 1.8,
  },
  {
    id: "ambiguity",
    label: "Handle ambiguity",
    addition:
      "If the input fits more than one option, choose the most conservative one and name what is missing.",
    rationale:
      "Most remaining errors came from inputs that fit two categories.",
    lift: 1.5,
  },
  {
    id: "focus",
    label: "Find the core request",
    addition:
      "Before answering, identify the single most important request in the input.",
    rationale:
      "Long inputs with several asks were handled by whichever came first.",
    lift: 2.1,
  },
  {
    id: "brevity",
    label: "Shorter explanations",
    addition: "Keep any explanation under 15 words.",
    rationale: "Long explanations added tokens without improving scores.",
    lift: 0.9,
  },
  {
    id: "grounding",
    label: "No outside facts",
    addition: "Never infer facts that are not stated in the input.",
    rationale: "A few outputs guessed details that were not in the input.",
    lift: 1.2,
  },
  {
    id: "example",
    label: "Add a worked example",
    addition:
      "Follow the format of this example exactly: input → JSON with every key filled.",
    rationale: "Format drift was highest on unusual inputs.",
    lift: 1.9,
  },
  {
    id: "self-check",
    label: "Self-check before answering",
    addition:
      "Before responding, check that every key is present and matches the input.",
    rationale: "Missing keys were the most common failure.",
    lift: 1.6,
  },
];

// Deterministic value in [-0.5, 0.5), so each judge's mock score is stable
// across reloads instead of changing every render.
const noise = (key: string) => {
  let hash = 7;
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) % 9973;
  return hash / 9973 - 0.5;
};

const round = (n: number) => Math.round(n * 10) / 10;

export function RunDecision({ run }: { run: Run }) {
  const { updateRun, notify } = useApp();
  const [choices, setChoices] = useState<Record<string, string>>({});
  const iteration = run.decisions.length + 1;
  const judges = run.judges.length ? run.judges : ["Jev"];

  const options = useMemo(
    () =>
      run.models.map((name, modelIndex) => {
        const model = models.find((m) => m.name === name);
        const previous = run.decisions.at(-1)?.choices[name];
        const currentScore =
          previous?.score ?? parseFloat(model?.accuracy ?? "85");
        const currentPrompt = run.modelPrompts[name] ?? run.basePrompt;
        const used = run.decisions.map((d) => d.choices[name]?.strategyId);
        const pool = strategies.filter((s) => !used.includes(s.id));
        const start = (modelIndex * 3 + iteration) % pool.length;

        const candidates = [...pool.slice(start), ...pool.slice(0, start)]
          .slice(0, 3)
          .map((strategy, k) => {
            const variation =
              0.6 + ((modelIndex * 3 + iteration * 2 + k) % 5) * 0.12;
            const consensus =
              currentScore +
              strategy.lift * variation * ((100 - currentScore) / 10);

            // Each judge scores on its own: Jev is tight, LLM judges disagree
            // more, and a judge scoring its own model adds a small bias.
            const judgeScores: Record<string, number> = Object.fromEntries(
              judges.map((judge) => {
                const isClassifier =
                  models.find((m) => m.name === judge)?.kind === "classifier";
                const spread = isClassifier ? 0.8 : 2.2;
                const selfBias = judge === name ? 1 : 0;
                const value =
                  consensus +
                  noise(`${judge}|${name}|${strategy.id}|${iteration}`) *
                    spread +
                  selfBias;
                return [judge, round(Math.min(99.6, value))];
              }),
            );
            const values = Object.values(judgeScores);
            const score = round(
              values.reduce((sum, v) => sum + v, 0) / values.length,
            );

            return {
              strategyId: strategy.id,
              label: strategy.label,
              addition: strategy.addition,
              rationale: strategy.rationale,
              prompt: `${currentPrompt} ${strategy.addition}`,
              letter: String.fromCharCode(65 + k),
              score,
              delta: score - currentScore,
              judgeScores,
            };
          });

        const verdicts: Record<string, string> = Object.fromEntries(
          judges.map((judge) => [
            judge,
            candidates.reduce((a, b) =>
              b.judgeScores[judge] > a.judgeScores[judge] ? b : a,
            ).strategyId,
          ]),
        );
        const votesFor = (id: string) =>
          Object.values(verdicts).filter((v) => v === id).length;
        const panelPick = candidates.reduce((a, b) =>
          votesFor(b.strategyId) > votesFor(a.strategyId) ||
          (votesFor(b.strategyId) === votesFor(a.strategyId) &&
            b.score > a.score)
            ? b
            : a,
        ).strategyId;

        return {
          name,
          provider: model?.provider ?? "Connected provider",
          currentScore,
          currentPrompt,
          candidates,
          verdicts,
          votesFor,
          panelPick,
        };
      }),
    [run, iteration, judges],
  );

  const decided = options.filter((o) => choices[o.name]).length;
  const agreed = options.filter((o) => choices[o.name] === o.panelPick).length;

  const acceptJudgePicks = () =>
    setChoices(Object.fromEntries(options.map((o) => [o.name, o.panelPick])));

  const submit = () => {
    const chosen: Record<string, PromptChoice> = Object.fromEntries(
      options.map((o) => {
        const c = o.candidates.find((c) => c.strategyId === choices[o.name])!;
        return [
          o.name,
          {
            strategyId: c.strategyId,
            label: c.label,
            addition: c.addition,
            prompt: c.prompt,
            score: c.score,
          },
        ];
      }),
    );
    const now = Date.now();
    updateRun(run.id, {
      status: "running",
      decisions: [...run.decisions, { iteration, choices: chosen }],
      modelPrompts: Object.fromEntries(
        Object.entries(chosen).map(([name, c]) => [name, c.prompt]),
      ),
      phaseStartedAt: now,
      phaseEndsAt: now + MOCK_PASS_MS,
    });
    notify(`Pass ${iteration + 1} started for ${run.name}`);
  };

  return (
    <div className='main-scroll results-page'>
      <div className='results-top'>
        <Link className='back-link' href='/runs'>
          ← Back to Runs
        </Link>
        <span className='status-pill review'>Needs review</span>
      </div>

      <section className='card neural-card decision-hero'>
        <div>
          <span className='eyebrow'>
            HUMAN DECISION · ITERATION {iteration} OF {run.loops}
          </span>
          <h1>Choose the next prompt for each model</h1>
          <p>
            Pass {iteration} of {run.name} is done. {judges.join(" + ")}{" "}
            {judges.length > 1 ? "each scored" : "scored"} three refinements per
            model on a 200-example sample. Their verdicts are below. Pick one
            per model to start pass {iteration + 1}.
          </p>
          <div className='decision-pips'>
            {Array.from({ length: run.loops }, (_, i) => (
              <span
                key={i}
                className={
                  i < iteration - 1
                    ? "done"
                    : i === iteration - 1
                      ? "current"
                      : ""
                }
              />
            ))}
          </div>
        </div>
        <div className='decision-stats'>
          <div>
            <strong>{run.models.length}</strong>
            <small>Models</small>
          </div>
          <div>
            <strong>
              {options.reduce((n, o) => n + o.candidates.length, 0)}
            </strong>
            <small>Candidates</small>
          </div>
          <div>
            <strong>{judges.length}</strong>
            <small>{judges.length === 1 ? "Judge" : "Judges"}</small>
          </div>
        </div>
      </section>

      {options.map((option) => (
        <section className='card decision-model' key={option.name}>
          <div className='decision-model-head'>
            <span className='model-orb'>{option.name[0]}</span>
            <span>
              <strong>{option.name}</strong>
              <small>
                {option.provider} · current score{" "}
                {option.currentScore.toFixed(1)}%
                {judges.includes(option.name)
                  ? " · also judging (may favour itself)"
                  : ""}
              </small>
            </span>
            <span
              className={`status-pill ${choices[option.name] ? "" : "running"}`}
            >
              {choices[option.name] ? "Decided" : "Pending"}
            </span>
          </div>

          <div className='decision-verdicts'>
            <span className='decision-verdicts-label'>Judge verdicts</span>
            {judges.map((judge) => {
              const pick = option.candidates.find(
                (c) => c.strategyId === option.verdicts[judge],
              )!;
              const self = judge === option.name;
              return (
                <span
                  className={`verdict ${self ? "self" : ""}`}
                  key={judge}
                  title={
                    self ? `${judge} is judging its own outputs` : undefined
                  }
                >
                  <span className='verdict-judge'>{judge}</span>
                  chose
                  <span className='verdict-letter'>{pick.letter}</span>
                  {pick.label}
                  <strong>{pick.judgeScores[judge].toFixed(1)}%</strong>
                </span>
              );
            })}
          </div>

          <details className='decision-current'>
            <summary>Current prompt</summary>
            <p>{option.currentPrompt}</p>
          </details>

          <div
            className='decision-options'
            role='radiogroup'
            aria-label={`Prompt candidates for ${option.name}`}
          >
            {option.candidates.map((candidate) => {
              const selected = choices[option.name] === candidate.strategyId;
              const votes = option.votesFor(candidate.strategyId);
              return (
                <button
                  type='button'
                  role='radio'
                  aria-checked={selected}
                  className={`decision-option ${selected ? "selected" : ""}`}
                  key={candidate.strategyId}
                  onClick={() =>
                    setChoices({
                      ...choices,
                      [option.name]: candidate.strategyId,
                    })
                  }
                >
                  <span className='decision-option-top'>
                    <span className='decision-option-letter'>
                      {selected ? <Check /> : candidate.letter}
                    </span>
                    <strong>{candidate.label}</strong>
                    {candidate.strategyId === option.panelPick && (
                      <span className='judge-badge'>
                        {judges.length === 1
                          ? `${judges[0]}'s pick`
                          : `Panel pick · ${votes}/${judges.length}`}
                      </span>
                    )}
                  </span>
                  <span className='decision-score'>
                    <strong>{candidate.score.toFixed(1)}%</strong>
                    <span className={candidate.delta < 0 ? "down" : ""}>
                      {candidate.delta >= 0 ? "+" : ""}
                      {candidate.delta.toFixed(1)} pts
                    </span>
                    {judges.length > 1 && <small>panel average</small>}
                  </span>
                  <span className='decision-rationale'>
                    {candidate.rationale}
                  </span>
                  <span className='decision-addition'>
                    + {candidate.addition}
                  </span>
                  <span className='decision-judge-scores'>
                    {judges.map((judge) => (
                      <span
                        key={judge}
                        className={
                          option.verdicts[judge] === candidate.strategyId
                            ? "picked"
                            : ""
                        }
                      >
                        <span>{judge}</span>
                        <strong>
                          {candidate.judgeScores[judge].toFixed(1)}%
                        </strong>
                      </span>
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <div className='decision-footer'>
        <span>
          <strong>
            {decided} of {options.length}
          </strong>{" "}
          models decided
          {decided > 0 &&
            ` · you agree with the judges on ${agreed} of ${decided}`}
        </span>
        <button className='secondary-button' onClick={acceptJudgePicks}>
          <Sparkles /> Accept judge picks
        </button>
        <button
          className='primary-button'
          disabled={decided < options.length}
          onClick={submit}
        >
          Start pass {iteration + 1}
        </button>
      </div>
    </div>
  );
}
