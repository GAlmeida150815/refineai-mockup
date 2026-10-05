"use client";

import { useApp } from "@/components/shell/AppShell";

export function PromptStep() {
  const { draft, updateDraft } = useApp();

  return (
    <>
      <h1>What should the models do?</h1>
      <p className='wizard-description'>
        Write the prompt you want to refine. Each loop, the judges propose
        improvements and you choose which ones each model keeps.
      </p>
      <label className='wizard-label'>
        Run name
        <input
          className='wizard-input'
          value={draft.name}
          onChange={(e) => updateDraft({ name: e.target.value })}
        />
      </label>
      <label className='wizard-label'>
        Prompt
        <textarea
          className='wizard-input wizard-textarea'
          value={draft.prompt}
          onChange={(e) => updateDraft({ prompt: e.target.value })}
        />
      </label>
    </>
  );
}
