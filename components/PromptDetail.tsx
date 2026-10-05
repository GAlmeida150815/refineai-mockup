"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Beaker, Copy, Play } from "lucide-react";
import { useApp } from "@/components/shell/AppShell";
import type { Prompt, PromptVersion } from "@/lib/mock-data";

export function PromptDetail({ promptId }: { promptId: string }) {
  const { prompts } = useApp();
  const prompt = prompts.find((p) => p.id === promptId);

  if (!prompt) {
    return (
      <div className='main-scroll detail-screen'>
        <Link className='back-link' href='/prompts'>
          ← Back to Prompts
        </Link>
        <div className='empty-state'>
          This prompt doesn&apos;t exist. Prompts created here only live until
          the page is refreshed.
        </div>
      </div>
    );
  }

  return <PromptWorkspace key={prompt.id} prompt={prompt} />;
}

function PromptWorkspace({ prompt }: { prompt: Prompt }) {
  const router = useRouter();
  const { runs, notify, updateDraft, upsertPrompt } = useApp();
  const current = prompt.versions[0];

  const [selected, setSelected] = useState(current.version);
  const [text, setText] = useState(current.template);
  const [name, setName] = useState(prompt.name);
  const [description, setDescription] = useState(prompt.description);
  const [tagText, setTagText] = useState(prompt.tags.join(", "));
  const [note, setNote] = useState("");

  const selectedIndex = Math.max(
    0,
    prompt.versions.findIndex((v) => v.version === selected),
  );
  const selectedVersion = prompt.versions[selectedIndex];
  const previousVersion = prompt.versions[selectedIndex + 1];
  const nextVersion = `v${parseInt(current.version.slice(1), 10) + 1}`;
  const templateChanged = text !== current.template;
  const restoring =
    selected !== current.version && text === selectedVersion.template;
  const detailsChanged =
    name !== prompt.name ||
    description !== prompt.description ||
    tagText !== prompt.tags.join(", ");
  const variables = Array.from(
    new Set(text.match(/\{\{\s*[\w.]+\s*\}\}/g) ?? []),
  );
  const best = prompt.versions
    .filter((v) => v.score !== null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
  const linkedRuns = runs.filter((r) => prompt.runIds.includes(r.id));
  const tokens = Math.ceil(text.length / 4);

  // What to compare: unsaved edits against the current version, otherwise
  // the selected version against the one before it.
  const [diffTitle, before, after] = templateChanged
    ? ["Unsaved changes", current.template, text]
    : previousVersion
      ? [
          `What changed in ${selectedVersion.version}`,
          previousVersion.template,
          selectedVersion.template,
        ]
      : [
          `${selectedVersion.version} is the first version`,
          "",
          selectedVersion.template,
        ];
  const showDiff = templateChanged || Boolean(previousVersion);

  const diff = useMemo(() => {
    // Word-level diff via longest common subsequence.
    const a = before.split(/(\s+)/);
    const b = after.split(/(\s+)/);
    const lcs = Array.from({ length: a.length + 1 }, () =>
      new Array<number>(b.length + 1).fill(0),
    );
    for (let i = a.length - 1; i >= 0; i--) {
      for (let j = b.length - 1; j >= 0; j--) {
        lcs[i][j] =
          a[i] === b[j]
            ? lcs[i + 1][j + 1] + 1
            : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
      }
    }
    const parts: { text: string; type: "same" | "add" | "del" }[] = [];
    let i = 0;
    let j = 0;
    while (i < a.length || j < b.length) {
      if (i < a.length && j < b.length && a[i] === b[j]) {
        parts.push({ text: a[i], type: "same" });
        i++;
        j++;
      } else if (
        j < b.length &&
        (i === a.length || lcs[i][j + 1] >= lcs[i + 1][j])
      ) {
        parts.push({ text: b[j], type: "add" });
        j++;
      } else {
        parts.push({ text: a[i], type: "del" });
        i++;
      }
    }
    return parts;
  }, [before, after]);

  const added = diff.filter((p) => p.type === "add" && p.text.trim()).length;
  const removed = diff.filter((p) => p.type === "del" && p.text.trim()).length;

  const selectVersion = (version: PromptVersion) => {
    setSelected(version.version);
    setText(version.template);
    setNote("");
  };

  const save = () => {
    const cleanName = name.trim() || prompt.name;
    const cleanDescription = description.trim();
    const tags = tagText
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    let versions = prompt.versions;

    if (templateChanged) {
      const entry: PromptVersion = {
        version: nextVersion,
        note:
          note.trim() ||
          (restoring ? `Restored ${selected}` : "Edited template"),
        author: "Jordan Davis",
        edited: "just now",
        age: 0,
        score: null,
        template: text,
      };
      // A brand-new prompt's empty v1 is filled in rather than kept as history.
      versions = current.template.trim()
        ? [entry, ...prompt.versions]
        : [{ ...entry, version: current.version }, ...prompt.versions.slice(1)];
    }

    upsertPrompt({
      ...prompt,
      name: cleanName,
      description: cleanDescription,
      tags,
      versions,
    });
    setSelected(versions[0].version);
    setName(cleanName);
    setDescription(cleanDescription);
    setTagText(tags.join(", "));
    setNote("");
    notify(
      templateChanged
        ? `${cleanName} saved as ${versions[0].version}`
        : "Prompt details saved",
    );
  };

  const copyTemplate = () =>
    navigator.clipboard
      .writeText(text)
      .then(() => notify(`${prompt.name} ${selected} copied`))
      .catch(() => notify("Clipboard is not available", "error"));

  const refineInRun = () => {
    updateDraft({ name: prompt.name, prompt: text, promptId: prompt.id });
    notify(`${prompt.name} ${selected} loaded into a new run`);
    router.push("/runs/new/prompt");
  };

  return (
    <div className='main-scroll detail-screen'>
      <Link className='back-link' href='/prompts'>
        ← Back to Prompts
      </Link>

      <div className='page-heading'>
        <div>
          <div className='eyebrow'>
            <span className='status-dot' /> PROMPT · {current.version}
          </div>
          <h1>{prompt.name}</h1>
          <p>{prompt.description}</p>
          {prompt.tags.length > 0 && (
            <div className='prompt-tags'>
              {prompt.tags.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          )}
        </div>
        <div className='heading-actions'>
          <button className='secondary-button' onClick={copyTemplate}>
            <Copy /> Copy
          </button>
          <button
            className='primary-button'
            onClick={refineInRun}
            disabled={!text.trim()}
          >
            <Play /> Refine in a new run
          </button>
        </div>
      </div>

      <div className='metrics-grid'>
        <div className='metric-card'>
          <span>Best score</span>
          <strong>{best ? `${best.score}%` : "—"}</strong>
          <small className='positive'>{best ? best.version : "untested"}</small>
        </div>
        <div className='metric-card'>
          <span>Versions</span>
          <strong>{prompt.versions.length}</strong>
          <small>latest {current.edited}</small>
        </div>
        <div className='metric-card'>
          <span>Linked runs</span>
          <strong>{linkedRuns.length}</strong>
          <small>
            {linkedRuns.filter((r) => r.status !== "complete").length} active
          </small>
        </div>
        <div className='metric-card'>
          <span>Est. tokens</span>
          <strong>~{tokens}</strong>
          <small>{variables.length} variables</small>
        </div>
      </div>

      <div className='detail-grid'>
        <div className='prompt-detail-column'>
          <section className='card detail-panel prompt-editor'>
            <div className='card-header'>
              <div>
                <h2>Template</h2>
                <p>
                  {selected === current.version
                    ? "Editing the current version."
                    : `Viewing ${selected}. Saving restores it as ${nextVersion}.`}
                </p>
              </div>
              <span
                className={`status-pill ${templateChanged ? "running" : ""}`}
              >
                {templateChanged ? "Unsaved" : selected}
              </span>
            </div>

            <label className='wizard-label'>
              Name
              <input
                className='wizard-input'
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className='wizard-label'>
              Description
              <input
                className='wizard-input'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <label className='wizard-label'>
              Tags
              <input
                className='wizard-input'
                placeholder='support, json'
                value={tagText}
                onChange={(e) => setTagText(e.target.value)}
              />
            </label>
            <label className='wizard-label'>
              Prompt
              <textarea
                className='wizard-input wizard-textarea'
                placeholder='Write the prompt. Use {{column}} to insert values from your dataset.'
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </label>

            <div className='variable-chips'>
              {variables.length ? (
                variables.map((v) => <code key={v}>{v}</code>)
              ) : (
                <small>
                  No variables yet. Add {"{{column}}"} to insert dataset values.
                </small>
              )}
            </div>

            {templateChanged && (
              <label className='wizard-label'>
                Change note
                <input
                  className='wizard-input'
                  placeholder='What did you change and why?'
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>
            )}

            <div className='prompt-editor-footer'>
              <span>
                {text.length} characters · ~{tokens} tokens
              </span>
              <button
                className='primary-button'
                disabled={!templateChanged && !detailsChanged}
                onClick={save}
              >
                {templateChanged
                  ? restoring
                    ? `Restore ${selected} as ${nextVersion}`
                    : `Save as ${nextVersion}`
                  : "Save details"}
              </button>
            </div>
          </section>

          <section className='card detail-panel'>
            <div className='card-header'>
              <div>
                <h2>{diffTitle}</h2>
                <p>
                  {showDiff
                    ? `+${added} words · −${removed} words`
                    : "There is no earlier version to compare with."}
                </p>
              </div>
            </div>
            <div className='prompt-diff'>
              {showDiff
                ? diff.map((part, k) =>
                    part.type === "add" ? (
                      <ins key={k}>{part.text}</ins>
                    ) : part.type === "del" ? (
                      <del key={k}>{part.text}</del>
                    ) : (
                      <span key={k}>{part.text}</span>
                    ),
                  )
                : after || "This version is empty."}
            </div>
          </section>
        </div>

        <div className='prompt-detail-column'>
          <section className='card detail-panel'>
            <div className='card-header'>
              <div>
                <h2>Version history</h2>
                <p>Select a version to view, compare or restore it.</p>
              </div>
            </div>
            <div className='version-list'>
              {prompt.versions.map((v, i) => (
                <button
                  key={v.version}
                  className={`version-row ${v.version === selected ? "selected" : ""}`}
                  onClick={() => selectVersion(v)}
                >
                  <span className='version-tag'>{v.version}</span>
                  <span>
                    <strong>
                      {v.note}
                      {i === 0 && <span className='model-badge'>Current</span>}
                    </strong>
                    <small>
                      {v.author} · {v.edited}
                    </small>
                  </span>
                  <span
                    className={`status-pill ${v.score === null ? "running" : ""}`}
                  >
                    {v.score === null ? "Untested" : `${v.score}%`}
                  </span>
                </button>
              ))}
            </div>
            <div className='version-chart' aria-label='Score per version'>
              {[...prompt.versions].reverse().map((v) => (
                <span key={v.version}>
                  <i
                    className={v.score === null ? "untested" : ""}
                    style={{
                      height: `${v.score === null ? 6 : Math.max(8, ((v.score - 70) / 30) * 100)}%`,
                    }}
                  />
                  <small>{v.version}</small>
                </span>
              ))}
            </div>
          </section>

          <section className='card detail-panel'>
            <div className='card-header'>
              <div>
                <h2>Linked runs</h2>
                <p>Runs that refined or evaluated this prompt.</p>
              </div>
            </div>
            {linkedRuns.length ? (
              linkedRuns.map((run) => (
                <Link
                  className='list-row'
                  key={run.id}
                  href={`/runs/${run.id}`}
                >
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
                      · judged by {run.judges.join(" + ")}
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
              ))
            ) : (
              <div className='empty-state'>
                No runs yet. Refine this prompt in a new run to see how it
                scores.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
