import { TagRecord } from "../../types/record.js";
import { loadJson } from "@gh-stats/io";
import { writeProcessedSISO } from "../../io/write-processed.js";
import { detectVersionType } from "../utils/version.js";

const processName = "tags";

export async function process(): Promise<void> {
  const raw = await loadJson<TagRecord[]>(`../../data/raw/${processName}.json`);

  const repoMap = new Map<
    string,
    {
      tags: number;
    }
  >();

  const commitMap = new Map<string, number>();

  const versionTypeMap = new Map<string, number>();

  const prefixMap = new Map<string, number>();

  const stats = raw.map((tag) => {
    const versionType = detectVersionType(tag.name);

    versionTypeMap.set(versionType, (versionTypeMap.get(versionType) ?? 0) + 1);

    const prefix = tag.name.split(/[\d.-]/)[0] || "none";

    prefixMap.set(prefix, (prefixMap.get(prefix) ?? 0) + 1);

    const repoStats = repoMap.get(tag.repo);

    if (repoStats) {
      repoStats.tags += 1;
    } else {
      repoMap.set(tag.repo, {
        tags: 1,
      });
    }

    commitMap.set(tag.commit_sha, (commitMap.get(tag.commit_sha) ?? 0) + 1);

    return {
      repo: tag.repo,

      name: tag.name,

      commitSha: tag.commit_sha,

      nodeId: tag.node_id,

      versionType,

      prefix,

      nameLength: tag.name.length,

      isSemanticVersion: versionType !== "other",
    };
  });

  const repoStats = [...repoMap.entries()]
    .map(([repo, stats]) => ({
      repo,
      tags: stats.tags,
    }))
    .sort((a, b) => b.tags - a.tags);

  const commitStats = [...commitMap.entries()]
    .map(([commitSha, tags]) => ({
      commitSha,
      tags,
    }))
    .sort((a, b) => b.tags - a.tags);

  const versionTypeStats = [...versionTypeMap.entries()]
    .map(([versionType, count]) => ({
      versionType,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const prefixStats = [...prefixMap.entries()]
    .map(([prefix, count]) => ({
      prefix,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const topRepositories = [...repoStats].slice(0, 25).map((repo) => ({
    repo: repo.repo,
    tags: repo.tags,
  }));

  const sharedCommitTags = [...commitStats]
    .filter((commit) => commit.tags > 1)
    .slice(0, 25);

  const longestTagNames = [...stats]
    .sort((a, b) => b.nameLength - a.nameLength)
    .slice(0, 25)
    .map((tag) => ({
      repo: tag.repo,
      name: tag.name,
      nameLength: tag.nameLength,
    }));

  await writeProcessedSISO(processName, {
    stats,

    overview: {
      totalTags: raw.length,

      semanticVersionTags: stats.filter((tag) => tag.isSemanticVersion).length,

      nonSemanticVersionTags: stats.filter((tag) => !tag.isSemanticVersion)
        .length,

      uniqueRepositories: repoStats.length,

      uniquePrefixes: prefixStats.length,
    },

    repos: repoStats,

    commits: commitStats,

    versionTypes: versionTypeStats,

    prefixes: prefixStats,

    topRepositories,

    sharedCommitTags,

    longestTagNames,
  });
}
