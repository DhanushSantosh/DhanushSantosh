export type ProjectOverrideConfig = {
  repo: `${string}/${string}`;
  liveUrl?: string;
  demoUrl?: string;
  summaryOverride?: string;
  accent?: string;
  hidden?: boolean;
};

export const projectOverrides: ProjectOverrideConfig[] = [
  {
    repo: "DhanushSantosh/DeskCrafter",
    accent: "Open Source",
  },
];

export const projectOverrideLookup = new Map(
  projectOverrides.map((project) => [project.repo.toLowerCase(), project] as const),
);
