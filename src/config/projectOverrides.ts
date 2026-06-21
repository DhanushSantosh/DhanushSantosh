export type ProjectOverrideConfig = {
  repo: `${string}/${string}`;
  liveUrl?: string;
  demoUrl?: string;
  summaryOverride?: string;
  accent?: string;
  hidden?: boolean;
};

const projectOverrides: ProjectOverrideConfig[] = [
  {
    repo: "DhanushSantosh/DhanushSantosh",
    hidden: true,
  },
];

export const projectOverrideLookup = new Map(
  projectOverrides.map((project) => [project.repo.toLowerCase(), project] as const),
);
