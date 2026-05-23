import { LanguageRecord } from "../../types/record.js";
import { loadJson } from "../../io/load-json.js";
import { writeProcessedSISO } from "../../io/write-processed.js";

const processName = "languages";

export async function process(): Promise<void> {
  const raw = await loadJson<LanguageRecord[]>(`data/raw/${processName}.json`);

  const repoMap = new Map<
    string,
    {
      totalBytes: number;
      languages: number;
    }
  >();

  const languageMap = new Map<
    string,
    {
      repos: number;
      bytes: number;
    }
  >();

  let totalBytes = 0;

  const byteCounts: number[] = [];

  const stats = raw.map((language) => {
    totalBytes += language.bytes;

    byteCounts.push(language.bytes);

    const repoStats = repoMap.get(language.repo);

    if (repoStats) {
      repoStats.totalBytes += language.bytes;
      repoStats.languages += 1;
    } else {
      repoMap.set(language.repo, {
        totalBytes: language.bytes,
        languages: 1,
      });
    }

    const languageStats = languageMap.get(language.language);

    if (languageStats) {
      languageStats.repos += 1;
      languageStats.bytes += language.bytes;
    } else {
      languageMap.set(language.language, {
        repos: 1,
        bytes: language.bytes,
      });
    }

    return {
      repo: language.repo,

      language: language.language,

      bytes: language.bytes,
    };
  });

  const repoStats = [...repoMap.entries()]
    .map(([repo, stats]) => ({
      repo,

      totalBytes: stats.totalBytes,

      languages: stats.languages,

      averageBytesPerLanguage:
        stats.languages > 0 ? stats.totalBytes / stats.languages : 0,
    }))
    .sort((a, b) => b.totalBytes - a.totalBytes);

  const languageStats = [...languageMap.entries()]
    .map(([language, stats]) => ({
      language,

      repos: stats.repos,

      bytes: stats.bytes,

      byteShare: totalBytes > 0 ? stats.bytes / totalBytes : 0,

      averageBytesPerRepo: stats.repos > 0 ? stats.bytes / stats.repos : 0,
    }))
    .sort((a, b) => b.bytes - a.bytes);

  const averageBytes =
    byteCounts.length > 0
      ? byteCounts.reduce((a, b) => a + b, 0) / byteCounts.length
      : 0;

  const topLanguages = [...languageStats].slice(0, 25).map((language) => ({
    language: language.language,
    bytes: language.bytes,
    repos: language.repos,
    byteShare: language.byteShare,
  }));

  const topRepositories = [...repoStats].slice(0, 25).map((repo) => ({
    repo: repo.repo,
    totalBytes: repo.totalBytes,
    languages: repo.languages,
  }));

  await writeProcessedSISO(processName, {
    stats,

    overview: {
      totalLanguageEntries: raw.length,

      uniqueLanguages: languageStats.length,

      uniqueRepositories: repoStats.length,

      totalBytes,

      averageBytes,
    },

    repos: repoStats,

    languages: languageStats,

    topLanguages,

    topRepositories,
  });
}
