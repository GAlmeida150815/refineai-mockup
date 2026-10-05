// src/components/Team.tsx
"use client";

import { MoreHorizontal } from "lucide-react";
import { useApp } from "@/components/shell/AppShell";
import { teamMembers } from "@/lib/mock-data";

export function Team() {
  const { notify, openModal } = useApp();

  return (
    <div className='main-scroll'>
      <div className='page-heading'>
        <div>
          <div className='eyebrow'>
            <span className='status-dot' /> WORKSPACE MEMBERS
          </div>
          <h1>Team</h1>
          <p>
            Invite collaborators and manage who can run or review experiments.
          </p>
        </div>
        <button
          className='primary-button'
          onClick={() => openModal("Invite member")}
        >
          Invite member
        </button>
      </div>

      <section className='card table-card'>
        {teamMembers.map((member) => (
          <button
            className='list-row'
            key={member.email}
            onClick={() => notify(`${member.name} profile opened`)}
          >
            <span className='user-avatar'>
              {member.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
            <span>
              <strong>{member.name}</strong>
              <small>{member.email}</small>
            </span>
            <span className='role-pill'>{member.role}</span>
            <MoreHorizontal />
          </button>
        ))}
      </section>
    </div>
  );
}
