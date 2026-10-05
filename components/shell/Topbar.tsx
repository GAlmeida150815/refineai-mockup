"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp, Menu, Search } from "lucide-react";
import { datasets } from "@/lib/mock-data";
import { useApp } from "./AppShell";

const sectionLabels: Record<string, string> = {
  runs: "Runs",
  datasets: "Datasets",
  prompts: "Prompts",
  models: "Models",
  team: "Team",
  usage: "Usage",
  settings: "Settings",
};

export function Topbar() {
  const pathname = usePathname();
  const { team, notify, openModal, runs, prompts, setNavOpen } = useApp();
  const [section, id] = pathname.split("/").filter(Boolean);

  const crumbs: { label: string; href?: string }[] = [
    {
      label: section ? (sectionLabels[section] ?? section) : "Overview",
      href: id ? `/${section}` : undefined,
    },
  ];

  if (id) {
    const items: { id: string; name: string }[] =
      section === "runs"
        ? runs
        : section === "datasets"
          ? datasets
          : section === "prompts"
            ? prompts
            : [];
    const name =
      section === "runs" && id === "new"
        ? "New run"
        : items.find((item) => item.id === id)?.name;
    crumbs.push({ label: name ?? decodeURIComponent(id).replace(/-/g, " ") });
  }

  return (
    <header className='topbar'>
      <div className='topbar-left'>
        <button
          className='icon-button menu-button'
          aria-label='Open navigation'
          onClick={() => setNavOpen(true)}
        >
          <Menu />
        </button>
        <div className='breadcrumbs'>
          <span>{team}</span>
          {crumbs.map((crumb) => (
            <Fragment key={crumb.label}>
              <span>/</span>
              {crumb.href ? (
                <span>
                  <Link href={crumb.href}>{crumb.label}</Link>
                </span>
              ) : (
                <strong>{crumb.label}</strong>
              )}
            </Fragment>
          ))}
        </div>
        <div className='top-actions'>
          <button
            className='icon-button'
            aria-label='Help'
            onClick={() => notify("Help center opened")}
          >
            <CircleHelp />
          </button>
          <button
            className='icon-button'
            aria-label='Search'
            onClick={() => notify("Search is ready")}
          >
            <Search />
          </button>
          <div className='online-dot' />
          <span className='saved-label'>All changes saved</span>
          <button className='avatar-stack' onClick={() => openModal("profile")}>
            JD
          </button>
        </div>
      </div>
    </header>
  );
}
