export type ProjectOverrideConfig = {
  repo: `${string}/${string}`;
  liveUrl?: string;
  demoUrl?: string;
  summaryOverride?: string;
  accent?: string;
  hidden?: boolean;
  // Slug into src/data/projects.ts's caseStudies — set only for the handful
  // of projects with a real, hand-authored case study and its own /projects
  // page, per Quill's audit finding that featured projects had no stable,
  // detailed URL of their own.
  caseStudySlug?: string;
};

const projectOverrides: ProjectOverrideConfig[] = [
  {
    repo: "DhanushSantosh/DhanushSantosh",
    hidden: true,
  },
  {
    repo: "DhanushSantosh/AgentComms",
    caseStudySlug: "agentcomms",
  },
  {
    repo: "DhanushSantosh/DeskCrafter",
    caseStudySlug: "deskcrafter",
  },
];

export const projectOverrideLookup = new Map(
  projectOverrides.map((project) => [project.repo.toLowerCase(), project] as const),
);
