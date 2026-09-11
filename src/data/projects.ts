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
    slug: "wield",
    name: "Wield",
    status: "active",
    statusLabel: "In active development, pre-MVP",
    tagline: "A portal-native Linux utility hub — global-hotkey command palette, rebuilt from a rethought scope.",
    repoUrl: "https://github.com/DhanushSantosh/Wield",
    problem:
      "Wield grew out of an earlier project (DeskCrafter) for creating and managing Linux desktop-entry files. Partway through, the intended use case changed to something different: a global-hotkey command palette and tray fronting quick utility actions — screen capture tools and file/data converters — built on XDG Desktop Portals so it works across desktop environments without per-DE code. Most of the old codebase was redundant under the new design, and the old name no longer matched what the project had become, so it restarted clean under a new name rather than carrying that mismatch forward.",
    audience:
      "Linux desktop users who want quick utility actions — screen capture, file/data conversion — available from one global-hotkey command palette, without tooling that only works on a specific desktop environment.",
    role: "Sole builder, as a personal project — rebuilt from scratch after the DeskCrafter scope changed.",
    decisions: [
      "Built on XDG Desktop Portals rather than per-desktop-environment integrations, so the same tool works across GNOME, KDE, and others without separate code paths for each.",
      "Split into a Rust workspace — wield-core (descriptor model, executor, tool registry), wield-portal (portal access and capability probing), wield-tools (built-in tool descriptors), wield-cli (a command-line surface) — with a Tauri + React desktop shell on top, instead of one monolithic app.",
      "Restarted as a new project rather than continuing to evolve DeskCrafter, once the scope had changed enough that most of the old codebase was redundant and the old name no longer matched what the project had become.",
    ],
    result:
      "Still in active development and not yet at an MVP — an ongoing process, stated plainly rather than dressed up as further along than it is.",
    constraints:
      "Early-stage and pre-MVP: the design is still being worked out, and scope or direction may keep changing before an MVP lands. No packaged release yet.",
    techStack: ["Rust", "Tauri", "React", "TypeScript"],
    screenshot: null,
  },
];

export const caseStudyLookup = new Map(caseStudies.map((study) => [study.slug, study] as const));
