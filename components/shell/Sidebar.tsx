"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Beaker,
  Database,
  FileText,
  Sparkles,
  Users,
  BarChart3,
  Settings2,
  GitBranch,
  ChevronDown,
  Sun,
  Moon,
  MoreHorizontal,
  X,
} from "lucide-react";
import { useApp } from "./AppShell";

const navItems = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Runs", href: "/runs", icon: Beaker },
  { label: "Datasets", href: "/datasets", icon: Database },
  { label: "Prompts", href: "/prompts", icon: FileText },
  { label: "Models", href: "/models", icon: Sparkles },
];

const manageItems = [
  { label: "Team", href: "/team", icon: Users },
  { label: "Usage", href: "/usage", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { dark, toggleTheme, team, openModal, runs, navOpen, setNavOpen } =
    useApp();
  const reviewCount = runs.filter((run) => run.status === "review").length;

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside
      className={`sidebar ${navOpen ? "open" : ""}`}
      aria-label='Main navigation'
    >
      <div className='brand'>
        <span className='brand-mark'>
          <GitBranch />
        </span>
        <a href='/' className='brand-name'>
          refine<span className='brand-accent'>AI</span>
        </a>
        <button
          className='icon-button sidebar-close'
          aria-label='Close navigation'
          onClick={() => setNavOpen(false)}
        >
          <X />
        </button>
      </div>

      <button
        className='workspace-switcher'
        onClick={() => openModal("team")}
        title={team}
      >
        <span className='workspace-avatar'>{team[0]}</span>
        <span className='workspace-name'>{team}</span>
        <ChevronDown />
      </button>

      <nav className='primary-nav'>
        <p className='nav-label'>Workspace</p>
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            title={label}
            className={`nav-item ${isActive(href) ? "active" : ""}`}
            aria-current={isActive(href) ? "page" : undefined}
          >
            <Icon />
            <span>{label}</span>
            {href === "/runs" && (
              <em
                className={reviewCount ? "attention" : undefined}
                title={
                  reviewCount
                    ? `${reviewCount} run(s) waiting for your decision`
                    : undefined
                }
              >
                {reviewCount || runs.length}
              </em>
            )}
          </Link>
        ))}

        <p className='nav-label nav-label-spaced'>Manage</p>
        {manageItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            title={label}
            className={`nav-item ${isActive(href) ? "active" : ""}`}
            aria-current={isActive(href) ? "page" : undefined}
          >
            <Icon />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className='sidebar-bottom'>
        <button
          className='nav-item'
          onClick={toggleTheme}
          title={dark ? "Light mode" : "Black mode"}
        >
          {dark ? <Sun /> : <Moon />}
          <span>{dark ? "Light mode" : "Black mode"}</span>
        </button>
        <div className='user-chip' onClick={() => openModal("profile")}>
          <div className='user-avatar'>JD</div>
          <div>
            <strong>Jordan Davis</strong>
            <span>Admin</span>
          </div>
          <MoreHorizontal />
        </div>
      </div>
    </aside>
  );
}
