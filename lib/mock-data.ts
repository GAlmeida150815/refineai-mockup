export const MOCK_PASS_MS = 12_000;

export type RunStatus = "running" | "review" | "complete";

export type PromptChoice = {
  strategyId: string;
  label: string;
  addition: string;
  prompt: string;
  score: number;
};

export type Run = {
  id: string;
  name: string;
  status: RunStatus;
  accuracy: string;
  cost: string;
  latency: string;
  completedLabel: string;
  order: number;
  dataset: string;
  judges: string[];
  promptVersion: string;
  models: string[];
  examples: number;
  humanReview: boolean;
  loops: number;
  basePrompt: string;
  modelPrompts: Record<string, string>;
  decisions: { iteration: number; choices: Record<string, PromptChoice> }[];
  phaseStartedAt: number;
  phaseEndsAt: number;
};

const finished = {
  status: "complete" as const,
  humanReview: false,
  loops: 1,
  modelPrompts: {},
  decisions: [],
  phaseStartedAt: 0,
  phaseEndsAt: 0,
};

export const initialRuns: Run[] = [
  {
    id: "invoice-extraction-benchmark",
    name: "Invoice extraction benchmark",
    status: "review",
    accuracy: "—",
    cost: "—",
    latency: "—",
    completedLabel: "",
    order: 5,
    dataset: "Invoices Q3.csv",
    promptVersion: "Prompt v1",
    judges: ["Jev", "GPT-4o"],
    models: ["GPT-4o", "Claude 3.5 Sonnet"],
    examples: 1200,
    humanReview: true,
    loops: 2,
    basePrompt:
      "Extract the vendor, invoice number, total and due date from the invoice text. Return a JSON object with those four keys.",
    modelPrompts: {},
    decisions: [],
    phaseStartedAt: 0,
    phaseEndsAt: 0,
  },
  {
    ...finished,
    id: "support-ticket-triage",
    name: "Support ticket triage",
    accuracy: "94.8%",
    cost: "$0.42",
    judges: ["Jev"],
    latency: "1.42s",
    completedLabel: "Completed 1h ago",
    order: 4,
    dataset: "Support tickets v3.csv",
    promptVersion: "Prompt v4",
    models: ["GPT-4o", "Claude 3.5 Sonnet", "GPT-4o-mini"],
    examples: 2400,
    basePrompt:
      "Classify each support ticket by urgency and route it to the right team. Return a JSON object with urgency, team, and a concise reason.",
  },
  {
    ...finished,
    id: "product-review-classifier",
    name: "Product review classifier",
    accuracy: "89.2%",
    cost: "$0.31",
    latency: "1.87s",
    judges: ["Jev"],
    completedLabel: "Completed yesterday",
    order: 3,
    dataset: "Product feedback — Q2.csv",
    promptVersion: "Prompt v2",
    models: ["GPT-4o", "GPT-4o-mini"],
    examples: 1120,
    basePrompt:
      "Label each product review as positive, negative or neutral and name the product area it is about.",
  },
  {
    ...finished,
    id: "sales-call-summary",
    name: "Sales call summary",
    accuracy: "92.1%",
    judges: ["GPT-4o"],
    cost: "$0.18",
    latency: "0.92s",
    completedLabel: "Completed 3d ago",
    order: 2,
    dataset: "Sales call transcripts.csv",
    promptVersion: "Prompt v3",
    models: ["Claude 3.5 Sonnet", "GPT-4o-mini"],
    examples: 640,
    basePrompt:
      "Summarize the sales call in three bullet points: customer need, objections, and agreed next step.",
  },
  {
    ...finished,
    id: "rag-answer-quality",
    name: "RAG answer quality",
    accuracy: "87.6%",
    cost: "$0.27",
    latency: "2.14s",
    judges: ["Claude 3.5 Sonnet"],
    completedLabel: "Completed last week",
    order: 1,
    dataset: "Knowledge base questions.csv",
    promptVersion: "Prompt v7",
    models: ["GPT-4o", "Claude 3.5 Sonnet", "Llama 3.1 70B"],
    examples: 840,
    basePrompt:
      "Answer the question using only the retrieved passages and cite the source file for every claim.",
  },
];

export type Dataset = {
  id: string;
  name: string;
  examples: number;
  size: string;
  updated: string;
  columns: string[];
  rows: string[][];
};

export type PromptVersion = {
  version: string;
  note: string;
  author: string;
  edited: string;
  age: number; // hours since the edit, used for sorting
  score: number | null;
  template: string;
};

export type Prompt = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  runIds: string[];
  versions: PromptVersion[]; // newest first
};

export const initialPrompts: Prompt[] = [
  {
    id: "support-ticket-triage",
    name: "Support ticket triage",
    description: "Routes incoming tickets by urgency and owning team.",
    tags: ["support", "routing", "json"],
    runIds: ["support-ticket-triage"],
    versions: [
      {
        version: "v4",
        note: "Added grounded-reason requirement",
        author: "Jordan Davis",
        edited: "2h ago",
        age: 2,
        score: 94.8,
        template:
          "You are a support triage specialist. Classify each ticket by urgency and team. Return valid JSON with urgency, team, and one concise reason grounded only in the ticket.\n\nTicket: {{ticket}}",
      },
      {
        version: "v3",
        note: "Switched to strict JSON output",
        author: "Maya Chen",
        edited: "3d ago",
        age: 72,
        score: 91.2,
        template:
          "You are a support triage specialist. Classify each ticket by urgency and team. Return valid JSON with urgency, team, and a short reason.\n\nTicket: {{ticket}}",
      },
      {
        version: "v2",
        note: "Added team routing",
        author: "Jordan Davis",
        edited: "last week",
        age: 168,
        score: 86.4,
        template:
          "Classify each support ticket by urgency (low, medium, high) and route it to the right team. Explain your answer.\n\nTicket: {{ticket}}",
      },
      {
        version: "v1",
        note: "Initial urgency classifier",
        author: "Alex Morgan",
        edited: "2 weeks ago",
        age: 336,
        score: 78.9,
        template:
          "Classify each support ticket by urgency: low, medium or high.\n\nTicket: {{ticket_text}}",
      },
    ],
  },
  {
    id: "concise-product-summary",
    name: "Concise product summary",
    description: "Two-sentence product summaries for non-technical buyers.",
    tags: ["product", "summary"],
    runIds: [],
    versions: [
      {
        version: "v2",
        note: "Limited output to two sentences",
        author: "Maya Chen",
        edited: "yesterday",
        age: 24,
        score: 89.2,
        template:
          "Summarize the product description in two sentences for a non-technical buyer. Lead with the main benefit and avoid marketing superlatives.\n\nProduct: {{description}}",
      },
      {
        version: "v1",
        note: "First draft",
        author: "Maya Chen",
        edited: "last week",
        age: 168,
        score: 83,
        template:
          "Write a short summary of this product for buyers.\n\nProduct: {{description}}",
      },
    ],
  },
  {
    id: "grounded-rag-answer",
    name: "Grounded RAG answer",
    description:
      "Answers questions strictly from retrieved passages, with citations.",
    tags: ["rag", "support", "citations"],
    runIds: ["rag-answer-quality"],
    versions: [
      {
        version: "v7",
        note: "Added explicit 'I don't know' fallback",
        author: "Jordan Davis",
        edited: "yesterday",
        age: 26,
        score: 92.1,
        template:
          "Answer the question using only the retrieved passages. Cite the source file for every claim. If the passages don't contain the answer, say you don't know.\n\nPassages: {{passages}}\nQuestion: {{question}}",
      },
      {
        version: "v6",
        note: "Required per-claim citations",
        author: "Alex Morgan",
        edited: "4d ago",
        age: 96,
        score: 90.3,
        template:
          "Answer the question using only the retrieved passages. Cite the source file for every claim.\n\nPassages: {{passages}}\nQuestion: {{question}}",
      },
      {
        version: "v5",
        note: "Shortened instructions",
        author: "Alex Morgan",
        edited: "last week",
        age: 170,
        score: 87.7,
        template:
          "Answer using the passages below.\n\nPassages: {{passages}}\nQuestion: {{question}}",
      },
    ],
  },
];

export const teams = ["Acme Research", "Platform AI", "Growth Lab"];

export type Model = {
  name: string;
  provider: string;
  cost: string;
  accuracy: string;
  kind: "general" | "classifier";
  latencyMs: number;
  keyValid: boolean;
};

export const models: Model[] = [
  {
    name: "Jev",
    provider: "refineAI",
    cost: "$0.02",
    accuracy: "96.1%",
    kind: "classifier",
    latencyMs: 140,
    keyValid: true,
  },
  {
    name: "GPT-4o",
    provider: "OpenAI",
    cost: "$0.42",
    accuracy: "94.8%",
    kind: "general",
    latencyMs: 410,
    keyValid: true,
  },
  {
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    cost: "$0.31",
    accuracy: "93.6%",
    kind: "general",
    latencyMs: 520,
    keyValid: true,
  },
  {
    name: "GPT-4o-mini",
    provider: "OpenAI",
    cost: "$0.08",
    accuracy: "89.2%",
    kind: "general",
    latencyMs: 260,
    keyValid: true,
  },
  {
    name: "Llama 3.1 70B",
    provider: "Meta",
    cost: "$0.18",
    accuracy: "87.4%",
    kind: "general",
    latencyMs: 680,
    keyValid: false,
  },
];

export const teamMembers = [
  { name: "Jordan Davis", email: "jordan@acme.co", role: "Admin" },
  { name: "Maya Chen", email: "maya@acme.co", role: "Member" },
  { name: "Alex Morgan", email: "alex@acme.co", role: "Member" },
];

export const datasets: Dataset[] = [
  {
    id: "support-tickets-v3",
    name: "Support tickets v3",
    examples: 2400,
    size: "1.2 MB",
    updated: "1d ago",
    columns: ["ticket_id", "text", "urgency", "team"],
    rows: [
      ["TK-1042", "Checkout fails on mobile", "high", "Payments"],
      ["TK-1043", "Need invoice copy", "low", "Billing"],
      ["TK-1044", "API request timing out", "medium", "Platform"],
      ["TK-1045", "Cancel my subscription", "low", "Billing"],
      ["TK-1046", "Cannot update card", "high", "Payments"],
      ["TK-1047", "Export is missing rows", "medium", "Platform"],
      ["TK-1048", "SSO login loops back to sign-in", "high", "Platform"],
      ["TK-1049", "Refund not received after 10 days", "medium", "Payments"],
      ["TK-1050", "How do I add a teammate?", "low", "Support"],
      ["TK-1051", "Webhook retries flooding our server", "high", "Platform"],
    ],
  },
  {
    id: "product-feedback-q2",
    name: "Product feedback — Q2",
    examples: 1120,
    size: "840 KB",
    updated: "2d ago",
    columns: ["feedback_id", "comment", "sentiment", "area"],
    rows: [
      ["FB-201", "Love the new dashboard filters", "positive", "Analytics"],
      ["FB-202", "Export to PDF keeps timing out", "negative", "Reporting"],
      [
        "FB-203",
        "Onboarding checklist was really helpful",
        "positive",
        "Onboarding",
      ],
      ["FB-204", "Pricing page is confusing for teams", "negative", "Billing"],
      ["FB-205", "Dark mode looks great", "positive", "UI"],
      ["FB-206", "Search doesn't find archived items", "negative", "Search"],
      ["FB-207", "Would like Slack notifications", "neutral", "Integrations"],
      ["FB-208", "Mobile app is fast and stable", "positive", "Mobile"],
    ],
  },
  {
    id: "knowledge-base-questions",
    name: "Knowledge base questions",
    examples: 840,
    size: "312 KB",
    updated: "3d ago",
    columns: ["question_id", "question", "expected_answer", "source"],
    rows: [
      [
        "KB-01",
        "How do I reset my password?",
        "Use the 'Forgot password' link on the sign-in page.",
        "auth.md",
      ],
      [
        "KB-02",
        "Can I change my billing cycle?",
        "Yes, switch between monthly and annual in Billing settings.",
        "billing.md",
      ],
      [
        "KB-03",
        "What file types can I import?",
        "CSV files up to 50 MB.",
        "imports.md",
      ],
      [
        "KB-04",
        "How long are logs retained?",
        "Logs are kept for 30 days on all plans.",
        "retention.md",
      ],
      [
        "KB-05",
        "Do you support SAML SSO?",
        "Yes, on the Scale plan and above.",
        "sso.md",
      ],
      [
        "KB-06",
        "How do I delete a workspace?",
        "An admin can delete it from General settings.",
        "workspaces.md",
      ],
      [
        "KB-07",
        "Is there an API rate limit?",
        "600 requests per minute per key.",
        "api.md",
      ],
      [
        "KB-08",
        "Can I invite external reviewers?",
        "Yes, as read-only guests.",
        "team.md",
      ],
    ],
  },
];
