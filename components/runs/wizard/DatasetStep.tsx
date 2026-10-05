"use client";

import { Check, Database, Upload } from "lucide-react";
import { useApp } from "@/components/shell/AppShell";
import { datasets, type Dataset } from "@/lib/mock-data";

export function DatasetStep() {
  const { draft, updateDraft, notify } = useApp();
  const selected = datasets.find((d) => `${d.name}.csv` === draft.dataset);

  const chooseDataset = (dataset: Dataset) =>
    updateDraft({
      dataset: `${dataset.name}.csv`,
      sourceExamples: dataset.examples,
      datasetColumns: dataset.columns.length,
    });

  const uploadCsv = async (file: File | undefined) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      notify("Only CSV files are supported", "error");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      notify("CSV must be 50 MB or smaller", "error");
      return;
    }
    const lines = (await file.text()).trim().split(/\r?\n/);
    updateDraft({
      dataset: file.name,
      sourceExamples: Math.max(lines.length - 1, 0),
      datasetColumns: lines[0]?.split(",").length ?? 0,
    });
    notify(`${file.name} uploaded`);
  };

  return (
    <>
      <h1>Choose your dataset</h1>
      <p className='wizard-description'>
        Use a CSV file only. Pick an existing dataset from your library or
        upload a new one.
      </p>

      <div className='dataset-source-grid'>
        <button
          className={`dataset-source-card ${selected ? "selected" : ""}`}
          onClick={() => !selected && chooseDataset(datasets[0])}
        >
          <span className='dataset-source-icon'>
            <Database />
          </span>
          <span>
            <strong>Choose from library</strong>
            <small>
              {selected
                ? `${selected.name}.csv selected`
                : `${datasets.length} datasets available`}
            </small>
          </span>
          <Check />
        </button>
        <label
          className={`dataset-source-card upload-card ${selected ? "" : "selected"}`}
        >
          <span className='dataset-source-icon'>
            <Upload />
          </span>
          <span>
            <strong>Upload CSV</strong>
            <small>
              {selected
                ? "CSV files only · max 50 MB"
                : `${draft.dataset} · ${draft.sourceExamples.toLocaleString("en-US")} rows`}
            </small>
          </span>
          <input
            type='file'
            accept='.csv,text/csv'
            onChange={(e) => uploadCsv(e.target.files?.[0])}
          />
        </label>
      </div>

      {selected && (
        <div
          className='library-picker'
          role='radiogroup'
          aria-label='Library datasets'
        >
          {datasets.map((dataset) => {
            const isSelected = dataset.id === selected.id;
            return (
              <button
                type='button'
                role='radio'
                aria-checked={isSelected}
                className={`library-option ${isSelected ? "selected" : ""}`}
                key={dataset.id}
                onClick={() => chooseDataset(dataset)}
              >
                <span className='library-option-radio' />
                <span className='library-option-main'>
                  <strong>{dataset.name}.csv</strong>
                  <small>
                    {dataset.examples.toLocaleString("en-US")} rows ·{" "}
                    {dataset.size} · updated {dataset.updated}
                  </small>
                </span>
                <span className='library-option-columns'>
                  {dataset.columns.map((column) => (
                    <code key={column}>{column}</code>
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className='library-add-row'>
        <span>
          <strong>Add uploads to your library</strong>
          <small>Save this CSV for future runs.</small>
        </span>
        <input
          type='checkbox'
          defaultChecked
          onChange={(e) =>
            notify(
              e.target.checked
                ? "Dataset will be saved to library"
                : "Dataset will not be saved",
            )
          }
        />
      </div>
    </>
  );
}
