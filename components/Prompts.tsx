"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Search, Sparkles, Zap } from "lucide-react";
import { useApp } from "@/components/shell/AppShell";
import type { Prompt } from "@/lib/mock-data";

export function Prompts() {
  const router = useRouter();
  const { prompts, upsertPrompt, updateDraft, notify } = useApp();
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("all");
  const [sort, setSort] = useState("recent");

  const bestScore = (p: Prompt) =>
    Math.max(0, ...p.versions.map((v) => v.score ?? 0));
  const tags = Array.from(new Set(prompts.flatMap((p) => p.tags))).sort();
  const scored = prompts.filter((p) => bestScore(p) > 0);
  const top = [...scored].sort((a, b) => bestScore(b) - bestScore(a))[0];
  const avgBest = scored.length
    ? scored.reduce((sum, p) => sum + bestScore(p), 0) / scored.length
    : 0;
  const versionCount = prompts.reduce((n, p) => n + p.versions.length, 0);
  const editedThisWeek = prompts.filter((p) => p.versions[0].age < 168).length;

  const visible = prompts
    .filter(
      (p) =>
        (tag === "all" || p.tags.includes(tag)) &&
        `${p.name} ${p.description} ${p.tags.join(" ")} ${p.versions[0].template}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "score"
        ? bestScore(b) - bestScore(a)
        : sort === "name"
          ? a.name.localeCompare(b.name)
          : a.versions[0].age - b.versions[0].age,
    );

  const createPrompt = () => {
    let n = 1;
    let id = "untitled-prompt";
    while (prompts.some((p) => p.id === id)) id = `untitled-prompt-${++n}`;
    upsertPrompt({
      id,
      name: n === 1 ? "Untitled prompt" : `Untitled prompt ${n}`,
      description: "Describe what this prompt does.",
      tags: [],
      runIds: [],
      versions: [
        {
          version: "v1",
          note: "Created",
          author: "Jordan Davis",
          edited: "just now",
          age: 0,
          score: null,
          template: "",
        },
      ],
    });
    router.push(`/prompts/${id}`);
  };

  const copyPrompt = (prompt: Prompt) =>
    navigator.clipboard
      .writeText(prompt.versions[0].template)
      .then(() => notify(`${prompt.name} ${prompt.versions[0].version} copied`))
      .catch(() => notify("Clipboard is not available", "error"));

  const refineTop = () => {
    if (!top) return;
    updateDraft({
      name: top.name,
      prompt: top.versions[0].template,
      promptId: top.id,
    });
    router.push("/runs/new/prompt");
  };

  return (
    <div className='main-scroll'>
      <div className='page-heading'>
        <div>
          <div className='eyebrow'>
            <span className='status-dot' /> PROMPT LIBRARY
          </div>
          <h1>Prompts</h1>
          <p>
            Version prompts like code, test changes, and reuse what performs.
          </p>
        </div>
        <button className='primary-button' onClick={createPrompt}>
          New prompt
        </button>
      </div>

      <div className='metrics-grid'>
        <div className='metric-card'>
          <span>Prompts</span>
          <strong>{prompts.length}</strong>
          <small>{tags.length} tags</small>
        </div>
        <div className='metric-card'>
          <span>Average best score</span>
          <strong>{avgBest ? `${avgBest.toFixed(1)}%` : "—"}</strong>
          <small className='positive'>{scored.length} tested</small>
        </div>
        <div className='metric-card'>
          <span>Versions</span>
          <strong>{versionCount}</strong>
          <small>{editedThisWeek} edited this week</small>
        </div>
        <div className='metric-card'>
          <span>Linked runs</span>
          <strong>{prompts.reduce((n, p) => n + p.runIds.length, 0)}</strong>
          <small>across all prompts</small>
        </div>
      </div>

      <div className='filter-bar'>
        <div className='search-field'>
          <Search />
          <input
            placeholder='Search names, tags or prompt text'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className='secondary-button'
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          aria-label='Filter by tag'
        >
          <option value='all'>All tags</option>
          {tags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          className='secondary-button'
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label='Sort prompts'
        >
          <option value='recent'>Recently edited</option>
          <option value='score'>Best score</option>
          <option value='name'>Name</option>
        </select>
      </div>

      <section className='prompt-list card'>
        {visible.length ? (
          visible.map((prompt, i) => {
            const current = prompt.versions[0];
            const scoredVersions = prompt.versions.filter(
              (v) => v.score !== null,
            );
            const latest = scoredVersions[0];
            const previous = scoredVersions[1];
            const delta =
              latest && previous
                ? (latest.score ?? 0) - (previous.score ?? 0)
                : null;

            return (
              <div className='prompt-row' key={prompt.id}>
                <span className='prompt-number'>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className='prompt-copy'>
                  <Link className='prompt-link' href={`/prompts/${prompt.id}`}>
                    <strong>{prompt.name}</strong>
                  </Link>
                  <small>{prompt.description}</small>
                  <span className='prompt-meta'>
                    {current.version} · edited {current.edited} by{" "}
                    {current.author} · {prompt.runIds.length}{" "}
                    {prompt.runIds.length === 1 ? "run" : "runs"}
                  </span>
                </span>
                <span className='prompt-tags'>
                  {prompt.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </span>
                <span className='sparkline' title='Score per version'>
                  {[...prompt.versions].reverse().map((v) => (
                    <i
                      key={v.version}
                      style={{
                        height: `${v.score === null ? 8 : Math.max(10, ((v.score - 70) / 30) * 100)}%`,
                      }}
                    />
                  ))}
                </span>
                <span className='row-score'>
                  {latest ? `${latest.score}%` : "—"}
                  <small
                    className={
                      delta === null ? "" : delta >= 0 ? "positive" : "negative"
                    }
                  >
                    {delta !== null && previous
                      ? `${delta >= 0 ? "+" : ""}${delta.toFixed(1)} vs ${previous.version}`
                      : latest
                        ? latest.version
                        : "untested"}
                  </small>
                </span>
                <button
                  className='icon-button prompt-copy-button'
                  aria-label={`Copy ${prompt.name}`}
                  onClick={() => copyPrompt(prompt)}
                >
                  <Copy />
                </button>
              </div>
            );
          })
        ) : (
          <div className='empty-state'>No prompts match these filters.</div>
        )}
      </section>

      {top && (
        <div className='prompt-tip'>
          <Sparkles />
          <span>
            <strong>Prompt intelligence</strong>
            <small>
              {top.name} is your best prompt at {bestScore(top)}%. Start a
              judged refinement run to push it further.
            </small>
          </span>
          <button className='secondary-button' onClick={refineTop}>
            Refine with judges <Zap />
          </button>
        </div>
      )}
    </div>
  );
}
