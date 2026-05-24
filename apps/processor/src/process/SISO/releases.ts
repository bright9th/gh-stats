import { ReleaseRecord } from "../../types/record.js";
import { loadJson } from "@gh-stats/io";
import { writeProcessedSISO } from "../../io/write-processed.js";
import { daysBetween } from "../utils/date.js";

const processName = "releases";

function detectVersionType(tag: string): "major" | "minor" | "patch" | "other" {
  const match = tag.match(/^v?(\d+)\.(\d+)\.(\d+)/);

  if (!match) {
    return "other";
  }

  const [, major, minor, patch] = match;

  if (patch !== "0") {
    return "patch";
  }

  if (minor !== "0") {
    return "minor";
  }

  if (major !== "0") {
    return "major";
  }

  return "other";
}

export async function process(): Promise<void> {
  const raw = await loadJson<ReleaseRecord[]>(
    `../../data/raw/${processName}.json`,
  );

  const now = new Date();

  const repoMap = new Map<
    string,
    {
      total: number;
      drafts: number;
      prereleases: number;
      published: number;
    }
  >();

  const authorMap = new Map<string, number>();

  const versionTypeMap = new Map<string, number>();

  const creationYears = new Map<number, number>();

  let draftCount = 0;

  let prereleaseCount = 0;

  let publishedCount = 0;

  const releaseAges: number[] = [];

  const publishDelays: number[] = [];

  const stats = raw.map((release) => {
    const createdAt = new Date(release.created_at);

    const publishedAt = release.published_at
      ? new Date(release.published_at)
      : null;

    const ageDays = daysBetween(createdAt, now);

    const publishDelayDays =
      publishedAt !== null ? daysBetween(createdAt, publishedAt) : null;

    releaseAges.push(ageDays);

    if (publishDelayDays !== null) {
      publishDelays.push(publishDelayDays);
    }

    if (release.draft) {
      draftCount++;
    }

    if (release.prerelease) {
      prereleaseCount++;
    }

    if (publishedAt !== null) {
      publishedCount++;
    }

    const repoStats = repoMap.get(release.repo);

    if (repoStats) {
      repoStats.total += 1;

      if (release.draft) {
        repoStats.drafts += 1;
      }

      if (release.prerelease) {
        repoStats.prereleases += 1;
      }

      if (publishedAt !== null) {
        repoStats.published += 1;
      }
    } else {
      repoMap.set(release.repo, {
        total: 1,
        drafts: release.draft ? 1 : 0,
        prereleases: release.prerelease ? 1 : 0,
        published: publishedAt !== null ? 1 : 0,
      });
    }

    if (release.author !== null) {
      authorMap.set(release.author, (authorMap.get(release.author) ?? 0) + 1);
    }

    const versionType = detectVersionType(release.tag_name);

    versionTypeMap.set(versionType, (versionTypeMap.get(versionType) ?? 0) + 1);

    const year = createdAt.getUTCFullYear();

    creationYears.set(year, (creationYears.get(year) ?? 0) + 1);

    return {
      id: release.id,

      repo: release.repo,

      tagName: release.tag_name,

      name: release.name,

      author: release.author,

      draft: release.draft,

      prerelease: release.prerelease,

      published: release.published_at !== null,

      createdYear: year,

      ageDays,

      publishDelayDays,

      versionType,

      bodyLength: release.body?.length ?? 0,

      hasBody: release.body !== null,
    };
  });

  const repoStats = [...repoMap.entries()]
    .map(([repo, stats]) => ({
      repo,

      totalReleases: stats.total,

      drafts: stats.drafts,

      prereleases: stats.prereleases,

      published: stats.published,

      publishRate: stats.total > 0 ? stats.published / stats.total : 0,
    }))
    .sort((a, b) => b.totalReleases - a.totalReleases);

  const authorStats = [...authorMap.entries()]
    .map(([author, count]) => ({
      author,
      releases: count,
    }))
    .sort((a, b) => b.releases - a.releases);

  const versionTypeStats = [...versionTypeMap.entries()]
    .map(([versionType, count]) => ({
      versionType,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const creationTimeline = [...creationYears.entries()]
    .map(([year, releases]) => ({
      year,
      releases,
    }))
    .sort((a, b) => a.year - b.year);

  const averageReleaseAgeDays =
    releaseAges.length > 0
      ? releaseAges.reduce((a, b) => a + b, 0) / releaseAges.length
      : 0;

  const averagePublishDelayDays =
    publishDelays.length > 0
      ? publishDelays.reduce((a, b) => a + b, 0) / publishDelays.length
      : 0;

  const topLongestReleaseNotes = [...stats]
    .sort((a, b) => b.bodyLength - a.bodyLength)
    .slice(0, 25)
    .map((release) => ({
      repo: release.repo,
      tagName: release.tagName,
      bodyLength: release.bodyLength,
    }));

  await writeProcessedSISO(processName, {
    stats,

    overview: {
      totalReleases: raw.length,

      drafts: draftCount,

      prereleases: prereleaseCount,

      published: publishedCount,

      averageReleaseAgeDays,

      averagePublishDelayDays,

      publishRate: raw.length > 0 ? publishedCount / raw.length : 0,
    },

    repos: repoStats,

    authors: authorStats,

    versionTypes: versionTypeStats,

    creationTimeline,

    topLongestReleaseNotes,
  });
}
