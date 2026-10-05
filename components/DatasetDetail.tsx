"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/shell/AppShell";
import type { Dataset } from "@/lib/mock-data";

const pageSize = 4;

export function DatasetDetail({ dataset }: { dataset: Dataset }) {
  const router = useRouter();
  const { notify, updateDraft } = useApp();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sortCol, setSortCol] = useState(0);
  const [ascending, setAscending] = useState(true);

  const filtered = dataset.rows.filter((row) =>
    row.some((cell) => cell.toLowerCase().includes(query.toLowerCase())),
  );
  const sorted = [...filtered].sort(
    (a, b) => (ascending ? 1 : -1) * a[sortCol].localeCompare(b[sortCol]),
  );
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageRows = sorted.slice(start, start + pageSize);

  const sort = (col: number) => {
    if (col === sortCol) setAscending(!ascending);
    else {
      setSortCol(col);
      setAscending(true);
    }
  };

  const startRunWithDataset = () => {
    updateDraft({
      dataset: `${dataset.name}.csv`,
      sourceExamples: dataset.examples,
      datasetColumns: dataset.columns.length,
    });
    notify(`${dataset.name} selected for the next run`);
    router.push("/runs/new/dataset");
  };

  return (
    <div className='main-scroll detail-screen'>
      <Link className='back-link' href='/datasets'>
        ← Back to Datasets
      </Link>

      <div className='page-heading'>
        <div>
          <div className='eyebrow'>
            <span className='status-dot' /> DATASET
          </div>
          <h1>{dataset.name}</h1>
          <p>CSV dataset with coverage, freshness, and provenance.</p>
        </div>
        <div className='heading-actions'>
          <button className='primary-button' onClick={startRunWithDataset}>
            Use in new run
          </button>
        </div>
      </div>

      <section className='card table-card'>
        <div className='card-header'>
          <div>
            <h2>CSV preview</h2>
            <p>Sort columns and move through the dataset rows.</p>
          </div>
          <span className='status-pill'>
            CSV · {dataset.examples.toLocaleString("en-US")} rows
          </span>
        </div>

        <div className='table-toolbar'>
          <input
            className='table-search'
            placeholder='Filter rows...'
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
          <span>
            Rows {sorted.length ? start + 1 : 0}–{start + pageRows.length} of{" "}
            {sorted.length} preview rows
          </span>
        </div>

        <table className='csv-table'>
          <thead>
            <tr>
              {dataset.columns.map((column, i) => (
                <th key={column}>
                  <button onClick={() => sort(i)}>
                    {column}{" "}
                    <span>{sortCol === i ? (ascending ? "↑" : "↓") : "↕"}</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length ? (
              pageRows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, i) => (
                    <td key={i}>{cell}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={dataset.columns.length}>
                  <div className='empty-state'>No rows match this filter.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className='table-pagination'>
          <button
            className='secondary-button'
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <span>
            Page {page} of {pageCount}
          </span>
          <button
            className='secondary-button'
            disabled={page === pageCount}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
}
