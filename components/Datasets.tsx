"use client";

import Link from "next/link";
import {
  Database,
  Download,
  Upload,
  MoreHorizontal,
  ArrowUpRight,
} from "lucide-react";
import { useApp } from "@/components/shell/AppShell";
import { datasets } from "@/lib/mock-data";

export function Datasets() {
  const { notify, openModal } = useApp();

  const downloadExamples = () => {
    // An empty ZIP is just the 22-byte "end of central directory" record:
    // its signature (PK\x05\x06) followed by 18 zero bytes.
    const emptyZip = new Uint8Array(22);
    emptyZip.set([0x50, 0x4b, 0x05, 0x06]);

    const url = URL.createObjectURL(
      new Blob([emptyZip], { type: "application/zip" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "refineai-example-datasets.zip";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    notify("Example datasets downloaded");
  };

  return (
    <div className='main-scroll'>
      <div className='page-heading'>
        <div>
          <div className='eyebrow'>
            <span className='status-dot' /> SOURCE OF TRUTH
          </div>
          <h1>Datasets</h1>
          <p>
            Curate reliable evaluation sets with coverage, freshness, and
            provenance in one place.
          </p>
        </div>
        <div className='heading-actions'>
          <button className='secondary-button' onClick={downloadExamples}>
            <Download /> Download examples
          </button>
          <button
            className='primary-button'
            onClick={() => openModal("Create dataset")}
          >
            New dataset
          </button>
        </div>
      </div>

      <section className='dataset-grid'>
        {datasets.map((dataset) => (
          <article className='data-card' key={dataset.id}>
            <div className='data-card-top'>
              <span className='data-icon'>
                <Database />
              </span>
              <button
                className='icon-button'
                onClick={() => notify(`${dataset.name} menu opened`)}
              >
                <MoreHorizontal />
              </button>
            </div>
            <h3>{dataset.name}</h3>
            <p>CSV · {dataset.size}</p>
            <div className='data-card-bottom'>
              <strong>
                {dataset.examples.toLocaleString("en-US")} examples
              </strong>
              <span>Updated {dataset.updated}</span>
            </div>
            <Link className='card-link' href={`/datasets/${dataset.id}`}>
              Open dataset <ArrowUpRight />
            </Link>
          </article>
        ))}
      </section>

      <button
        className='dropzone'
        onClick={() => openModal("Create dataset")}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (!file) return;
          if (!file.name.toLowerCase().endsWith(".csv")) {
            notify("Only CSV files are supported", "error");
            return;
          }
          notify(`${file.name} ready to import`);
          openModal("Create dataset");
        }}
      >
        <Upload />
        <strong>Drop a file to add a dataset</strong>
        <span>CSV only · max 50 MB</span>
      </button>
    </div>
  );
}
