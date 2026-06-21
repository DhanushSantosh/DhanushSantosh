import type { GitHubPortfolioData } from "@/lib/github";

type RestSourceInput = {
  complete: boolean;
  eventCount: number;
  hasUser: boolean;
  projectCount: number;
  starredRepoCount: number;
};

export function getRestPortfolioSource({
  complete,
  eventCount,
  hasUser,
  projectCount,
  starredRepoCount,
}: RestSourceInput): GitHubPortfolioData["source"] {
  const hasLiveData = hasUser || eventCount > 0 || projectCount > 0 || starredRepoCount > 0;
  if (!hasLiveData) return "unavailable";
  return complete ? "rest-fallback" : "live-partial";
}
