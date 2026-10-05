// src/components/Settings.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/shell/AppShell";

const tabs = [
  { slug: "general", label: "General" },
  { slug: "providers", label: "Model providers" },
  { slug: "billing", label: "Billing & plan" },
  { slug: "notifications", label: "Notifications" },
];

export function Settings({ tab }: { tab: string }) {
  const router = useRouter();
  const { team, setTeam, notify, openModal } = useApp();
  const [workspaceName, setWorkspaceName] = useState(team);
  const current = tabs.find((t) => t.slug === tab) ?? tabs[0];

  return (
    <div className='main-scroll'>
      <div className='page-heading'>
        <div>
          <div className='eyebrow'>
            <span className='status-dot' /> WORKSPACE SETTINGS
          </div>
          <h1>{current.label}</h1>
          <p>Configure your refineAI workspace.</p>
        </div>
      </div>

      <div className='settings-layout'>
        <nav className='settings-nav'>
          {tabs.map((item) => (
            <button
              key={item.slug}
              className={current.slug === item.slug ? "active" : ""}
              onClick={() =>
                router.replace(`/settings?tab=${item.slug}`, { scroll: false })
              }
            >
              {item.label}
            </button>
          ))}
        </nav>

        <section className='card settings-card'>
          {current.slug === "providers" ? (
            <>
              <h2>Model providers</h2>
              <p>
                Connect providers once. Keys are encrypted and never exposed in
                experiment results.
              </p>
              {["OpenAI", "Anthropic", "Google"].map((provider, i) => (
                <div className='provider-row' key={provider}>
                  <span className='model-orb'>{provider[0]}</span>
                  <span>
                    <strong>{provider}</strong>
                    <small>
                      {i < 2 ? "Connected ·••••••••7f2a" : "Not connected"}
                    </small>
                  </span>
                  <button
                    onClick={() => openModal(`${provider} API key`)}
                    className={i < 2 ? "secondary-button" : "primary-button"}
                  >
                    {i < 2 ? "Edit key" : "Connect"}
                  </button>
                </div>
              ))}
            </>
          ) : current.slug === "billing" ? (
            <>
              <h2>Growth plan</h2>
              <p>10M included tokens · renews on October 4, 2026.</p>
              <div className='plan-summary'>
                <strong>
                  $199<span>/month</span>
                </strong>
                <small>4.8M tokens used · 48%</small>
              </div>
              <button
                className='secondary-button'
                onClick={() => openModal("Manage plan")}
              >
                Manage plan
              </button>
            </>
          ) : current.slug === "notifications" ? (
            <>
              <h2>Notifications</h2>
              <p>Choose what refineAI sends to your inbox.</p>
              {[
                "Experiment completed",
                "Weekly usage summary",
                "Team activity",
              ].map((item) => (
                <label className='toggle-row' key={item}>
                  <span>
                    <strong>{item}</strong>
                    <small>Receive updates for {item.toLowerCase()}.</small>
                  </span>
                  <input
                    type='checkbox'
                    defaultChecked
                    onChange={(e) =>
                      notify(
                        `${item} ${e.target.checked ? "enabled" : "disabled"}`,
                      )
                    }
                  />
                </label>
              ))}
            </>
          ) : (
            <>
              <h2>General settings</h2>
              <p>Workspace defaults and billing transparency.</p>
              <div className='setting-block'>
                <label>Workspace name</label>
                <input
                  className='modal-input'
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                />
              </div>
              <div className='setting-block'>
                <label>Default experiment markup</label>
                <div className='markup-control'>
                  <span>10% platform fee</span>
                  <strong>Included in estimates</strong>
                </div>
                <small>
                  refineAI transparently adds a 10% fee to underlying model
                  costs.
                </small>
              </div>
              <button
                className='primary-button'
                onClick={() => {
                  setTeam(workspaceName.trim() || team);
                  notify("General settings saved");
                }}
              >
                Save changes
              </button>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
