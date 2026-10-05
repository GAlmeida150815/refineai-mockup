"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertTriangle, Check } from "lucide-react";
import {
  initialPrompts,
  initialRuns,
  models,
  type Prompt,
  type Run,
} from "@/lib/mock-data";
import { ActionModal } from "./ActionModal";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export type RunDraft = {
  name: string;
  prompt: string;
  dataset: string;
  promptId?: string;
  judges: string[];
  datasetColumns: number;
  selectedModels: string[];
  sourceExamples: number;
  executionsPerModel: number;
  humanReview: boolean;
  reviewLoops: number;
};

type AppContextValue = {
  dark: boolean;
  toggleTheme: () => void;
  team: string;
  setTeam: (team: string) => void;
  notify: (message: string, tone?: "success" | "error") => void;
  modal: string;
  prompts: Prompt[];
  upsertPrompt: (prompt: Prompt) => void;
  openModal: (modal: string) => void;
  closeModal: () => void;
  runs: Run[];
  addRun: (run: Run) => void;
  updateRun: (id: string, patch: Partial<Run>) => void;
  draft: RunDraft;
  updateDraft: (patch: Partial<RunDraft>) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppShell>");
  return ctx;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(true);
  const [team, setTeam] = useState("Acme Research");
  const [toast, setToast] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);
  const [modal, setModal] = useState("");
  const [runs, setRuns] = useState<Run[]>(initialRuns);
  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts);
  const [draft, setDraft] = useState<RunDraft>({
    name: "Support ticket triage",
    prompt:
      "Classify each support ticket by urgency and route it to the right team. Return a JSON object with urgency, team, and a concise reason.",
    dataset: "Support tickets v3.csv",
    datasetColumns: 4,
    judges: ["Jev"],
    selectedModels: ["GPT-4o", "Claude 3.5 Sonnet", "GPT-4o-mini"],
    sourceExamples: 2400,
    executionsPerModel: 2400,
    humanReview: true,
    reviewLoops: 2,
  });
  const toastTimer = useRef<number | undefined>(undefined);
  const runsRef = useRef(runs);

  const notify = (message: string, tone: "success" | "error" = "success") => {
    setToast({ message, tone });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  };

  useEffect(() => {
    try {
      if (localStorage.getItem("refineai-theme") === "light") setDark(false);
    } catch {}
  }, []);

  useEffect(() => {
    runsRef.current = runs;
  }, [runs]);

  // Mock run engine: when a pass's time is up, pause for a human decision
  // (if loops remain) or complete the run.
  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = Date.now();
      const due = runsRef.current.filter(
        (run) => run.status === "running" && run.phaseEndsAt <= now,
      );
      if (!due.length) return;

      const needsDecision = (run: Run) =>
        run.humanReview && run.decisions.length < run.loops;
      const dueIds = new Set(due.map((run) => run.id));

      setRuns((cur) =>
        cur.map((run) => {
          if (!dueIds.has(run.id) || run.status !== "running") return run;
          if (needsDecision(run)) return { ...run, status: "review" };

          const lastChoices = run.decisions.at(-1)?.choices ?? {};
          const scores = run.models.map(
            (name) =>
              lastChoices[name]?.score ??
              parseFloat(models.find((m) => m.name === name)?.accuracy ?? "0"),
          );
          const cost = run.models.reduce(
            (sum, name) =>
              sum +
              parseFloat(
                (models.find((m) => m.name === name)?.cost ?? "$0").slice(1),
              ),
            0,
          );
          return {
            ...run,
            status: "complete",
            accuracy: `${Math.max(...scores).toFixed(1)}%`,
            cost: `$${cost.toFixed(2)}`,
            latency: "1.42s",
            completedLabel: "Completed just now",
          };
        }),
      );

      due.forEach((run) =>
        notify(
          needsDecision(run)
            ? `${run.name} is waiting for your decision in Runs`
            : `${run.name} completed`,
        ),
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    try {
      localStorage.setItem("refineai-theme", next ? "dark" : "light");
    } catch {}
    notify(next ? "Black mode enabled" : "Light mode enabled");
  };

  return (
    <AppContext.Provider
      value={{
        dark,
        toggleTheme,
        team,
        setTeam,
        notify,
        modal,
        openModal: setModal,
        closeModal: () => setModal(""),
        runs,
        addRun: (run) => setRuns((cur) => [...cur, run]),
        updateRun: (id, patch) =>
          setRuns((cur) =>
            cur.map((run) => (run.id === id ? { ...run, ...patch } : run)),
          ),
        draft,
        updateDraft: (patch) => setDraft((cur) => ({ ...cur, ...patch })),
        prompts,
        upsertPrompt: (prompt) =>
          setPrompts((cur) =>
            cur.some((p) => p.id === prompt.id)
              ? cur.map((p) => (p.id === prompt.id ? prompt : p))
              : [prompt, ...cur],
          ),
      }}
    >
      <main className={dark ? "app-shell dark-mode" : "app-shell"}>
        <Sidebar />
        <section className='content-area'>
          <Topbar />
          {children}
        </section>

        {toast && (
          <div
            className={`toast ${toast.tone === "error" ? "error" : ""}`}
            role='status'
          >
            {toast.tone === "error" ? <AlertTriangle /> : <Check />}{" "}
            {toast.message}
          </div>
        )}

        {modal && <ActionModal />}
      </main>
    </AppContext.Provider>
  );
}
