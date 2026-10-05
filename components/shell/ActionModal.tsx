"use client";

import { useEffect } from "react";
import { Check, Upload, X } from "lucide-react";
import { teams } from "@/lib/mock-data";
import { useApp } from "./AppShell";

export function ActionModal() {
  const { modal, closeModal, notify, team, setTeam } = useApp();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeModal]);

  return (
    <div className='modal-backdrop' onClick={closeModal}>
      <div className='modal-card' onClick={(e) => e.stopPropagation()}>
        <button className='modal-close' onClick={closeModal}>
          <X />
        </button>
        <div className='eyebrow'>
          <span className='status-dot' /> QUICK ACTION
        </div>
        <h2>{modal === "profile" ? "Jordan Davis" : modal}</h2>
        <p>
          {modal === "profile"
            ? `Admin · ${team}`
            : modal === "team"
              ? "Select the team workspace for global models and usage."
              : "Complete this step to update your workspace."}
        </p>

        {modal === "team" && (
          <div className='team-options'>
            {teams.map((item) => (
              <button
                className={`team-option ${team === item ? "selected" : ""}`}
                key={item}
                onClick={() => {
                  setTeam(item);
                  closeModal();
                  notify(`${item} selected`);
                }}
              >
                <span className='workspace-avatar'>{item[0]}</span>
                <strong>{item}</strong>
                <Check />
              </button>
            ))}
          </div>
        )}

        {modal === "Create prompt" && (
          <textarea
            className='modal-input'
            placeholder='Write a reusable prompt...'
            autoFocus
          />
        )}

        {modal === "Create dataset" && (
          <>
            <input
              className='modal-input'
              placeholder='Dataset name'
              autoFocus
            />
            <button
              className='secondary-button modal-upload'
              onClick={() => notify("File selected")}
            >
              <Upload /> Choose file
            </button>
          </>
        )}

        {(modal === "Connect model" || modal.includes("API key")) && (
          <>
            <input
              className='modal-input'
              placeholder={
                modal.includes("API key")
                  ? `${modal.replace(" API key", "")} API key`
                  : "Provider API key"
              }
              type='password'
              autoFocus
            />
            {modal === "Connect model" && (
              <input
                className='modal-input'
                placeholder='Model ID, e.g. gpt-4o-mini'
              />
            )}
          </>
        )}

        {modal === "Invite member" && (
          <input
            className='modal-input'
            placeholder='teammate@company.com'
            autoFocus
          />
        )}

        {modal === "Manage plan" && (
          <div className='plan-options'>
            <button
              className='plan-option'
              onClick={() => notify("Growth plan selected")}
            >
              <strong>Growth</strong>
              <span>10M tokens · $199/mo</span>
            </button>
            <button
              className='plan-option'
              onClick={() => notify("Scale plan selected")}
            >
              <strong>Scale</strong>
              <span>50M tokens · $699/mo</span>
            </button>
          </div>
        )}

        <button
          className='primary-button'
          onClick={() => {
            closeModal();
            notify(
              modal === "profile" ? "Profile saved" : `${modal} completed`,
            );
          }}
        >
          {modal === "profile" ? "Save changes" : "Continue"}
        </button>
      </div>
    </div>
  );
}
