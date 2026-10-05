"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, PlugZap } from "lucide-react";
import { useApp } from "@/components/shell/AppShell";
import { models, type Model } from "@/lib/mock-data";

export function Models() {
  const router = useRouter();
  const { notify, openModal } = useApp();
  const [testing, setTesting] = useState<string[]>([]);
  const [results, setResults] = useState<
    Record<string, { ok: boolean; ms: number }>
  >({});
  const [updatedKeys, setUpdatedKeys] = useState<string[]>([]);

  const testConnection = (model: Model) => {
    setTesting((cur) => [...cur, model.name]);
    const ms = Math.round(model.latencyMs * (0.85 + Math.random() * 0.3));
    const ok = model.keyValid || updatedKeys.includes(model.provider);

    window.setTimeout(() => {
      setTesting((cur) => cur.filter((name) => name !== model.name));
      setResults((cur) => ({ ...cur, [model.name]: { ok, ms } }));
      notify(
        ok
          ? `${model.name} is reachable · responded in ${ms} ms`
          : `${model.name} failed: ${model.provider} rejected the API key (401)`,
        ok ? "success" : "error",
      );
    }, 900 + ms);
  };

  return (
    <div className='main-scroll'>
      <div className='page-heading'>
        <div>
          <div className='eyebrow'>
            <span className='status-dot' /> MODEL CATALOG
          </div>
          <h1>Models</h1>
          <p>
            Connect providers once, then compare quality, speed, and cost across
            every run.
          </p>
        </div>
        <button
          className='primary-button'
          onClick={() => {
            openModal("Connect model");
            router.push("/settings?tab=providers");
          }}
        >
          Connect model
        </button>
      </div>

      <section className='model-grid'>
        {models.map((model) => {
          const result = results[model.name];
          const isTesting = testing.includes(model.name);
          return (
            <article className='model-card' key={model.name}>
              <div className='model-card-head'>
                <span className='model-orb'>{model.name[0]}</span>
                <span
                  className={`status-pill ${isTesting ? "running" : result && !result.ok ? "error" : ""}`}
                >
                  {isTesting
                    ? "Testing…"
                    : !result
                      ? "Connected"
                      : result.ok
                        ? `OK · ${result.ms} ms`
                        : "Connection failed"}
                </span>
              </div>
              <h3>{model.name}</h3>
              <p>
                {model.provider}
                {model.kind === "classifier"
                  ? " · classification model · default judge"
                  : ""}
              </p>
              <div className='model-stats'>
                <span>
                  <small>Accuracy</small>
                  <strong>{model.accuracy}</strong>
                </span>
                <span>
                  <small>Cost / 1k</small>
                  <strong>{model.cost}</strong>
                </span>
              </div>
              <button
                className={`model-action ${isTesting ? "testing" : ""}`}
                disabled={isTesting}
                onClick={() => testConnection(model)}
              >
                {isTesting ? <Loader2 /> : <PlugZap />}{" "}
                {isTesting ? "Testing connection…" : "Test connection"}
              </button>
              {result && !result.ok && (
                <button
                  className='card-link'
                  onClick={() => {
                    setUpdatedKeys((cur) => [...cur, model.provider]);
                    openModal(`${model.provider} API key`);
                  }}
                >
                  <KeyRound /> Update {model.provider} API key
                </button>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
