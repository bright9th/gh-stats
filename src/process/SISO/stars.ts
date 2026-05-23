import { StarRecord } from "../../types/record.js";
import { loadJson } from "../../io/load-json.js";
import { writeProcessedSISO } from "../../io/write-processed.js";
import { daysBetween } from "../utils/date.js";

const processName = "stars";

export async function process(): Promise<void> {
  const raw = await loadJson<StarRecord[]>(`data/raw/${processName}.json`);

  const now = new Date();

  const languageMap = new Map<
    string,
    {
      repos: number;
      totalRepoStars: number;
      totalRepoForks: number;
    }
  >();

  const ownerMap = new Map<
    string,
    {
      repos: number;
      totalRepoStars: number;
    }
  >();

  const creationYears = new Map<number, number>();

  let archivedCount = 0;

  let totalRepoStars = 0;
  let totalRepoForks = 0;

  const repoAges: number[] = [];
  const pushAges: number[] = [];

  const topStarredRepos = [...raw]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 25)
    .map((repo) => ({
      repo: repo.full_name,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
    }));

  const stats = raw.map((repo) => {
    const createdAt = new Date(repo.created_at);

    const pushedAt = repo.pushed_at ? new Date(repo.pushed_at) : null;

    const ageDays = daysBetween(createdAt, now);

    const pushedDaysAgo = pushedAt ? daysBetween(pushedAt, now) : null;

    totalRepoStars += repo.stargazers_count;
    totalRepoForks += repo.forks_count;

    repoAges.push(ageDays);

    if (pushedDaysAgo !== null) {
      pushAges.push(pushedDaysAgo);
    }

    if (repo.archived) {
      archivedCount++;
    }

    const year = createdAt.getUTCFullYear();

    creationYears.set(year, (creationYears.get(year) ?? 0) + 1);

    const language = repo.language ?? "Unknown";

    const existingLanguage = languageMap.get(language);

    if (existingLanguage) {
      existingLanguage.repos += 1;
      existingLanguage.totalRepoStars += repo.stargazers_count;
      existingLanguage.totalRepoForks += repo.forks_count;
    } else {
      languageMap.set(language, {
        repos: 1,
        totalRepoStars: repo.stargazers_count,
        totalRepoForks: repo.forks_count,
      });
    }

    const existingOwner = ownerMap.get(repo.owner);

    if (existingOwner) {
      existingOwner.repos += 1;
      existingOwner.totalRepoStars += repo.stargazers_count;
    } else {
      ownerMap.set(repo.owner, {
        repos: 1,
        totalRepoStars: repo.stargazers_count,
      });
    }

    return {
      repo: repo.full_name,

      owner: repo.owner,

      language: repo.language,

      archived: repo.archived,

      stars: repo.stargazers_count,
      forks: repo.forks_count,

      starForkRatio:
        repo.forks_count > 0 ? repo.stargazers_count / repo.forks_count : null,

      ageDays,
      pushedDaysAgo,

      createdYear: year,

      popularityScore: repo.stargazers_count + repo.forks_count * 2,

      activityScore:
        pushedDaysAgo !== null ? Math.max(0, 365 - pushedDaysAgo) : 0,
    };
  });

  const languageStats = [...languageMap.entries()]
    .map(([language, stats]) => ({
      language,

      repos: stats.repos,

      totalRepoStars: stats.totalRepoStars,
      totalRepoForks: stats.totalRepoForks,

      averageRepoStars:
        stats.repos > 0 ? stats.totalRepoStars / stats.repos : 0,

      averageRepoForks:
        stats.repos > 0 ? stats.totalRepoForks / stats.repos : 0,
    }))
    .sort((a, b) => b.repos - a.repos);

  const ownerStats = [...ownerMap.entries()]
    .map(([owner, stats]) => ({
      owner,

      repos: stats.repos,

      totalRepoStars: stats.totalRepoStars,

      averageRepoStars:
        stats.repos > 0 ? stats.totalRepoStars / stats.repos : 0,
    }))
    .sort((a, b) => b.totalRepoStars - a.totalRepoStars);

  const creationTimeline = [...creationYears.entries()]
    .map(([year, repos]) => ({
      year,
      repos,
    }))
    .sort((a, b) => a.year - b.year);

  const averageRepoAgeDays =
    repoAges.length > 0
      ? repoAges.reduce((a, b) => a + b, 0) / repoAges.length
      : 0;

  const averagePushDays =
    pushAges.length > 0
      ? pushAges.reduce((a, b) => a + b, 0) / pushAges.length
      : 0;

  await writeProcessedSISO(processName, {
    stats,

    overview: {
      totalStarredRepos: raw.length,

      archivedRepos: archivedCount,
      activeRepos: raw.length - archivedCount,

      totalRepoStars,
      totalRepoForks,

      averageRepoStars: raw.length > 0 ? totalRepoStars / raw.length : 0,

      averageRepoForks: raw.length > 0 ? totalRepoForks / raw.length : 0,

      averageRepoAgeDays,
      averagePushDays,
    },

    languages: languageStats,

    owners: ownerStats,

    topStarredRepos,

    creationTimeline,
  });
}
