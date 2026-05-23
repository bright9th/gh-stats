import { ContributorRecord } from "../../types/record.js";
import { loadJson } from "../../io/load-json.js";
import { writeProcessedSISO } from "../../io/write-processed.js";

const processName = "contributors";

export async function process(): Promise<void> {
  const raw = await loadJson<ContributorRecord[]>(
    `data/raw/${processName}.json`,
  );

  const repoMap = new Map<
    string,
    {
      contributors: number;
      contributions: number;
    }
  >();

  const contributorMap = new Map<
    string,
    {
      repos: number;
      contributions: number;
      type: string;
    }
  >();

  const typeMap = new Map<string, number>();

  let totalContributions = 0;

  const contributionCounts: number[] = [];

  const stats = raw.map((contributor) => {
    totalContributions += contributor.contributions;

    contributionCounts.push(contributor.contributions);

    typeMap.set(contributor.type, (typeMap.get(contributor.type) ?? 0) + 1);

    const repoStats = repoMap.get(contributor.repo);

    if (repoStats) {
      repoStats.contributors += 1;
      repoStats.contributions += contributor.contributions;
    } else {
      repoMap.set(contributor.repo, {
        contributors: 1,
        contributions: contributor.contributions,
      });
    }

    const contributorStats = contributorMap.get(contributor.login);

    if (contributorStats) {
      contributorStats.repos += 1;
      contributorStats.contributions += contributor.contributions;
    } else {
      contributorMap.set(contributor.login, {
        repos: 1,
        contributions: contributor.contributions,
        type: contributor.type,
      });
    }

    return {
      repo: contributor.repo,

      login: contributor.login,

      type: contributor.type,

      contributions: contributor.contributions,

      avatarUrl: contributor.avatar_url,

      htmlUrl: contributor.html_url,

      isBot: contributor.type.toLowerCase() === "bot",
    };
  });

  const repoStats = [...repoMap.entries()]
    .map(([repo, stats]) => ({
      repo,

      contributors: stats.contributors,

      contributions: stats.contributions,

      averageContributions:
        stats.contributors > 0 ? stats.contributions / stats.contributors : 0,
    }))
    .sort((a, b) => b.contributions - a.contributions);

  const contributorStats = [...contributorMap.entries()]
    .map(([login, stats]) => ({
      login,

      repos: stats.repos,

      contributions: stats.contributions,

      type: stats.type,

      averageContributionsPerRepo:
        stats.repos > 0 ? stats.contributions / stats.repos : 0,
    }))
    .sort((a, b) => b.contributions - a.contributions);

  const typeStats = [...typeMap.entries()]
    .map(([type, count]) => ({
      type,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const averageContributions =
    contributionCounts.length > 0
      ? contributionCounts.reduce((a, b) => a + b, 0) /
        contributionCounts.length
      : 0;

  const topContributors = [...contributorStats]
    .slice(0, 25)
    .map((contributor) => ({
      login: contributor.login,
      contributions: contributor.contributions,
      repos: contributor.repos,
    }));

  const topRepositories = [...repoStats].slice(0, 25).map((repo) => ({
    repo: repo.repo,
    contributions: repo.contributions,
    contributors: repo.contributors,
  }));

  await writeProcessedSISO(processName, {
    stats,

    overview: {
      totalContributorEntries: raw.length,

      uniqueContributors: contributorStats.length,

      uniqueRepositories: repoStats.length,

      totalContributions,

      averageContributions,
    },

    repos: repoStats,

    contributors: contributorStats,

    types: typeStats,

    topContributors,

    topRepositories,
  });
}
