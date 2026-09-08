// Hand-authored case studies for selected projects — real, verifiable content
// only. No invented metrics, adoption numbers, or outcomes; where a claim
// can't be backed up, it's left out rather than guessed at. Everything else
// on the site's Projects section stays purely GitHub-driven (see
// src/lib/github.ts and src/config/projectOverrides.ts); this file exists
// only for the handful of projects that warrant a real explanation beyond a
// repo description.

type ProjectStatus = "active" | "paused";

type CaseStudyScreenshot = {
  // Path under /public — a real screenshot of the actual live deployment
  // (see src/app/projects/[slug]/page.tsx's comment on how these were
  // captured), not a mockup or stock image standing in for the product.
  src: string;
  alt: string;
  capturedFrom: string;
};

export type CaseStudy = {
  slug: string;
  name: string;
  status: ProjectStatus;
  statusLabel: string;
  tagline: string;
  repoUrl: string;
  problem: string;
  audience: string;
  role: string;
  decisions: string[];
  result: string;
  constraints: string;
  techStack: string[];
  screenshot: CaseStudyScreenshot | null;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "agentcomms",
    name: "AgentComms",
    status: "active",
    statusLabel: "Actively developed",
    tagline: "Governed, event-sourced coordination for concurrent AI coding agents.",
    repoUrl: "https://github.com/DhanushSantosh/AgentComms",
    problem:
      "Coordinating several AI coding agents working on the same codebase at once is genuinely hard. The obvious first approach — have every agent read and write to one shared log file so the others can see what's happening — works for a day, then breaks down: the file grows without bound, agents start losing relevant context in the noise, and the models begin hallucinating state that was never actually true.",
    audience:
      "Developers and teams running multiple concurrent AI coding agents (Claude Code, Codex, OpenCode, and similar tools) against a shared codebase, who need real coordination instead of an ad hoc shared file.",
    role:
      "Sole builder. Started it during a six-week software development internship, after running into this exact coordination problem firsthand while trying to manage several agents by hand.",
    decisions: [
      "Event-sourced rather than a single mutable log: every action (a message, a task claim, a handoff) is its own signed, ordered event instead of an edit to one shared blob of text — so state is reconstructed from a real history, not inferred from whatever text happens to still be in the file.",
      "A governed identity model: every agent (and the human owner) registers as a signed principal with a role and explicit scopes, so an agent can't act outside what it's actually been granted — including a passphrase-gated elevated key for the handful of actions (like granting another agent's scope) that should require a human in the loop.",
      "Structured task lifecycle instead of free-text status updates: tasks are offered, claimed, leased with a renewable expiry and a working-directory lock, and handed off explicitly — so two agents can't silently step on the same work at the same time.",
    ],
    result:
      "Grew from a small personal fix into what the project now describes as its own app, with supporting features beyond the original CLI. It's the actual coordination layer behind this site's own multi-agent development workflow — the mechanism this portfolio's own recent updates were coordinated through was AgentComms itself.",
    constraints:
      "Built and used by one person so far, primarily for coordinating this developer's own concurrent-agent workflows; it hasn't been used by a team or published for wider adoption yet.",
    techStack: ["Go"],
    screenshot: {
      src: "/case-studies/agentcomms.png",
      alt: "The Agent Comms landing page: \"Let agents work at once — Keep the project in one piece,\" with Install / Read the operating model calls to action.",
      capturedFrom: "https://agentcomms-cli.vercel.app",
    },
  },
  {
    slug: "deskcrafter",
    name: "DeskCrafter",
    status: "paused",
    statusLabel: "Early-stage, currently paused",
    tagline: "An early-stage Linux desktop-entry tool, on hold while its direction gets rethought.",
    repoUrl: "https://github.com/DhanushSantosh/DeskCrafter",
    problem:
      "Creating and managing custom .desktop entries on Linux is a manual, fiddly process. DeskCrafter started as a friendlier way to create, manage, and launch them, with an early ambition of growing into a broader toolbox of task-specific tools across the Linux desktop.",
    audience: "Linux desktop users who want an easier way to create and manage custom app launchers.",
    role: "Sole builder, as a personal/learning project.",
    decisions: [
      "This is being stated plainly rather than dressed up: the broader \"toolbox suite\" direction was never fully committed to, and the project has been paused while that direction gets rethought.",
    ],
    result:
      "Currently paused. It exists as a real, working desktop-entry tool, not the broader toolbox it was originally scoped toward — that expansion hasn't happened yet.",
    constraints:
      "Early-stage and not under active development right now. Treat it as a snapshot of an idea in progress, not a finished product.",
    techStack: ["Python", "PyQt5", "Shell"],
    screenshot: {
      src: "/case-studies/deskcrafter.png",
      alt: "The DeskCrafter landing page: \"An action-first Linux desktop integration and repair suite for launchers, startup entries, defaults, sandboxes, and service fixes.\"",
      capturedFrom: "https://deskcrafter-site.vercel.app",
    },
  },
];

export const caseStudyLookup = new Map(caseStudies.map((study) => [study.slug, study] as const));
