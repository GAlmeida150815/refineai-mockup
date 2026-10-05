"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend,
} from "recharts";
import { useApp } from "@/components/shell/AppShell";
import type { Run } from "@/lib/mock-data";

const modelResults = [
  {
    key: "jev",
    name: "Jev",
    provider: "refineAI",
    score: 96.1,
    faithfulness: 97.4,
    consistency: 98.2,
    latency: 0.14,
    p95: "0.31s",
    cost: 0.02,
    tokens: "212",
    passRate: "99.1%",
    errors: "0.9%",
    costEfficiency: 99,
    speed: 99,
    color: "#6fb7ff",
    recipe: {
      version: "Prompt v4",
      note: "purpose-built classifier",
      pill: "Best for labels",
      prompt:
        "Assign urgency (low, medium, high) and the owning team. Output JSON only with urgency and team.",
    },
  },
  {
    key: "gpt4o",
    name: "GPT-4o",
    provider: "OpenAI",
    score: 94.8,
    faithfulness: 96.2,
    consistency: 93.9,
    latency: 1.42,
    p95: "2.84s",
    cost: 0.42,
    tokens: "1,284",
    passRate: "98.4%",
    errors: "1.6%",
    costEfficiency: 58,
    speed: 65,
    color: "#9a84ff",
    recipe: {
      version: "Prompt v4",
      note: "best quality",
      pill: "Best overall",
      prompt:
        "You are a support triage specialist. Classify each ticket by urgency and team. Return valid JSON with urgency, team, and one concise reason grounded only in the ticket.",
    },
  },
  {
    key: "claude",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    score: 93.6,
    faithfulness: 94.8,
    consistency: 92.4,
    latency: 1.87,
    p95: "3.62s",
    cost: 0.31,
    tokens: "1,108",
    passRate: "97.1%",
    errors: "2.9%",
    costEfficiency: 72,
    speed: 48,
    color: "#55d6bd",
    recipe: {
      version: "Prompt v3",
      note: "strongest groundedness",
      pill: "Best groundedness",
      prompt:
        "Read the ticket carefully, identify the customer's primary need, then output JSON only: urgency, team, and a brief evidence-based reason.",
    },
  },
  {
    key: "mini",
    name: "GPT-4o-mini",
    provider: "OpenAI",
    score: 89.2,
    faithfulness: 90.5,
    consistency: 88.1,
    latency: 0.92,
    p95: "1.74s",
    cost: 0.08,
    tokens: "642",
    passRate: "93.8%",
    errors: "6.2%",
    costEfficiency: 96,
    speed: 92,
    color: "#f2b36f",
    recipe: {
      version: "Prompt v4-lite",
      note: "fastest and lowest cost",
      pill: "Best value",
      prompt:
        "Route this support ticket. Respond with compact JSON containing urgency, team, and a short reason. Do not infer facts not present in the ticket.",
    },
  },
  {
    key: "llama",
    name: "Llama 3.1 70B",
    provider: "Meta",
    score: 87.4,
    faithfulness: 88.9,
    consistency: 86.2,
    latency: 2.06,
    p95: "3.91s",
    cost: 0.18,
    tokens: "1,032",
    passRate: "92.6%",
    errors: "7.4%",
    costEfficiency: 81,
    speed: 52,
    color: "#7aa2ff",
    recipe: {
      version: "Prompt v4",
      note: "open weights",
      pill: "Self-hostable",
      prompt:
        "Classify the ticket's urgency (low, medium, high) and owning team. Output JSON only with urgency, team, and reason. Keep the reason under 20 words.",
    },
  },
];

const rubric = [
  { label: "Accuracy", value: 94.8 },
  { label: "Instruction following", value: 92.6 },
  { label: "Groundedness", value: 96.1 },
  { label: "Format compliance", value: 98.4 },
];

function Metric({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change: string;
}) {
  return (
    <div className='metric-card'>
      <span>{label}</span>
      <strong>{value}</strong>
      <small className='positive'>{change}</small>
    </div>
  );
}

export function EnhancedResultsPage({
  run,
  fromWizard,
}: {
  run: Run;
  fromWizard: boolean;
}) {
  const router = useRouter();
  const { notify, updateDraft } = useApp();

  const backHref = fromWizard ? "/runs/new/review" : "/runs";
  const backLabel = fromWizard ? "Back to review" : "Back to Runs";

  const recipeFor = (m: (typeof modelResults)[number]) => ({
    version: run.decisions.length
      ? `After ${run.decisions.length} human decision${run.decisions.length > 1 ? "s" : ""}`
      : run.modelPrompts[m.name]
        ? run.promptVersion
        : m.recipe.version,
    prompt: run.modelPrompts[m.name] ?? m.recipe.prompt,
  });

  const finalChoices = run.decisions.at(-1)?.choices ?? {};
  const matching = modelResults
    .filter((m) => run.models.includes(m.name))
    .map((m) => ({ ...m, score: finalChoices[m.name]?.score ?? m.score }))
    .sort((a, b) => b.score - a.score);
  const shown = matching.length ? matching : modelResults;
  const best = shown[0];
  const fastest = shown.reduce((a, b) => (b.latency < a.latency ? b : a));
  const totalCost = shown.reduce((sum, m) => sum + m.cost, 0);
  const costs = shown.map((m) => m.cost);
  const latencies = shown.map((m) => m.latency);
  const executions = (run.examples * shown.length).toLocaleString("en-US");

  const radarData = [
    {
      metric: "Accuracy",
      ...Object.fromEntries(shown.map((m) => [m.key, m.score])),
    },
    {
      metric: "Cost efficiency",
      ...Object.fromEntries(shown.map((m) => [m.key, m.costEfficiency])),
    },
    {
      metric: "Latency",
      ...Object.fromEntries(shown.map((m) => [m.key, m.speed])),
    },
  ];

  const runAgain = () => {
    updateDraft({
      name: run.name,
      selectedModels: run.models,
      dataset: run.dataset,
      sourceExamples: run.examples,
    });
    router.push("/runs/new/review");
  };

  const exportCsv = () => {
    const header = [
      "Model",
      "Provider",
      "Overall",
      "Faithfulness",
      "Consistency",
      "Pass rate",
      "Error rate",
      "Tokens / run",
      "p50 latency",
      "p95 latency",
      "Cost / run",
    ];
    const rows = shown.map((m) => [
      m.name,
      m.provider,
      `${m.score}%`,
      `${m.faithfulness}%`,
      `${m.consistency}%`,
      m.passRate,
      m.errors,
      m.tokens,
      `${m.latency}s`,
      m.p95,
      `$${m.cost.toFixed(2)}`,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${run.id}-scorecard.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    notify("Results exported");
  };

  const copyRecipes = () => {
    const text = shown
      .map((m) => `${recipeFor(m).version}\n${recipeFor(m).prompt}`)
      .join("\n\n");
    navigator.clipboard
      .writeText(text)
      .then(() => notify("Prompt recipes copied"))
      .catch(() => notify("Clipboard is not available"));
  };

  return (
    <div className='main-scroll results-page'>
      <div className='results-top'>
        <Link className='back-link' href={backHref}>
          ← {backLabel}
        </Link>
        <button className='primary-button' onClick={runAgain}>
          Run again
        </button>
      </div>

      <div className='results-review card'>
        <div>
          <span className='eyebrow'>RUN COMPLETE</span>
          <h2>{run.name}</h2>
          <p>
            {run.examples.toLocaleString("en-US")} CSV examples · {shown.length}{" "}
            models · {executions} total executions
          </p>
        </div>
        <span className='status-pill'>Complete</span>
        <div className='review-chips'>
          <span>{run.promptVersion}</span>
          <span>{run.dataset}</span>
          <span>Judged by {run.judges.join(" + ")}</span>
          <span>{executions} executions</span>
        </div>
      </div>

      <div className='run-kpi-grid'>
        <Metric
          label='Best overall'
          value={`${best.score}%`}
          change={best.name}
        />
        <Metric label='Quality lift' value='+8.6 pts' change='vs. baseline' />
        <Metric
          label='Fastest'
          value={`${fastest.latency}s`}
          change={fastest.name}
        />
        <Metric
          label='Total cost'
          value={`$${totalCost.toFixed(2)}`}
          change={`${executions} executions`}
        />
      </div>

      <section className='card radar-card'>
        <div className='card-header'>
          <div>
            <span className='eyebrow'>MODEL COMPARISON</span>
            <h2>Quality, cost & latency profile</h2>
            <p>
              Normalized scores across the three run KPIs. Higher is better on
              every axis.
            </p>
          </div>
          <span className='status-pill'>{shown.length} models</span>
        </div>
        <div className='radar-wrap'>
          <ResponsiveContainer width='100%' height='100%'>
            <RadarChart cx='50%' cy='50%' outerRadius='72%' data={radarData}>
              <PolarGrid stroke='var(--border)' />
              <PolarAngleAxis
                dataKey='metric'
                tick={{ fill: "var(--muted)", fontSize: 11 }}
              />
              <PolarRadiusAxis
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              {shown.map((m, i) => (
                <Radar
                  key={m.key}
                  name={m.name}
                  dataKey={m.key}
                  stroke={m.color}
                  fill={m.color}
                  fillOpacity={[0.18, 0.12, 0.1, 0.1, 0.08][i]}
                  strokeWidth={2}
                />
              ))}
              <Tooltip
                contentStyle={{
                  background: "var(--panel)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  color: "var(--foreground)",
                  fontSize: 11,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className='radar-legend-note'>
          <span>
            Accuracy is measured directly; cost and latency are normalized for
            comparison.
          </span>
          <span>
            Cost: ${Math.min(...costs).toFixed(2)}–$
            {Math.max(...costs).toFixed(2)} · p50 latency:{" "}
            {Math.min(...latencies)}–{Math.max(...latencies)}s
          </span>
        </div>
      </section>

      <div className='results-section-grid'>
        <section className='card tierlist-card'>
          <div className='card-header'>
            <div>
              <span className='eyebrow'>MODEL TIERLIST</span>
              <h2>Best fit for this prompt</h2>
              <p>
                Ranked by quality first, with latency and cost as tie-breakers.
              </p>
            </div>
          </div>
          <div className='tier-list'>
            {shown.map((m, i) => (
              <div className={`tier-row tier-${i + 1}`} key={m.key}>
                <strong className='tier-rank'>
                  {["S", "A", "B", "C", "D"][i]}
                </strong>
                <span className='model-orb' style={{ background: m.color }}>
                  {m.name[0]}
                </span>
                <span className='tier-model'>
                  <strong>{m.name}</strong>
                  <small>
                    {m.provider} · {m.latency}s p50 · ${m.cost.toFixed(2)}/run
                  </small>
                </span>
                <strong className='tier-score'>{m.score}%</strong>
              </div>
            ))}
          </div>
        </section>

        <section className='card rubric-card'>
          <div className='card-header'>
            <div>
              <span className='eyebrow'>RUBRIC BREAKDOWN</span>
              <h2>Why the scores moved</h2>
              <p>Average score across all evaluated examples.</p>
            </div>
          </div>
          <div className='rubric-bars'>
            {rubric.map((item) => (
              <div className='rubric-row' key={item.label}>
                <div>
                  <span>{item.label}</span>
                  <strong>{item.value}%</strong>
                </div>
                <div className='bar-track'>
                  <i style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className='card results-table-card'>
        <div className='card-header'>
          <div>
            <span className='eyebrow'>DETAILED COMPARISON</span>
            <h2>Model scorecard</h2>
            <p>Use the full scorecard to choose a production default.</p>
          </div>
          <button className='secondary-button' onClick={exportCsv}>
            Export CSV
          </button>
        </div>
        <div className='results-table-wrap'>
          <table className='results-table'>
            <thead>
              <tr>
                <th>Model</th>
                <th>Overall</th>
                <th>Accuracy</th>
                <th>Faithfulness</th>
                <th>Consistency</th>
                <th>Pass rate</th>
                <th>Error rate</th>
                <th>Tokens / run</th>
                <th>p50 latency</th>
                <th>p95 latency</th>
                <th>Cost / run</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((m, i) => (
                <tr key={m.key}>
                  <td>
                    <strong>{m.name}</strong>
                    <small>
                      {m.provider} · Rank #{i + 1}
                    </small>
                  </td>
                  <td>
                    <strong>{m.score}%</strong>
                  </td>
                  <td>{m.score}%</td>
                  <td>{m.faithfulness}%</td>
                  <td>{m.consistency}%</td>
                  <td className='positive-cell'>{m.passRate}</td>
                  <td className='negative-cell'>{m.errors}</td>
                  <td>{m.tokens}</td>
                  <td>{m.latency}s</td>
                  <td>{m.p95}</td>
                  <td>${m.cost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className='card best-prompts-card'>
        <div className='card-header'>
          <div>
            <span className='eyebrow'>BEST PROMPT PER MODEL</span>
            <h2>Prompt recipes that performed best</h2>
            <p>
              These are the prompt variants with the strongest score for each
              model.
            </p>
          </div>
          <button className='secondary-button' onClick={copyRecipes}>
            Copy all
          </button>
        </div>
        <div className='prompt-recipe-list'>
          {shown.map((m) => (
            <article className='prompt-recipe' key={m.key}>
              <div className='prompt-recipe-top'>
                <span className='model-orb' style={{ background: m.color }}>
                  {m.name[0]}
                </span>
                <div>
                  <strong>
                    {m.name} · {recipeFor(m).version}
                  </strong>
                  <small>
                    {m.score}% overall · {m.recipe.note}
                  </small>
                </div>
                <span className='status-pill'>{m.recipe.pill}</span>
              </div>
              <code>{recipeFor(m).prompt}</code>
            </article>
          ))}
        </div>
      </section>

      <section className='card insight-card'>
        <span className='eyebrow'>REFINING THE PROMPT</span>
        <h2>Recommendation</h2>
        <p>
          {best.name} is the strongest production default for this prompt. The
          refined JSON schema improved format compliance to 98.4%, while the
          concise reason requirement reduced ambiguous classifications.
        </p>
        <div className='insight-tags'>
          <span>Keep structured output</span>
          <span>Prefer {best.name} for quality</span>
          <span>Use {fastest.name} for speed</span>
        </div>
      </section>
    </div>
  );
}
