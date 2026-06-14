export type FeaturedRepoConfig = {
  repo?: `${string}/${string}`;
  order: number;
  titleOverride?: string;
  liveUrl?: string;
  demoUrl?: string;
  summaryOverride?: string;
  stackOverride?: string[];
  accent?: string;
  hidden?: boolean;
};

export const featuredRepos: FeaturedRepoConfig[] = [
  {
    order: 0,
    titleOverride: "Intellex",
    liveUrl: "https://intellex.xerocore.in",
    summaryOverride:
      "An AI-powered research assistant with multi-agent orchestration, structured planning, and workspace-based research management. Features guided research workflows, real-time chat interfaces, and provenance tracking.",
    stackOverride: ["Next.js", "TypeScript", "FastAPI", "Python", "Tailwind CSS", "Zustand"],
    accent: "Flagship Build",
  },
  {
    repo: "DhanushSantosh/DeskCrafter",
    order: 1,
    demoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    summaryOverride:
      "A beautiful, user-friendly Linux app for creating, managing, and launching custom desktop entries.",
    stackOverride: ["TypeScript", "Rust", "Tauri", "React", "Linux"],
    accent: "Open Source",
  },
];

export const featuredRepoLookup = new Set(
  featuredRepos.flatMap((project) => (project.repo ? [project.repo.toLowerCase()] : [])),
);
