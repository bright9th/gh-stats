import { CommitStatRecord } from "../../types/record.js";
import { loadJson } from "../../io/load-json.js";
import { writeProcessedSISO } from "../../io/write-processed.js";

const processName = "commit-stats";

export async function process(): Promise<void> {
  const raw = await loadJson<CommitStatRecord[]>(
    `data/raw/${processName}.json`,
  );

  const repoMap = new Map<
    string,
    {
      commits: Set<string>;
      additions: number;
      deletions: number;
      changes: number;
      files: number;
    }
  >();

  const commitMap = new Map<
    string,
    {
      repo: string;
      additions: number;
      deletions: number;
      changes: number;
      files: number;
    }
  >();

  const fileMap = new Map<
    string,
    {
      changes: number;
      additions: number;
      deletions: number;
      commits: number;
    }
  >();

  const statusMap = new Map<string, number>();

  const extensionMap = new Map<
    string,
    {
      files: number;
      changes: number;
    }
  >();

  let totalAdditions = 0;

  let totalDeletions = 0;

  let totalChanges = 0;

  let totalFiles = 0;

  const stats = raw.map((record) => {
    totalAdditions += record.file_additions;

    totalDeletions += record.file_deletions;

    totalChanges += record.file_changes;

    totalFiles++;

    const repoStats = repoMap.get(record.repo);

    if (repoStats) {
      repoStats.commits.add(record.sha);

      repoStats.additions += record.file_additions;

      repoStats.deletions += record.file_deletions;

      repoStats.changes += record.file_changes;

      repoStats.files += 1;
    } else {
      repoMap.set(record.repo, {
        commits: new Set([record.sha]),

        additions: record.file_additions,

        deletions: record.file_deletions,

        changes: record.file_changes,

        files: 1,
      });
    }

    const commitStats = commitMap.get(record.sha);

    if (commitStats) {
      commitStats.additions += record.file_additions;

      commitStats.deletions += record.file_deletions;

      commitStats.changes += record.file_changes;

      commitStats.files += 1;
    } else {
      commitMap.set(record.sha, {
        repo: record.repo,

        additions: record.file_additions,

        deletions: record.file_deletions,

        changes: record.file_changes,

        files: 1,
      });
    }

    const fileStats = fileMap.get(record.filename);

    if (fileStats) {
      fileStats.changes += record.file_changes;

      fileStats.additions += record.file_additions;

      fileStats.deletions += record.file_deletions;

      fileStats.commits += 1;
    } else {
      fileMap.set(record.filename, {
        changes: record.file_changes,

        additions: record.file_additions,

        deletions: record.file_deletions,

        commits: 1,
      });
    }

    statusMap.set(record.status, (statusMap.get(record.status) ?? 0) + 1);

    const extension = record.filename.includes(".")
      ? (record.filename.split(".").pop()?.toLowerCase() ?? "unknown")
      : "none";

    const extensionStats = extensionMap.get(extension);

    if (extensionStats) {
      extensionStats.files += 1;

      extensionStats.changes += record.file_changes;
    } else {
      extensionMap.set(extension, {
        files: 1,
        changes: record.file_changes,
      });
    }

    return {
      repo: record.repo,

      sha: record.sha,

      filename: record.filename,

      status: record.status,

      additions: record.file_additions,

      deletions: record.file_deletions,

      changes: record.file_changes,

      changedFiles: record.changed_files,

      extension,

      filenameLength: record.filename.length,

      netChanges: record.file_additions - record.file_deletions,

      isBinary:
        extension === "png" ||
        extension === "jpg" ||
        extension === "jpeg" ||
        extension === "gif" ||
        extension === "webp" ||
        extension === "ico",
    };
  });

  const repoStats = [...repoMap.entries()]
    .map(([repo, stats]) => ({
      repo,

      commits: stats.commits.size,

      files: stats.files,

      additions: stats.additions,

      deletions: stats.deletions,

      changes: stats.changes,

      averageChangesPerFile: stats.files > 0 ? stats.changes / stats.files : 0,
    }))
    .sort((a, b) => b.changes - a.changes);

  const commitStats = [...commitMap.entries()]
    .map(([sha, stats]) => ({
      sha,

      repo: stats.repo,

      files: stats.files,

      additions: stats.additions,

      deletions: stats.deletions,

      changes: stats.changes,

      netChanges: stats.additions - stats.deletions,
    }))
    .sort((a, b) => b.changes - a.changes);

  const fileStats = [...fileMap.entries()]
    .map(([filename, stats]) => ({
      filename,

      commits: stats.commits,

      additions: stats.additions,

      deletions: stats.deletions,

      changes: stats.changes,
    }))
    .sort((a, b) => b.changes - a.changes);

  const statusStats = [...statusMap.entries()]
    .map(([status, count]) => ({
      status,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const extensionStats = [...extensionMap.entries()]
    .map(([extension, stats]) => ({
      extension,

      files: stats.files,

      changes: stats.changes,

      averageChanges: stats.files > 0 ? stats.changes / stats.files : 0,
    }))
    .sort((a, b) => b.changes - a.changes);

  const topRepositories = [...repoStats].slice(0, 25).map((repo) => ({
    repo: repo.repo,
    changes: repo.changes,
    files: repo.files,
  }));

  const largestCommits = [...commitStats].slice(0, 25).map((commit) => ({
    sha: commit.sha,
    repo: commit.repo,
    changes: commit.changes,
    files: commit.files,
  }));

  const mostChangedFiles = [...fileStats].slice(0, 25).map((file) => ({
    filename: file.filename,
    changes: file.changes,
    commits: file.commits,
  }));

  await writeProcessedSISO(processName, {
    stats,

    overview: {
      totalRecords: raw.length,

      totalAdditions,

      totalDeletions,

      totalChanges,

      totalFiles,

      netChanges: totalAdditions - totalDeletions,

      uniqueRepositories: repoStats.length,

      uniqueCommits: commitStats.length,

      uniqueFiles: fileStats.length,

      uniqueExtensions: extensionStats.length,
    },

    repos: repoStats,

    commits: commitStats,

    files: fileStats,

    statuses: statusStats,

    extensions: extensionStats,

    topRepositories,

    largestCommits,

    mostChangedFiles,
  });
}
