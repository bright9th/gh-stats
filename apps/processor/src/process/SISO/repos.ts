import { RepoRecord } from "../../types/record.js";
import { loadJson } from "@gh-stats/io";
import { writeProcessedSISO } from "../../io/write-processed.js";
import { daysBetween } from "../utils/date.js";

const processName = "repos";

export async function process(): Promise<void> {
  const raw = await loadJson<RepoRecord[]>(
    `../../data/raw/${processName}.json`,
  );

  const now = new Date();

  const languageMap = new Map<
    string,
    {
      repos: number;
      stars: number;
      forks: number;
    }
  >();

  let totalStars = 0;
  let totalForks = 0;
  let archivedCount = 0;
  let activeCount = 0;

  const repoAges: number[] = [];
  const updateAges: number[] = [];
  const pushAges: number[] = [];

  const creationYears = new Map<number, number>();

  const topStarred = [...raw]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 10)
    .map((repo) => ({
      repo: repo.name,
      stars: repo.stargazers_count,
    }));

  const topForked = [...raw]
    .sort((a, b) => b.forks_count - a.forks_count)
    .slice(0, 10)
    .map((repo) => ({
      repo: repo.name,
      forks: repo.forks_count,
    }));

  const repoStats = raw.map((repo) => {
    const createdAt = new Date(repo.created_at);
    const updatedAt = new Date(repo.updated_at);

    const pushedAt = repo.pushed_at ? new Date(repo.pushed_at) : null;

    const ageDays = daysBetween(createdAt, now);
    const updatedDaysAgo = daysBetween(updatedAt, now);

    const pushedDaysAgo = pushedAt ? daysBetween(pushedAt, now) : null;

    totalStars += repo.stargazers_count;
    totalForks += repo.forks_count;

    if (repo.archived) archivedCount++;
    else activeCount++;

    repoAges.push(ageDays);
    updateAges.push(updatedDaysAgo);

    if (pushedDaysAgo !== null) {
      pushAges.push(pushedDaysAgo);
    }

    const year = createdAt.getUTCFullYear();

    creationYears.set(year, (creationYears.get(year) ?? 0) + 1);

    const language = repo.language ?? "Unknown";

    const existingLanguage = languageMap.get(language);

    if (existingLanguage) {
      existingLanguage.repos += 1;
      existingLanguage.stars += repo.stargazers_count;
      existingLanguage.forks += repo.forks_count;
    } else {
      languageMap.set(language, {
        repos: 1,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
      });
    }

    return {
      repo: repo.name,

      owner: repo.owner,

      language: repo.language,

      archived: repo.archived,

      private: repo.private,

      stars: repo.stargazers_count,
      forks: repo.forks_count,

      starForkRatio:
        repo.forks_count > 0 ? repo.stargazers_count / repo.forks_count : null,

      ageDays,
      updatedDaysAgo,
      pushedDaysAgo,

      createdYear: year,

      hasDescription: repo.description !== null,

      isStale: pushedDaysAgo !== null ? pushedDaysAgo > 180 : true,
    };
  });

  const averageRepoAgeDays =
    repoAges.length > 0
      ? repoAges.reduce((a, b) => a + b, 0) / repoAges.length
      : 0;

  const averageUpdatedDays =
    updateAges.length > 0
      ? updateAges.reduce((a, b) => a + b, 0) / updateAges.length
      : 0;

  const averagePushDays =
    pushAges.length > 0
      ? pushAges.reduce((a, b) => a + b, 0) / pushAges.length
      : 0;

  const languageStats = [...languageMap.entries()]
    .map(([language, stats]) => ({
      language,
      repos: stats.repos,
      stars: stats.stars,
      forks: stats.forks,
      averageStars: stats.repos > 0 ? stats.stars / stats.repos : 0,
      averageForks: stats.repos > 0 ? stats.forks / stats.repos : 0,
    }))
    .sort((a, b) => b.repos - a.repos);

  const creationTimeline = [...creationYears.entries()]
    .map(([year, count]) => ({
      year,
      repos: count,
    }))
    .sort((a, b) => a.year - b.year);

  await writeProcessedSISO(processName, {
    stats: repoStats,

    overview: {
      totalRepos: raw.length,

      activeRepos: activeCount,
      archivedRepos: archivedCount,

      totalStars,
      totalForks,

      averageStars: raw.length > 0 ? totalStars / raw.length : 0,

      averageForks: raw.length > 0 ? totalForks / raw.length : 0,

      averageRepoAgeDays,
      averageUpdatedDays,
      averagePushDays,
    },

    languages: languageStats,

    topStarred,
    topForked,

    creationTimeline,
  });
}
